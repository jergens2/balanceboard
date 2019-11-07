import { DaybookTimelogEntryDataItem } from "../data-items/daybook-timelog-entry-data-item.interface";
import { Subject, Observable } from "rxjs";
import { TimelogEntryItem } from "../../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";
import * as moment from 'moment';
import { DaybookDayItemHttpShape } from "../daybook-day-item-http-shape.interface";

export class DaybookDayItemTimelog {

    constructor(httpShape: DaybookDayItemHttpShape) {
        let timelogEntries: TimelogEntryItem[] = [];
        if (httpShape.daybookTimelogEntryDataItems.length > 0) {
            httpShape.daybookTimelogEntryDataItems.forEach((item) => {
                let timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(item.startTimeISO), moment(item.endTimeISO));
                timelogEntry.note = item.note;
                if (item.timelogEntryActivities) {
                    item.timelogEntryActivities.forEach((activity) => {
                        timelogEntry.timelogEntryActivities.push(activity);
                    });
                } else {
                    console.log("No TLEAs ?", item);
                }
                timelogEntries.push(timelogEntry);
            });
        }
        this._dateYYYYMMDD = httpShape.dateYYYYMMDD;
        this._timelogEntryItems = this.sortTimelogEntries(timelogEntries);
        this._timeDelineators = httpShape.timeDelineators;
        this._updateActivityTimes();
    }
    private _dateYYYYMMDD: string;


    public get lastTimelogEntryItemTime(): moment.Moment {
        if(this._timelogEntryItems.length > 0){
            return moment(this._timelogEntryItems[this._timelogEntryItems.length - 1].endTime);
        }else{
            return moment(this._dateYYYYMMDD).startOf("day");
        }
    }

    private _timeDelineators: string[] = [];
    private _timelogEntryItems: TimelogEntryItem[] = [];

    public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; };
    public get timeDelineators(): string[] { return this._timeDelineators; }

    private _timelogUpdated$: Subject<{ timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] }> = new Subject();
    public get timelogUpdated$(): Observable<{ timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] }> { return this._timelogUpdated$.asObservable(); };
    private sendUpdate() { this._timelogUpdated$.next(this.exportDataItems()); }
    private exportDataItems(): { timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] } {
        let exportObject: { timelogDataItems: DaybookTimelogEntryDataItem[], delineators: string[] } = {
            timelogDataItems: this.sortTimelogEntries(this.timelogEntryItems).map((entry) => { return entry.dataEntryItem; }),
            delineators: this.timeDelineators,
        }
        return exportObject;
    }

    public addTimelogEntryItem(timelogEntry: TimelogEntryItem) {
        let timelogEntries = this.timelogEntryItems;
        timelogEntries.push(timelogEntry);
        this._timelogEntryItems = timelogEntries;
        this._updateActivityTimes();
        this.sendUpdate();
    }
    public updateTimelogEntry(timelogEntry: TimelogEntryItem) {
        let foundIndex: number = -1;
        this._timelogEntryItems.forEach((item) => {
            if (moment(item.startTime).isSame(moment(timelogEntry.startTime)) && moment(item.endTime).isSame(moment(timelogEntry.endTime))) {
                foundIndex = this._timelogEntryItems.indexOf(item);
            }
        });
        if (foundIndex >= 0) {
            // console.log("Successfully updated timelog entry at index: " + foundIndex);
            this._timelogEntryItems.splice(foundIndex, 1, timelogEntry);
            this._updateActivityTimes();
            this.sendUpdate();
        } else {
            // console.log("Error: can't modify timelogEntry", timelogEntry)
        }
    }
    public deleteTimelogEntry(timelogEntry: TimelogEntryItem) {
        let foundIndex: number = -1;
        this._timelogEntryItems.forEach((item) => {
            if (moment(item.startTime).isSame(moment(timelogEntry.startTime)) && moment(item.endTime).isSame(moment(timelogEntry.endTime))) {
                foundIndex = this._timelogEntryItems.indexOf(item);
            }
        });
        if (foundIndex >= 0) {
            // console.log("Successfully deleting timelog entry at index: " + foundIndex);
            this._timelogEntryItems.splice(foundIndex, 1);
            this._updateActivityTimes();
            this.sendUpdate();
        } else {
            // console.log("Error: can't delete timelogEntry", timelogEntry)
        }
    }

    private _activityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[] = [];

    public isActiveAtTime(timeToCheck: moment.Moment): boolean { 
        this._activityTimes.forEach((timeSection)=>{
            if(timeToCheck.isSameOrAfter(timeSection.start) && timeToCheck.isSameOrBefore(timeSection.end)){
                return timeSection.isActive;
            }
        });
        console.log(" error?  could not determine activity times, ", this._activityTimes);
        return false;
    }

    private _updateActivityTimes() {
        this._timelogEntryItems = this.sortTimelogEntries(this._timelogEntryItems);
        let activityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[] = [];

        const startOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day");
        const endOfDay: moment.Moment = moment(this._dateYYYYMMDD).startOf("day").add(24, "hours");


        if (this._timelogEntryItems.length > 0) {
            let currentlyActive: boolean = false;
            let currentTime: moment.Moment = moment(startOfDay);

            for (let i = 0; i < this._timelogEntryItems.length; i++) {
                if (this._timelogEntryItems[i].startTime.isAfter(currentTime)) {
                    activityTimes.push({
                        start: currentTime,
                        end: this._timelogEntryItems[i].startTime,
                        isActive: false,
                    });
                    currentTime = this._timelogEntryItems[i].startTime;
                }
                activityTimes.push({
                    start: currentTime,
                    end: this._timelogEntryItems[i].endTime,
                    isActive: true,
                });
            }
        } else {
            activityTimes = [
                {
                    start: startOfDay,
                    end: endOfDay,
                    isActive: false,
                }
            ];
        }

        if (activityTimes[activityTimes.length - 1].end.isBefore(endOfDay)) {
            activityTimes.push({
                start: activityTimes[activityTimes.length - 1].end,
                end: endOfDay,
                isActive: false,
            });
        } else {

        }

        let mergedActivityTimes: { start: moment.Moment, end: moment.Moment, isActive: boolean }[] = [];
        for(let i=0; i<activityTimes.length; i++){
            if(i == 0){
                mergedActivityTimes.push(activityTimes[i]);
            }else{
                let previousEndTime: moment.Moment = mergedActivityTimes[mergedActivityTimes.length-1].end;
                if(!activityTimes[i].start.isSame(previousEndTime)){
                    console.log("Error ? this shouldn't happen")
                }else{
                    if(activityTimes[i].isActive === mergedActivityTimes[mergedActivityTimes.length-1].isActive){
                        mergedActivityTimes[mergedActivityTimes.length-1].end = activityTimes[i].end;
                    }else{
                        mergedActivityTimes.push(activityTimes[i]);
                    }
                }
            }
        }

        console.log(" Merged activity times : ", mergedActivityTimes) 
        // mergedActivityTimes.forEach((m)=>{
        //     console.log("  Merged:  " + m.start.format("YYYY-MM-DD hh:mm a") + " - " + m.end.format("YYYY-MM-DD hh:mm a") + " isActive: " + m.isActive  );
        // })

        this._activityTimes = mergedActivityTimes;
    }

    private sortTimelogEntries(items: TimelogEntryItem[]): TimelogEntryItem[] {

        return items.sort((item1, item2) => {
            if (item1.startTime.isBefore(item2.startTime)) {
                return -1
            } else if (item1.startTime.isAfter(item2.startTime)) {
                return 1;
            } else {
                return 0;
            }
        })

    }




    public set timeDelineators(timeDelineators: string[]) {
        // console.log("setting Time delineators ")
        this._timeDelineators = timeDelineators.sort((time1, time2) => {
            if (time1 < time2) return -1
            if (time1 > time2) return 1
            return 0;
        });
        this.sendUpdate();
    }
    public addTimeDelineator(delineatorTimeISO: string) {
        let timeDelineators = this.timeDelineators;
        if (timeDelineators.indexOf(delineatorTimeISO) == -1) {
            timeDelineators.push(delineatorTimeISO);
            this._timeDelineators = timeDelineators.sort((time1, time2) => {
                if (time1 < time2) return -1
                if (time1 > time2) return 1
                return 0;
            });;
        }
    }
    public removeTimeDelineator(delineator: string) {
        let timeDelineators = this.timeDelineators;
        if (timeDelineators.indexOf(delineator) > -1) {
            timeDelineators.splice(timeDelineators.indexOf(delineator), 1);
            this._timeDelineators = timeDelineators.sort((time1, time2) => {
                if (time1 < time2) return -1
                if (time1 > time2) return 1
                return 0;
            });;
        }
    }

}