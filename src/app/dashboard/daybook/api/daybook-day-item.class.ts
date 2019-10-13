
import { DaybookDayItemHttpShape } from "./daybook-day-item-http-shape.interface";
import { DaybookTimelogEntryDataItem } from "./data-items/daybook-timelog-entry-data-item.interface";
import { DaybookActivityDataItem } from "./data-items/daybook-activity-data-item.interface";
import { DailyTaskListDataItem } from "./data-items/daily-task-list-data-item.interface";
import { Subject, Observable, scheduled, timer } from "rxjs";
import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import * as moment from 'moment';
import { DayStructureSleepCycleDataItem } from "./data-items/day-structure-sleep-cycle-data-item.interface";
import { DaybookDayItemSleepProfile } from "./data-items/daybook-day-item-sleep-profile.interface";
import { ActivityCategoryDefinition } from "../../activities/api/activity-category-definition.class";
import { ActivityTree } from "../../activities/api/activity-tree.class";
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from "./data-items/daybook-day-item-scheduled-activity.class";
import { DaybookTimeReferencer } from "./daybook-time-referencer.class";


export class DaybookDayItem{


    private _httpShape: DaybookDayItemHttpShape;
    public setHttpShape(shape: DaybookDayItemHttpShape) {
        this._httpShape = shape;
        this.buildTimeReferencer();
    }
    public get httpShape(): DaybookDayItemHttpShape {
        return this._httpShape;
    }

    constructor(dateYYYYMMDD) {
        // console.log("Do we even need sleep Cycle data items, or do we just use the sleep profile, or... ? What is the difference?")
        // console.log("CONSTRUCTING DAYBOOK ITEM: " + dateYYYYMMDD)
        let shape: DaybookDayItemHttpShape = {
            _id: "",
            userId: "",
            dateYYYYMMDD: dateYYYYMMDD,
            daybookTimelogEntryDataItems: [],
            timeDelineators: [],
            daybookActivityDataItems: [],
            dailyTaskListDataItems: [],
            dayStructureDataItems: [],
            sleepCycleDataItems: [],
            sleepProfile: {
                sleepQuality: null,
                previousFallAsleepTimeISO: "",
                previousFallAsleepTimeUtcOffsetMinutes: -1,
                wakeupTimeISO: "",
                wakeupTimeUtcOffsetMinutes: -1,
                bedtimeISO: "",
                bedtimeUtcOffsetMinutes: -1,
                fallAsleepTimeISO: "",
                fallAsleepTimeUtcOffsetMinutes: -1,
            },
            dailyWeightLogEntryKg: -1,
            scheduledActivityItems: [],  // this includes activities and routines.: [],
            dayTemplateId: "",
            scheduledEventIds: [],
            notebookEntryIds: [],
            taskItemIds: [],
        }
        this.setHttpShape(shape);
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
        this.dataChanged();
    }
    public get timeDelineators(): string[] {return this.httpShape.timeDelineators; }
    public set timeDelineators(timeDelineators: string[]){ 
        console.log("setting Time delineators ")
        this._httpShape.timeDelineators = timeDelineators; 
        this.dataChanged();
    }
    public addTimeDelineator(delineatorTimeISO: string){
        let timeDelineators = this.timeDelineators;
        if(timeDelineators.indexOf(delineatorTimeISO) == -1){
            timeDelineators.push(delineatorTimeISO);
            this.timeDelineators = timeDelineators;
        }
    }
    public removeTimeDelineator(delineator: string){
        let timeDelineators = this.timeDelineators;
        if(timeDelineators.indexOf(delineator) > -1){
            timeDelineators.splice(timeDelineators.indexOf(delineator), 1);
            this.timeDelineators = timeDelineators;
        }
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
        // console.log("Sleep profile changed:", this._httpShape.sleepProfile)
        this.dataChanged();
    }
    public get sleepProfileIsSet(): boolean {
        return this.sleepProfile.bedtimeISO != "" && this.sleepProfile.previousFallAsleepTimeISO != "" && this.sleepProfile.wakeupTimeISO != "";
    }


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
            }else{
                // console.log("Could not find activity by tree id ", activityItem.activityTreeId)
            }
        });
        // console.log("this.scheduledActrivities", this._scheduledActivities);
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
    public updateScheduledActivityItems(updateScheduledActivityItems: DaybookDayItemScheduledActivityItem[]){
        this._httpShape.scheduledActivityItems.forEach((storedItem)=>{
            updateScheduledActivityItems.forEach((updateItem)=>{
                if(storedItem.activityTreeId == updateItem.activityTreeId){
                    storedItem = updateItem;
                }
            });
        });
        this.dataChanged();
    }





    private dataChanged() {
        // console.log(this.dateYYYYMMDD + " DaybookDayItem dataChanged().")
        this._dataChanged$.next(true);
    }
    private _dataChanged$: Subject<boolean> = new Subject();
    public get dataChanged$(): Observable<boolean> {
        return this._dataChanged$.asObservable();
    }



    private _timeReferencer: DaybookTimeReferencer = null;
    public get timeReferencer(): DaybookTimeReferencer{
        return this._timeReferencer;
    }
    private buildTimeReferencer(){
        let timeReferencer: DaybookTimeReferencer = new DaybookTimeReferencer(this.dateYYYYMMDD, this.dayStructureDataItems, this.sleepProfile, this.daybookTimelogEntryDataItems);
        this._timeReferencer = timeReferencer;
    }


    public get wakeupTime(): moment.Moment{
        return this.timeReferencer.wakeupTime;
    }
    public get bedtime(): moment.Moment{
        return this.timeReferencer.bedtime;
    }
    public get fallAsleepTime(): moment.Moment{
        return this.timeReferencer.fallAsleepTime;
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