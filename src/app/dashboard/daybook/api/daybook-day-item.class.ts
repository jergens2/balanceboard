
import { DaybookDayItemHttpShape } from "./daybook-day-item-http-shape.interface";
import { DaybookTimelogEntryDataItem } from "./data-items/daybook-timelog-entry-data-item.interface";
import { DaybookActivityDataItem } from "./data-items/daybook-activity-data-item.interface";
import { DailyTaskListDataItem } from "./data-items/daily-task-list-data-item.interface";
import { Subject, Observable } from "rxjs";
import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureSleepCycleAction } from "./data-items/day-structure-sleep-cycle-action.enum";
import { TimelogWindow } from "../widgets/timelog/timelog-large/timelog-chart/timelog-window.interface";
import { DayStructureSleepCycleDataItem } from "./data-items/day-structure-sleep-cycle-data-item.interface";

export class DaybookDayItem{


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
            sleepCycleDataItems: [],
            dailyWeightLogEntryKg: 0,
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

    public get dayStructureDataItems(): DayStructureDataItem[] { return this._httpShape.dayStructureDataItems; }
    public set dayStructureDataItems(dayStructureDataItems: DayStructureDataItem[]) {
        this._httpShape.dayStructureDataItems = dayStructureDataItems;
        this.dataChanged();
    }

    public get sleepStructureDataItems(): DayStructureSleepCycleDataItem[] { return this._httpShape.sleepCycleDataItems; }
    public set sleepStructureDataItems(sleepCycleItems: DayStructureSleepCycleDataItem[]) {
        this._httpShape.sleepCycleDataItems = sleepCycleItems;
        this.dataChanged();
    }

