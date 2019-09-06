
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
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from "./data-items/daybook-day-item-scheduled-activity.class";

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
            scheduledActivityItems: [],  // this includes activities and routines.: [],
            dayTemplateId: "",
            scheduledEventIds: [],
            notebookEntryIds: [],
            taskItemIds: [],
        }
        this.setHttpShape(shape);
    }


    public get id(): string { return this.httpShape._id; }
    public set id(id: string) {
        this._httpShape._id = id;
    }
    public get userId(): string { return this.httpShape.userId; }
    public set userId(userId: string) {
        this._httpShape.userId = userId;
    }

    public get dateYYYYMMDD(): string { return this.httpShape.dateYYYYMMDD; }

    public get daybookTimelogEntryDataItems(): DaybookTimelogEntryDataItem[] { return this.httpShape.daybookTimelogEntryDataItems; }
    public set daybookTimelogEntryDataItems(timelogEntries: DaybookTimelogEntryDataItem[]) {
        this._httpShape.daybookTimelogEntryDataItems = timelogEntries;
        this.updateActivityDataItems();
    }
    public get daybookActivityDataItems(): DaybookActivityDataItem[] { return this.httpShape.daybookActivityDataItems; }
    private updateActivityDataItems() {
        console.log("Not implemented: Updating Activity Data Items");
        let activityDataItems: DaybookActivityDataItem[] = [];
        this._httpShape.daybookActivityDataItems = activityDataItems;
    }

    public get dayStructureDataItems(): DayStructureDataItem[] { return this.httpShape.dayStructureDataItems; }
    public set dayStructureDataItems(dayStructureDataItems: DayStructureDataItem[]) {
        this._httpShape.dayStructureDataItems = dayStructureDataItems;
        this.dataChanged();
    }

    public get sleepStructureDataItems(): DayStructureSleepCycleDataItem[] { return this.httpShape.sleepCycleDataItems; }
    public set sleepStructureDataItems(sleepCycleItems: DayStructureSleepCycleDataItem[]) {
        this._httpShape.sleepCycleDataItems = sleepCycleItems;
        this.dataChanged();
    }

    public get sleepProfile(): DaybookDayItemSleepProfile { return this.httpShape.sleepProfile; }
    public set sleepProfile(sleepProfile: DaybookDayItemSleepProfile) {
        this._httpShape.sleepProfile = sleepProfile;
        console.log("Sleep profile changed:", this._httpShape.sleepProfile)
        this.dataChanged();
    }
    // public get sleepQuality(): SleepQuality{
    //     if(this._httpShape.sleepProfile.sleepQuality)
    // }

    public get dailyWeightLogEntryKg(): number { return this.httpShape.dailyWeightLogEntryKg; }
    public set dailyWeightLogEntryKg(kg: number){ 
        this._httpShape.dailyWeightLogEntryKg = kg;
        this.dataChanged();
    }
    
    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this.httpShape.dailyTaskListDataItems; }
    
    public get dayTemplateId(): string { return this.httpShape.dayTemplateId; }
    public get scheduledEventIds(): string[] { return this.httpShape.scheduledEventIds; }
    public get notebookEntryIds(): string[] { return this.httpShape.notebookEntryIds; }
    public get taskItemIds(): string[] { return this.httpShape.taskItemIds; }



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
        // return this._scheduledActivities.filter((scheduledActivity)=>{
        //     return scheduledActivity.isRoutine;
        // });
        console.log("Warning: method disabled.");
        return [];
    }


    private _scheduledActivities: DaybookDayItemScheduledActivity[] = [];
    public buildScheduledActivities(activityTree: ActivityTree){
        this._scheduledActivities = this.scheduledActivityItems.map((activityItem: DaybookDayItemScheduledActivityItem)=>{ 
            let activityDefinition: ActivityCategoryDefinition = activityTree.findActivityByTreeId(activityItem.activityTreeId);
            if(activityDefinition){
                return this.buildScheduledActivity(activityItem, activityDefinition, activityTree);
            }
        });
    }
    private buildScheduledActivity(activityItem: DaybookDayItemScheduledActivityItem, activityDefinition: ActivityCategoryDefinition, activityTree: ActivityTree): DaybookDayItemScheduledActivity{
        let newScheduledActivity = new DaybookDayItemScheduledActivity(activityItem, activityDefinition);
        if(activityItem.routineMemberActivities.length > 0){
            newScheduledActivity.setRoutineMembers(activityTree);
        }
        return newScheduledActivity;
    }
    public get scheduledActivities(): DaybookDayItemScheduledActivity[]{
        return this._scheduledActivities;
    }
    public get scheduledActivityItems(): DaybookDayItemScheduledActivityItem[]{ 
        return this.httpShape.scheduledActivityItems;
    }
    public setScheduledActivityItems(items: DaybookDayItemScheduledActivityItem[], activityTree: ActivityTree){
        this._httpShape.scheduledActivityItems = items;
        this.buildScheduledActivities(activityTree);
        this.dataChanged();
    }





    private dataChanged() {
        console.log(this.dateYYYYMMDD + " DaybookDayItem dataChanged().")
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