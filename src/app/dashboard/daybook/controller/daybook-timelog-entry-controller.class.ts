import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogZoomControl } from '../widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-control.interface';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';

export class DaybookTimelogEntryController {
    constructor(dateYYYYMMDD: string, timelogEntryDataItems: DaybookTimelogEntryDataItem[], sleepTimes?: TimeSpanItem[]) {
        // console.log("Rebuilding Timelog Controller")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timelogEntryItems = timelogEntryDataItems.map((item) => {
            return this._buildTimelogEntryFromDataItem(item);
        });
        this._buildSchedule();

        // console.log(" Timelog Controller: Activity times: " )
        // if(this._activityTimes.length > 0){
        //     console.log("this._activityTimes", this._activityTimes)
        //     this._activityTimes.forEach((activityTime)=>{
        //         console.log("   " + activityTime.start.format('YYYY-MM-DD hh:mm a') + " to " + activityTime.end.format('YYYY-MM-DD hh:mm a') + " -  isActive? " + activityTime.isActive)
        //     });
        // }

    }

    private _dateYYYYMMDD: string;
    private _timelogEntryItems: TimelogEntryItem[];
    // private _sleepTimes: TimeSpanItem[];

    private _timelogActionComplete$: Subject<boolean> = new Subject();

    private _timelogSchedule: TimeSchedule;

    private _timelogUpdated$: Subject<
        {
            prevDayItems: DaybookTimelogEntryDataItem[],
            thisDayItems: DaybookTimelogEntryDataItem[],
            nextDayItems: DaybookTimelogEntryDataItem[],
        }> = new Subject();

    public get timelogSchedule(): TimeSchedule { return this._timelogSchedule; }

    public get lastTimelogEntryItemTime(): moment.Moment {
        if (this._timelogEntryItems.length > 0) {
            return moment(this._timelogEntryItems[this._timelogEntryItems.length - 1].endTime);
        } else {
            return null
        }
    }



    public get prevDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).format('YYYY-MM-DD'); }
    public get nextDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }
    public get endOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }

    public get startOfPrevDate(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    public get endOfNextDate(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(24, 'hours'); }


    public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }

    public isActiveAtTime(timeToCheck: moment.Moment): boolean { return this.timelogSchedule.hasValueAtTime(timeToCheck); }


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



    private _sendUpdate(updateItem: {
        prevDayItems: DaybookTimelogEntryDataItem[],
        thisDayItems: DaybookTimelogEntryDataItem[],
        nextDayItems: DaybookTimelogEntryDataItem[],
    }) {
        this._timelogUpdated$.next(updateItem);
    }

    private _buildSchedule() {
        let newSchedule: TimeSchedule = new TimeSchedule(this.startOfPrevDate, this.endOfNextDate);
        const positiveValues: TimeScheduleItem[] = this.timelogEntryItems.map(item => new TimeScheduleItem(item.startTime, item.endTime, true));
        newSchedule.setScheduleFromSingleValues(positiveValues, true);
        this._timelogSchedule = newSchedule;
    }



    private _buildTimelogEntryFromDataItem(dataItem: DaybookTimelogEntryDataItem): TimelogEntryItem {
        const timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(dataItem.startTimeISO), moment(dataItem.endTimeISO));
        timelogEntry.note = dataItem.note;
        timelogEntry.timelogEntryActivities = dataItem.timelogEntryActivities;
        return timelogEntry;
    }

}
