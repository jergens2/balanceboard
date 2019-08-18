
import { DaybookDayItemHttpShape } from "./daybook-day-item-http-shape.interface";
import { DaybookTimelogEntryDataItem } from "./data-items/daybook-timelog-entry-data-item.interface";
import { DaybookActivityDataItem } from "./data-items/daybook-activity-data-item.interface";
import { DailyTaskListDataItem } from "./data-items/daily-task-list-data-item.interface";
import { Subject, Observable } from "rxjs";
import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';

export class DaybookDayItem {



    private _httpShape: DaybookDayItemHttpShape;
    public setHttpShape(shape: DaybookDayItemHttpShape) {
        this._httpShape = shape;
    }
    public get httpShape(): DaybookDayItemHttpShape {
        return this._httpShape;
    }

    constructor(dateYYYYMMDD) {
        this.generateNewDaybook(dateYYYYMMDD);
    }

    private generateNewDaybook(dateYYYYMMDD: string) {
        let shape: DaybookDayItemHttpShape = {
            _id: "",
            userId: "",
            dateYYYYMMDD: dateYYYYMMDD,
            daybookTimelogEntryDataItems: [],
            daybookActivityDataItems: [],
            dailyTaskListDataItems: [],
            dayStructureDataItems: [],
            dayTemplateId: "",
            scheduledEventIds: [],
            notebookEntryIds: [],
            taskItemIds: [],
        }
        this.setHttpShape(shape);
    }

    public get id(): string { return this._httpShape._id; }
    public set id(id: string) {
        this._httpShape._id = id;
    }
    public get userId(): string { return this._httpShape.userId; }
    public set userId(userId: string) {
        this._httpShape.userId = userId;
    }

    public get dateYYYYMMDD(): string { return this._httpShape.dateYYYYMMDD; }

    public get daybookTimelogEntryDataItems(): DaybookTimelogEntryDataItem[] { return this._httpShape.daybookTimelogEntryDataItems; }
    public set daybookTimelogEntryDataItems(timelogEntries: DaybookTimelogEntryDataItem[]) {
        this._httpShape.daybookTimelogEntryDataItems = timelogEntries;
        this.updateActivityDataItems();
    }
    public get daybookActivityDataItems(): DaybookActivityDataItem[] { return this._httpShape.daybookActivityDataItems; }
    private updateActivityDataItems() {
        console.log("Not implemented: Updating Activity Data Items");
        let activityDataItems: DaybookActivityDataItem[] = [];
        this._httpShape.daybookActivityDataItems = activityDataItems;
    }

    public set dayStructureDataItems(dayStructureDataItems: DayStructureDataItem[]){
        this._httpShape.dayStructureDataItems = dayStructureDataItems;
        this.dataChanged();
    }

    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this._httpShape.dailyTaskListDataItems; }
    public get dayStructureDataItems(): DayStructureDataItem[] { return this._httpShape.dayStructureDataItems; }
    public get dayTemplateId(): string { return this._httpShape.dayTemplateId; }
    public get scheduledEventIds(): string[] { return this._httpShape.scheduledEventIds; }
    public get notebookEntryIds(): string[] { return this._httpShape.notebookEntryIds; }
    public get taskItemIds(): string[] { return this._httpShape.taskItemIds; }

    public set taskItemIds(taskItemIds: string[]) {
        this._httpShape.taskItemIds = taskItemIds;
        this.dataChanged();
    }
    public set dailyTaskListDataItems(dailyTaskListDataItems: DailyTaskListDataItem[]) {
        this._httpShape.dailyTaskListDataItems = dailyTaskListDataItems;
        this.dataChanged();
    }
    public set dayTemplateId(dayTemplateId: string) {
        this._httpShape.dayTemplateId = dayTemplateId;
        this.dataChanged();
    }
    public set scheduledEventIds(scheduledEventIds: string[]) {
        this._httpShape.scheduledEventIds = scheduledEventIds;
        this.dataChanged();
    }
    public set notebookEntryIds(notebookEntryIds: string[]) {
        this._httpShape.notebookEntryIds = notebookEntryIds
        this.dataChanged();
    }



    private dataChanged() {
        console.log("* * * DaybookDayItem: " + this.dateYYYYMMDD + " - Data has changed.  Saving.")
        this._dataChanged$.next(true);
    }
    private _dataChanged$: Subject<boolean> = new Subject();
    public get dataChanged$(): Observable<boolean> {
        return this._dataChanged$.asObservable();
    }


    public timelogEntryStartTime(fromNow: moment.Moment): moment.Moment{
        let startTime: moment.Moment = moment();
        if(this.daybookTimelogEntryDataItems.length > 0){
            console.log("there were timelog entries already, so returning the end of the most recent one.")
            startTime = moment(this.daybookTimelogEntryDataItems[this.daybookTimelogEntryDataItems.length-1].endTimeISO);
        }else{
            console.log("returning the most recent daystructure item")
            let filtered = this.dayStructureDataItems.filter((structureItem)=>{
                return moment(structureItem.startTimeISO).isBefore(fromNow);
            });
            startTime = moment(filtered[filtered.length-1].startTimeISO);
        }
        console.log("timelogEntryStartTime value: ", startTime.format("hh:mm a"));
        return startTime;
    }

    public addTimelogEntryItem(timelogEntry: DaybookTimelogEntryDataItem){
        let timelogEntries = this.daybookTimelogEntryDataItems;
        timelogEntries.push(timelogEntry);
        this.daybookTimelogEntryDataItems = timelogEntries;
        console.log("daybook timelog entries:", this.daybookTimelogEntryDataItems)
        console.log("this shape: ", this._httpShape)
        this.dataChanged();
    }
    public updateTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem){
        console.log("Warning: updateTimelogEntry(): this method is not implemented in daybook-day-item.class.ts")
    }
    /**
     * The following section is for the timelog widget service, if I remember to come back to this:
     */

    // public addDaybookTimelogEntryDataItem(timelogEntry: DaybookTimelogEntryDataItem){
    //     this._httpShape.daybookTimelogEntryDataItems.push(timelogEntry);
    //     this.updateActivityDataItems();
    // }
    // public removeDaybookTimelogEntryDataItem(timelogEntry: DaybookTimelogEntryDataItem){
    //     let foundEntry = this._httpShape.daybookTimelogEntryDataItems.find((existingTimelogEntry)=>{
    //         let sameStart: boolean = timelogEntry.startTimeISO == existingTimelogEntry.startTimeISO;
    //         let sameEnd: boolean = timelogEntry.endTimeISO == existingTimelogEntry.endTimeISO;
    //         let isSame: boolean = sameStart && sameEnd;
    //         return isSame;
    //     });
    //     if(foundEntry){
    //         let index = this._httpShape.daybookTimelogEntryDataItems.indexOf(foundEntry);
    //         this._httpShape.daybookTimelogEntryDataItems.splice(index, 1);
    //     }
    //     this.updateActivityDataItems();
    // }

}