    public get dailyWeightLogEntryKg(): number { return this._httpShape.dailyWeightLogEntryKg; }
    public set dailyWeightLogEntryKg(kg: number){ 
        this._httpShape.dailyWeightLogEntryKg = kg;
        this.dataChanged();
    }
    
    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this._httpShape.dailyTaskListDataItems; }
    
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


    private _previousDay: DaybookDayItem;
    public set previousDay(previousDay: DaybookDayItem){
        this._previousDay = previousDay;
    }
    public get previousDay(): DaybookDayItem{
        return this._previousDay;
    }
    private _followingDay: DaybookDayItem;
    public set followingDay(followingDay: DaybookDayItem){
        this._followingDay = followingDay;
    }
    public get followingDay(): DaybookDayItem{
        return this._followingDay;
    }


    private dataChanged() {
        console.log("* * * DaybookDayItem: " + this.dateYYYYMMDD + " - Data has changed.  Saving.")
        this._dataChanged$.next(true);
    }
    private _dataChanged$: Subject<boolean> = new Subject();
    public get dataChanged$(): Observable<boolean> {
        return this._dataChanged$.asObservable();
    }






    private buildTimelogEntry(nowTime: moment.Moment, startTimeISO: string, endTimeISO: string): DaybookTimelogEntryDataItem {
        let timelogEntry: DaybookTimelogEntryDataItem = {
            startTimeISO: startTimeISO,
            endTimeISO: endTimeISO,
            utcOffsetMinutes: nowTime.utcOffset(),
            timelogEntryActivities: [],
            isConfirmed: false,
            note: "",
        }
        return timelogEntry;
    }

    public generateInitialTimelogEntries() {

        /**
         * 2019-08-18
         * Note:  This method assumes in a standard circadian sleep cycle, meaning you go to bed some time in the evening and wake up some time in the morning.
         * this method currently does not account for someone who does shift work, who might have to wake up at 6pm.
         * Need to add that functionality at some point.
         * 
         * For now, assuming the following pattern holds true for each day:
         *  
            SleepingPreWakeup = "SLEEPING_PRE_WAKEUP",
            Wakeup = "WAKEUP",
            PostWakeup = "POST_WAKEUP",
            Awake = "AWAKE",
            Bedtime = "BEDTIME",
            AwakePreSleeping = "AWAKE_PRE_SLEEPING",
            SleepingPostBedtime = "SLEEPING_POST_BEDTIME",
         */
        // let generatedTimelogEntries: DaybookTimelogEntryDataItem[] = [];
        // let now: moment.Moment = moment();
        // let position: DayStructureDataItem = this.positionInSleepCycle(now);
        // let index: number = this.substantialDayStructureDataItems.indexOf(position);
        // for (let i = 0; i < index; i++) {

        //     let sleepCycle = this.substantialDayStructureDataItems[i].sleepCycle;
        //     let startTimeISO = this.substantialDayStructureDataItems[i].startTimeISO;
        //     let endTimeISO = this.substantialDayStructureDataItems[i].endTimeISO;
        //     console.log("building a timelog entry from ", this.substantialDayStructureDataItems[i])
        //     generatedTimelogEntries.push(this.buildTimelogEntry(now, startTimeISO, endTimeISO, sleepCycle));
        // }
        // let startTimeISO = position.startTimeISO;
        // generatedTimelogEntries.push(this.buildTimelogEntry(now, startTimeISO, now.toISOString(), position.sleepCycle));
        // console.log("Generated timelog entries:", generatedTimelogEntries);
        // this.daybookTimelogEntryDataItems = generatedTimelogEntries;
    }


    // private setSleepCycleTimes(){
    //     this._wakeUpTime = 
    // }

    // private _wakeUpTime: moment.Moment;
    // private _fallAsleepTime: moment.Moment;
    public getTimelogWindow(windowSizeHours: number): TimelogWindow {

        /**
         *  I think I might just get rid of the TimelogWindow entirely, and just use the 2 variables as reference points (wakeup and fallasleep time);
         * 
         */
        let startTime: moment.Moment = moment(this.wakeUpTime).subtract(1, "hour");
        let endTime: moment.Moment = moment(this.fallAsleepTime).add(1, "hour");
        
        let window: TimelogWindow = {
            windowStartTime: moment(startTime).subtract(1, "hour"),
            startTime: startTime,
            endTime: endTime,
            windowEndTime: moment(endTime).add(1, "hour"),
            size: endTime.diff(startTime, "hours"),
        }
        return window;
    }

    public get fallAsleepTime(): moment.Moment{
        let fallAsleepTime = this.sleepStructureDataItems.find((item)=>{
            return item.sleepAction == DayStructureSleepCycleAction.FallAsleep;
        });
        if(fallAsleepTime){
            return moment(fallAsleepTime.time);
        }else{
            console.log("Error with fallAsleepTime");
        }
    }
    public get wakeUpTime(): moment.Moment{
        let wakeUpTime = this.sleepStructureDataItems.find((item)=>{
            return item.sleepAction == DayStructureSleepCycleAction.WakeUp;
        });
        if(wakeUpTime){
            return moment(wakeUpTime.time);
        }else{
            console.log("Error with fallAsleepTime");
        }
    }


    public timelogEntryStartTime(fromNow: moment.Moment): moment.Moment {
        let startTime: moment.Moment = moment();
        if (this.daybookTimelogEntryDataItems.length > 0) {
            console.log("there were timelog entries already, so returning the end of the most recent one.")
            startTime = moment(this.daybookTimelogEntryDataItems[this.daybookTimelogEntryDataItems.length - 1].endTimeISO);
        } else {
            console.log("returning the most recent daystructure item")
            let filtered = this.dayStructureDataItems.filter((structureItem) => {
                return moment(structureItem.startTimeISO).isBefore(fromNow);
            });
            startTime = moment(filtered[filtered.length - 1].startTimeISO);
        }
        console.log("timelogEntryStartTime value: ", startTime.format("hh:mm a"));
        return startTime;
    }

    public addTimelogEntryItem(timelogEntry: DaybookTimelogEntryDataItem) {
        let timelogEntries = this.daybookTimelogEntryDataItems;
        timelogEntries.push(timelogEntry);
        this.daybookTimelogEntryDataItems = timelogEntries;
        this.dataChanged();
    }
    public updateTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem) {
        console.log("Warning: updateTimelogEntry(): this method is not implemented in daybook-day-item.class.ts")
    }
    public deleteTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem) {
        if (this.daybookTimelogEntryDataItems.indexOf(timelogEntry) > -1) {
            this.daybookTimelogEntryDataItems.splice(this.daybookTimelogEntryDataItems.indexOf(timelogEntry), 1);
            this.dataChanged();
        } else {
            console.log("Error: can't delete timelogEntry", timelogEntry)
        }
    }


}