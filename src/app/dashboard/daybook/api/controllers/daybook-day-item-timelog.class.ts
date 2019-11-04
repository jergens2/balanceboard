import { DaybookTimelogEntryDataItem } from "../data-items/daybook-timelog-entry-data-item.interface";
import { Subject, Observable } from "rxjs";
import { TimelogEntryItem } from "../../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class";
import * as moment from 'moment';
import { DaybookDayItemHttpShape } from "../daybook-day-item-http-shape.interface";

export class DaybookDayItemTimelog {

    constructor(httpShape: DaybookDayItemHttpShape) {
        let timelogEntries: TimelogEntryItem[] = [];
        httpShape.daybookTimelogEntryDataItems.forEach((item)=>{
            let timelogEntry: TimelogEntryItem = new TimelogEntryItem(moment(item.startTimeISO), moment(item.endTimeISO));
            timelogEntry.note = item.note;
            item.timelogEntryActivities.forEach((activity)=>{
                timelogEntry.timelogEntryActivities.push(activity);
            });
            timelogEntries.push(timelogEntry);
        });

        
        this._timelogEntryItems = this.sortTimelogEntries(timelogEntries);
    }


    public get lastTimelogEntryItemTime(): moment.Moment { 
        return moment(this._timelogEntryItems[this._timelogEntryItems.length-1].endTime);
    }


    private _timelogEntryItems: TimelogEntryItem[];
    public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; };

    private _timelogUpdated$: Subject<DaybookTimelogEntryDataItem[]> = new Subject();
    public get timelogUpdated$(): Observable<any> { return this._timelogUpdated$.asObservable(); };
    private sendUpdate(){
        this._timelogUpdated$.next(this.exportDataItems());
    }
    private exportDataItems(): DaybookTimelogEntryDataItem[] { 
        return this.sortTimelogEntries(this.timelogEntryItems).map((entry)=>{ return entry.dataEntryItem; });
    }

    public addTimelogEntryItem(timelogEntry: TimelogEntryItem) {
        let timelogEntries = this.timelogEntryItems;
        timelogEntries.push(timelogEntry);
        this._timelogEntryItems = timelogEntries;
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
            this.sendUpdate();
        } else {
            // console.log("Error: can't delete timelogEntry", timelogEntry)
        }
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


}