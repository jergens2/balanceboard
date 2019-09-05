
import { DaybookDayItemHttpShape } from "./daybook-day-item-http-shape.interface";
import { DaybookTimelogEntryDataItem } from "./data-items/daybook-timelog-entry-data-item.interface";
import { DaybookActivityDataItem } from "./data-items/daybook-activity-data-item.interface";
import { DailyTaskListDataItem } from "./data-items/daily-task-list-data-item.interface";
import { Subject, Observable, scheduled } from "rxjs";
import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureSleepCycleAction } from "./data-items/day-structure-sleep-cycle-action.enum";
import { TimelogWindow } from "../widgets/timelog/timelog-large/timelog-chart/timelog-window.interface";
import { DayStructureSleepCycleDataItem } from "./data-items/day-structure-sleep-cycle-data-item.interface";
import { DaybookDayItemSleepProfile } from "./data-items/daybook-day-item-sleep-profile.interface";
import { SleepQuality } from "../widgets/timelog/timelog-entry-form/form-sections/sleep-section/sleep-quality.enum";
import { ActivityCategoryDefinition } from "../../activities/api/activity-category-definition.class";
import { ActivityTree } from "../../activities/api/activity-tree.class";

export class DaybookDayItem{


    private _httpShape: DaybookDayItemHttpShape;
    public setHttpShape(shape: DaybookDayItemHttpShape) {
        this._httpShape = shape;
    }
    public get httpShape(): DaybookDayItemHttpShape {
        return this._httpShape;
    }

    constructor(dateYYYYMMDD) {
        console.log("Do we even need sleep Cycle data items, or do we just use the sleep profile, or... ? What is the difference?")
        let shape: DaybookDayItemHttpShape = {
            _id: "",
            userId: "",
            dateYYYYMMDD: dateYYYYMMDD,
            daybookTimelogEntryDataItems: [],
            daybookActivityDataItems: [],
            dailyTaskListDataItems: [],
            dayStructureDataItems: [],
            sleepCycleDataItems: [],
            sleepProfile: {
                previousFallAsleepTimeISO: "",
                previousFallAsleepTimeUtcOffsetMinutes: 0,
                wakeupTimeISO: "",
                wakeupTimeUtcOffsetMinutes: 0,
                sleepQuality: SleepQuality.Okay,
                bedtimeISO: "",
                bedtimeUtcOffsetMinutes: 0,
            },
            dailyWeightLogEntryKg: 0,
            scheduledActivityIds: [],
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

    public get sleepProfile(): DaybookDayItemSleepProfile { return this._httpShape.sleepProfile; }
    public set sleepProfile(sleepProfile: DaybookDayItemSleepProfile) {
        this._httpShape.sleepProfile = sleepProfile;
        console.log("Sleep profile changed:", this._httpShape.sleepProfile)
        this.dataChanged();
    }
    // public get sleepQuality(): SleepQuality{
    //     if(this._httpShape.sleepProfile.sleepQuality)
    // }

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

    

    public get scheduledRoutines(): ActivityCategoryDefinition[]{ 
        return this._scheduledActivities.filter((scheduledActivity)=>{
            return scheduledActivity.isRoutine;
        });
    }


    private _scheduledActivities: ActivityCategoryDefinition[] = [];
    public set scheduledActivities(scheduledActivities: ActivityCategoryDefinition[]){
        console.log("Setting", scheduledActivities)
        this._scheduledActivities = scheduledActivities;
        this._httpShape.scheduledActivityIds = scheduledActivities.map((scheduledActivity)=>{ return scheduledActivity.treeId; });
        console.log("we set the thingL ", this._httpShape.scheduledActivityIds);
        this.dataChanged();
    }
    public get scheduledActivities(): ActivityCategoryDefinition[]{ 
        return this._scheduledActivities;
    }
    public get scheduledActivityIds(): string[]{ 
        return this.httpShape.scheduledActivityIds;
    }




    private dataChanged() {
        console.log("* * * DaybookDayItem: " + this.dateYYYYMMDD + " - Data has changed.  Saving.")
        this._dataChanged$.next(true);
    }
    private _dataChanged$: Subject<boolean> = new Subject();
    public get dataChanged$(): Observable<boolean> {
        return this._dataChanged$.asObservable();
    }



    public getTimelogWindow(windowSizeHours: number): TimelogWindow {
        /**
         *  I think I might just get rid of the TimelogWindow entirely, and just use the 2 variables as reference points (wakeup and fallasleep time);
         */
        console.log("Getting timelog window.  Do we even still need this method?")
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


    public get timeOfLastAction(): moment.Moment{
        /* This method is a time marker of the last thing that the user inputted in the day,
        *   For example, I open BB at 10:30pm, and mark down what I did from 6pm to 10:30pm, and that's the last action I do that day.
            
        */
        console.log("Not implemented");
        // if(this.)
        
        return moment();
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