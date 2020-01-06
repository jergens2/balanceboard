import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeSpanItem } from '../api/data-items/time-span-item.interface';
import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogZoomControl } from '../widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-control.interface';

export class DaybookTimelogController {
    constructor(dateYYYYMMDD: string, timelogEntryDataItems: DaybookTimelogEntryDataItem[], sleepTimes?: TimeSpanItem[]) {
        // console.log("Rebuilding Timelog Controller")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timelogEntryItems = timelogEntryDataItems.map((item) => {
            return this._buildTimelogEntryFromDataItem(item);
        });
        this._buildActivityTimes();
    }

    private _dateYYYYMMDD: string;
    private _timelogEntryItems: TimelogEntryItem[];
    // private _sleepTimes: TimeSpanItem[];

    private _timelogActionComplete$: Subject<boolean> = new Subject();

    private _activityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[] = [];

    private _timelogUpdated$: Subject<
        {
            prevDayItems: DaybookTimelogEntryDataItem[],
            thisDayItems: DaybookTimelogEntryDataItem[],
            nextDayItems: DaybookTimelogEntryDataItem[],
        }> = new Subject();

    public get lastTimelogEntryItemTime(): moment.Moment {
        if (this._timelogEntryItems.length > 0) {
            return moment(this._timelogEntryItems[this._timelogEntryItems.length - 1].endTime);
        } else {
            return null
        }
    }

    public getColumnAvailability(zoomController: TimelogZoomControl): { startTime: moment.Moment, endTime: moment.Moment, isActive: boolean }[] {

        let columnAvailability: { startTime: moment.Moment, endTime: moment.Moment, isActive: boolean }[] = [];
        
        let startIndex: number = this._activityTimes.findIndex(item =>{
            return zoomController.startTime.isSameOrAfter(item.start) && zoomController.startTime.isSameOrBefore(item.end)
        });
        let endIndex: number = this._activityTimes.findIndex(item =>{
            return zoomController.endTime.isSameOrAfter(item.start) && zoomController.endTime.isSameOrBefore(item.end)
        });
        
        if(startIndex < 0 || endIndex < 0){
            console.log("Error with _activityTimes");
        }else{
            if(startIndex === endIndex){
                columnAvailability = [{
                    startTime: zoomController.startTime,
                    endTime: zoomController.endTime,
                    isActive: this._activityTimes[startIndex].isActive,
                }];
            }else if(startIndex < endIndex){
                for(let i=startIndex; i<= endIndex; i++){
                    if(i === startIndex){
                        columnAvailability.push({
                            startTime: zoomController.startTime,
                            endTime: this._activityTimes[i].end,
                            isActive: this._activityTimes[i].isActive,
                        });
                    }else if(i === endIndex){
                        columnAvailability.push({
                            startTime: this._activityTimes[i].start,
                            endTime: zoomController.endTime,
                            isActive: this._activityTimes[i].isActive,
                        });
                        
                    }else{
                        columnAvailability.push({
                            startTime: this._activityTimes[i].start,
                            endTime: this._activityTimes[i].end,
                            isActive: this._activityTimes[i].isActive,
                        });
                    }
                }
            }else{
                console.log("error with indexes")
            }
            
        }
        return columnAvailability;
    }


    public get prevDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).format('YYYY-MM-DD'); }
    public get nextDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }
    public get endOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }

    public get startOfPrevDate(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    public get endOfNextDate(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(24, 'hours'); }


    public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }

    public getNewTLEStartTime(wakeupTime: moment.Moment): moment.Moment {
        const filteredItems = this.timelogEntryItems.filter((item) => {
            return item.startTime.isSameOrAfter(wakeupTime) && item.endTime.isSameOrBefore(this.endOfThisDay)
        });
        if (filteredItems.length > 0) {
            return filteredItems[filteredItems.length - 1].endTime;
        } else {
            return wakeupTime;
        }
    }


    public get timelogUpdated$(): Observable<
        {
            prevDayItems: DaybookTimelogEntryDataItem[],
            thisDayItems: DaybookTimelogEntryDataItem[],
            nextDayItems: DaybookTimelogEntryDataItem[],
        }> {
        return this._timelogUpdated$.asObservable();
    }


    public saveTimelogEntryItem$(saveTimelogEntry: TimelogEntryItem): Observable<boolean> {
        const timelogEntryDateYYYYMMDD: string = saveTimelogEntry.startTime.format('YYYY-MM-DD');
        let dataItemsToSave: DaybookTimelogEntryDataItem[] = [];
        let startOfDay: moment.Moment;
        let endOfDay: moment.Moment;
        if (timelogEntryDateYYYYMMDD === this.prevDateYYYYMMDD) {
            startOfDay = moment(this.prevDateYYYYMMDD).startOf('day');
            endOfDay = moment(this.prevDateYYYYMMDD).startOf('day').add(1, 'days');
        } else if (timelogEntryDateYYYYMMDD === this.thisDateYYYYMMDD) {
            startOfDay = moment(this.thisDateYYYYMMDD).startOf('day');
            endOfDay = moment(this.thisDateYYYYMMDD).startOf('day').add(1, 'days');
        } else if (timelogEntryDateYYYYMMDD === this.nextDateYYYYMMDD) {
            startOfDay = moment(this.nextDateYYYYMMDD).startOf('day');
            endOfDay = moment(this.nextDateYYYYMMDD).startOf('day').add(1, 'days');
        } else {
            console.log('Error with timelogEntryDateYYYYMMDD: ' + timelogEntryDateYYYYMMDD);
        }
        dataItemsToSave = this._timelogEntryItems
            .filter(item => item.startTime.isSameOrAfter(startOfDay) && item.endTime.isSameOrBefore(endOfDay))
            .map(item => item.dataEntryItem);
        dataItemsToSave.push(saveTimelogEntry.dataEntryItem);

        let prevDayItems, thisDayItems, nextDayItems: DaybookTimelogEntryDataItem[];
        if (timelogEntryDateYYYYMMDD === this.prevDateYYYYMMDD) { prevDayItems = dataItemsToSave; } else
            if (timelogEntryDateYYYYMMDD === this.thisDateYYYYMMDD) { thisDayItems = dataItemsToSave; } else
                if (timelogEntryDateYYYYMMDD === this.nextDateYYYYMMDD) { nextDayItems = dataItemsToSave; }

        this._sendUpdate({
            prevDayItems: prevDayItems,
            thisDayItems: thisDayItems,
            nextDayItems: nextDayItems,
        });
        return this._timelogActionComplete$.asObservable();
    }
    public saveTimelogEntryItemAcrossMidnight$(timelogEntryBefore: TimelogEntryItem, timelogEntryAfter: TimelogEntryItem)
        : Observable<boolean> {

        const firstDateYYYYMMDD: string = timelogEntryBefore.startTime.format('YYYY-MM-DD');
        const secondDateYYYYMMDD: string = timelogEntryAfter.startTime.format('YYYY-MM-DD');
        const startOfFirstDay: moment.Moment = moment(firstDateYYYYMMDD).startOf('day');
        const startOfSecondDay: moment.Moment = moment(secondDateYYYYMMDD).startOf('day');
        const endOfSecondDay: moment.Moment = moment(secondDateYYYYMMDD).startOf('day').add(1, 'days');

        const firstDayItems: DaybookTimelogEntryDataItem[] = this._timelogEntryItems
            .filter(item => item.startTime.isSameOrAfter(startOfFirstDay) && item.endTime.isSameOrBefore(startOfSecondDay))
            .map(item => item.dataEntryItem)
        firstDayItems.push(timelogEntryBefore.dataEntryItem);

        const secondDayItems: DaybookTimelogEntryDataItem[] = this._timelogEntryItems
            .filter(item => item.startTime.isSameOrAfter(startOfSecondDay) && item.endTime.isSameOrBefore(endOfSecondDay))
            .map(item => item.dataEntryItem);
        secondDayItems.push(timelogEntryAfter.dataEntryItem);

        let prevDayItems, thisDayItems, nextDayItems: DaybookTimelogEntryDataItem[];
        if (firstDateYYYYMMDD === this.prevDateYYYYMMDD && secondDateYYYYMMDD === this.thisDateYYYYMMDD) {
            prevDayItems = firstDayItems;
            thisDayItems = secondDayItems;
        } else if (firstDateYYYYMMDD === this.thisDateYYYYMMDD && secondDateYYYYMMDD === this.nextDateYYYYMMDD) {
            thisDayItems = firstDayItems;
            nextDayItems = secondDayItems;
        } else {
            console.log('Error with dates');
        }
        this._sendUpdate({
            prevDayItems: prevDayItems,
            thisDayItems: thisDayItems,
            nextDayItems: nextDayItems,
        });
        return this._timelogActionComplete$.asObservable();
    }

    public updateTimelogEntry$(updateTimelogEntry: TimelogEntryItem): Observable<boolean> {
        const updateDateYYYYMMDD: string = moment(updateTimelogEntry.startTime).format('YYYY-MM-DD');
        const startOfDay: moment.Moment = moment(updateTimelogEntry.startTime).startOf('day');
        const endOfDay: moment.Moment = moment(startOfDay).add(1, 'days');
        const dateEntries: DaybookTimelogEntryDataItem[] = this._timelogEntryItems.filter(item =>
            item.startTime.isSameOrAfter(startOfDay) && item.endTime.isSameOrBefore(endOfDay))
            .map(item => item.dataEntryItem);
        let foundIndex = -1;
        dateEntries.forEach((item) => {
            if (moment(item.startTimeISO).isSame(moment(updateTimelogEntry.startTime))
                && moment(item.endTimeISO).isSame(moment(updateTimelogEntry.endTime))) {
                foundIndex = dateEntries.indexOf(item);
            }
        });

        if (foundIndex >= 0) {
            // console.log("Successfully updated timelog entry at index: " + foundIndex);
            dateEntries.splice(foundIndex, 1, updateTimelogEntry.dataEntryItem);
            let prevDayItems, thisDayItems, nextDayItems: DaybookTimelogEntryDataItem[];
            if (updateDateYYYYMMDD === this.prevDateYYYYMMDD) {
                prevDayItems = dateEntries;
            } else if (updateDateYYYYMMDD === this.thisDateYYYYMMDD) {
                thisDayItems = dateEntries;
            } else if (updateDateYYYYMMDD === this.nextDateYYYYMMDD) {
                nextDayItems = dateEntries;
            } else {
                console.log('Error with date: ' + updateDateYYYYMMDD);
            }
            this._sendUpdate({
                prevDayItems: prevDayItems,
                thisDayItems: thisDayItems,
                nextDayItems: nextDayItems,
            });
            return this._timelogActionComplete$.asObservable();
        } else {
            // console.log("Error: can't modify timelogEntry", timelogEntry)
            return null;
        }
    }
    public deleteTimelogEntry$(deleteTimelogEntry: TimelogEntryItem): Observable<boolean> {
        const deleteDateYYYYMMDD: string = moment(deleteTimelogEntry.startTime).format('YYYY-MM-DD');
        const startOfDay: moment.Moment = moment(deleteTimelogEntry.startTime).startOf('day');
        const endOfDay: moment.Moment = moment(startOfDay).add(1, 'days');
        const dateEntries: DaybookTimelogEntryDataItem[] = this._timelogEntryItems.filter(item =>
            item.startTime.isSameOrAfter(startOfDay) && item.endTime.isSameOrBefore(endOfDay))
            .map(item => item.dataEntryItem);
        let foundIndex = -1;
        dateEntries.forEach((item) => {
            if (moment(item.startTimeISO).isSame(moment(deleteTimelogEntry.startTime))
                && moment(item.endTimeISO).isSame(moment(deleteTimelogEntry.endTime))) {
                foundIndex = dateEntries.indexOf(item);
            }
        });

        if (foundIndex >= 0) {
            // console.log("Successfully updated timelog entry at index: " + foundIndex);
            dateEntries.splice(foundIndex, 1);
            let prevDayItems, thisDayItems, nextDayItems: DaybookTimelogEntryDataItem[];
            if (deleteDateYYYYMMDD === this.prevDateYYYYMMDD) {
                prevDayItems = dateEntries;
            } else if (deleteDateYYYYMMDD === this.thisDateYYYYMMDD) {
                thisDayItems = dateEntries;
            } else if (deleteDateYYYYMMDD === this.nextDateYYYYMMDD) {
                nextDayItems = dateEntries;
            } else {
                console.log('Error with date: ' + deleteDateYYYYMMDD);
            }
            this._sendUpdate({
                prevDayItems: prevDayItems,
                thisDayItems: thisDayItems,
                nextDayItems: nextDayItems,
            });
            return this._timelogActionComplete$.asObservable();
        } else {
            // console.log("Error: can't modify timelogEntry", timelogEntry)
            return null;
        }
    }



    public get activityTimes(): { start: moment.Moment, end: moment.Moment, isActive: boolean }[] {
        return this._activityTimes;
    }

    public isActiveAtTime(timeToCheck: moment.Moment): boolean {
        this._activityTimes.forEach((timeSection) => {
            if (timeToCheck.isSameOrAfter(timeSection.start) && timeToCheck.isSameOrBefore(timeSection.end)) {
                return timeSection.isActive;
            }
        });
        console.log(' error?  could not determine activity times, ', this._activityTimes);
        return false;
    }

    private _sendUpdate(updateItem: {
        prevDayItems: DaybookTimelogEntryDataItem[],
        thisDayItems: DaybookTimelogEntryDataItem[],
        nextDayItems: DaybookTimelogEntryDataItem[],
    }) {
        this._timelogUpdated$.next(updateItem);
    }

    private _buildActivityTimes() {
        let activityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[] = [];
        let currentTime = this.startOfPrevDate;

        for (let i = 0; i < this._timelogEntryItems.length; i++) {
            if (currentTime.isBefore(this._timelogEntryItems[i].startTime)) {
                activityTimes.push({
                    start: currentTime,
                    end: this._timelogEntryItems[i].startTime,
                    isActive: false,
                });
                activityTimes.push({
                    start: this._timelogEntryItems[i].startTime,
                    end: this._timelogEntryItems[i].endTime,
                    isActive: true,
                });
            } else if (currentTime.isSame(this._timelogEntryItems[i].startTime)) {
                activityTimes.push({
                    start: this._timelogEntryItems[i].startTime,
                    end: this._timelogEntryItems[i].endTime,
                    isActive: true,
                });
            } else if (currentTime.isAfter(this._timelogEntryItems[i].startTime)) {
                console.log("Error:  current time after timelogEntry start time");
                activityTimes.push({
                    start: currentTime,
                    end: this._timelogEntryItems[i].endTime,
                    isActive: true,
                });
            } else {
                console.log('Error: impossible');
            }
            currentTime = this._timelogEntryItems[i].endTime;
            if (i == this._timelogEntryItems.length - 1) {
                if (currentTime.isBefore(this.endOfNextDate)) {
                    activityTimes.push({
                        start: currentTime,
                        end: this.endOfNextDate,
                        isActive: false,
                    });
                } else if (currentTime.isSame(this.endOfNextDate)) {

                } else if (currentTime.isAfter(this.endOfNextDate)) {
                    console.log("??? Error ")
                } else {
                    console.log("??? Error")
                }
            } else {
                currentTime = this._timelogEntryItems[i + 1].startTime;
            }
        }
        this._activityTimes = this._mergeActivityTimes(activityTimes);
        // console.log("Activity times: ", this._activityTimes);
        // this._activityTimes.forEach((item) => {
        //     console.log("   " + item.start.format('YYYY-MM-DD hh:mm:ss a') + " to " + item.end.format('YYYY-MM-DD hh:mm:ss a') + " : isActive? " + item.isActive);
        // })
    }

    private _mergeActivityTimes(activityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[])
        : { start: moment.Moment, end: moment.Moment, isActive: boolean }[] {
        let mergedActivities: {start: moment.Moment, end: moment.Moment, isActive: boolean}[] = [activityTimes[0]];
        for(let i=1; i<activityTimes.length; i++){
            if(activityTimes[i].isActive === activityTimes[i-1].isActive){
                const mergedActivityTime: {start: moment.Moment, end: moment.Moment, isActive: boolean} = {
                    start: mergedActivities[mergedActivities.length-1].start,
                    end: activityTimes[i].end,
                    isActive: mergedActivities[mergedActivities.length-1].isActive,
                };
                mergedActivities.splice(mergedActivities.length-1, 1, mergedActivityTime);
            }else{
                mergedActivities.push({
                    start: activityTimes[i].start,
                    end: activityTimes[i].end,
                    isActive: activityTimes[i].isActive,
                });
            }
        }
        // console.log("Merged activities: " , mergedActivities);
        // mergedActivities.forEach((item) => {
        //     console.log("   " + item.start.format('YYYY-MM-DD hh:mm:ss a') + " to " + item.end.format('YYYY-MM-DD hh:mm:ss a') + " : isActive? " + item.isActive);
        // })
        return mergedActivities;
    }

    private _buildTimelogEntryFromDataItem(dataItem: DaybookTimelogEntryDataItem): TimelogEntryItem {
        const timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(dataItem.startTimeISO), moment(dataItem.endTimeISO));
        timelogEntry.note = dataItem.note;
        timelogEntry.timelogEntryActivities = dataItem.timelogEntryActivities;
        return timelogEntry;
    }

}
