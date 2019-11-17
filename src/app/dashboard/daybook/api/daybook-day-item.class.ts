
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';
import { Subject, Observable, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItemSleepProfileData } from './data-items/daybook-day-item-sleep-profile-data.interface';
import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition.class';
import { ActivityTree } from '../../activities/api/activity-tree.class';
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';
import { DaybookDayItemTimelog } from './controllers/daybook-day-item-timelog.class';
import blankDaybookItemHttpShape from './data-items/blank-http-shape';
import { DaybookSleepProfile } from './controllers/daybook-sleep-profile.class';
import { DaybookTimeReferencer } from './controllers/daybook-time-referencer.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';


export class DaybookDayItem {

    constructor(dateYYYYMMDD: string) {
        // console.log("CONSTRUCTING DAYBOOK ITEM: " + dateYYYYMMDD)
        let shape: DaybookDayItemHttpShape = Object.assign({}, blankDaybookItemHttpShape);
        shape.dateYYYYMMDD = dateYYYYMMDD;
        this.setHttpShape(shape);
    }


    private _httpShape: DaybookDayItemHttpShape;
    private _timelog: DaybookDayItemTimelog;
    private _sleepProfile: DaybookSleepProfile;
    private _timeReferencer: DaybookTimeReferencer;
    private _previousDay: DaybookDayItem;
    private _followingDay: DaybookDayItem;
    private _isToday: boolean;

    private _dataChangedSubscriptions: Subscription[] = [];
    private _dataChanged$: Subject<{ prev: boolean, current: boolean, next: boolean }> = new Subject();


    public setHttpShape(shape: DaybookDayItemHttpShape) {
        this._httpShape = Object.assign({}, shape);
        this._rebuild();
    }
    private _rebuild() {
        this._timelog = new DaybookDayItemTimelog(this.httpShape);
        this._sleepProfile = new DaybookSleepProfile(this.httpShape);
        this._timeReferencer = new DaybookTimeReferencer(this.timelog, this.sleepProfile, this.dateYYYYMMDD);
        // console.log("Time referencer constructed")
        this._updateDataChangedSubscriptions();
    }

    private _updateDataChangedSubscriptions() {
        this._dataChangedSubscriptions.forEach((sub) => { sub.unsubscribe(); });
        this._dataChangedSubscriptions = [];

        this._dataChangedSubscriptions.push(this._timeReferencer.dataChanged$.subscribe((dataChanged: boolean) => {
            if (dataChanged === true) {
                this._httpShape.daybookTimelogEntryDataItems = this._timeReferencer.daybookTimelogEntryDataItems;
                this._httpShape.timeDelineators = this._timeReferencer.timeDelineators;
                this._httpShape.sleepProfile = this._timeReferencer.sleepProfileData;

                // if(this._timeReferencer.previousDataChanged){
                //     this.previousDay.setSleepChangesFromTimeReferencer(this._timeReferencer.previousSleep);
                // }
                // if(this._timeReferencer.followingDataChanged){
                //     this.followingDay.setSleepChangesFromTimeReferencer(this._timeReferencer.followingSleep);
                // }

                let saveItems: { prev: boolean, current: boolean, next: boolean } = {
                    prev: this._timeReferencer.previousDataChanged,
                    current: true,
                    next: this._timeReferencer.followingDataChanged,
                }
                console.log('Daybook day item: ' + this.dateYYYYMMDD + ' Saving changes:', saveItems);
                this.dataChanged(saveItems);
            }
        }));
    }

    public get dataChanged$(): Observable<{ prev: boolean, current: boolean, next: boolean }> { return this._dataChanged$.asObservable(); }
    private dataChanged(saveItems: { prev: boolean, current: boolean, next: boolean }) { this._dataChanged$.next(saveItems); }



    public set previousDay(previousDay: DaybookDayItem) {
        if (previousDay) {
            this._previousDay = previousDay;
            this._timeReferencer.addPreviousDateInfo(this.previousDay.timelog, this.previousDay.sleepProfile);
        }

    }
    public set followingDay(followingDay: DaybookDayItem) {
        if (followingDay) {
            this._followingDay = followingDay;
            this._timeReferencer.addFollowingDateInfo(this.followingDay.timelog, this.followingDay.sleepProfile);
        }

    }


    public set id(id: string) { this._httpShape._id = id; }
    public set userId(userId: string) { this._httpShape.userId = userId; }

    public get httpShape(): DaybookDayItemHttpShape { return this._httpShape; }
    public get timelog(): DaybookDayItemTimelog { return this._timelog; };
    public get sleepProfile(): DaybookSleepProfile { return this._sleepProfile; }
    public get timeReferencer(): DaybookTimeReferencer { return this._timeReferencer; }
    public get previousDay(): DaybookDayItem { return this._previousDay; }
    public get followingDay(): DaybookDayItem { return this._followingDay; }

    public get id(): string { return this.httpShape._id; }
    public get userId(): string { return this.httpShape.userId; }
    public get dateYYYYMMDD(): string { return this.httpShape.dateYYYYMMDD; }
    public get timeDelineators(): string[] { return this.httpShape.timeDelineators; }
    public get dayTemplateId(): string { return this.httpShape.dayTemplateId; }
    public get scheduledEventIds(): string[] { return this.httpShape.scheduledEventIds; }
    public get notebookEntryIds(): string[] { return this.httpShape.notebookEntryIds; }
    public get taskItemIds(): string[] { return this.httpShape.taskItemIds; }


    public get isToday(): boolean { return this._isToday; }
    public setIsToday() { this._isToday = true; }

    public setSleepChangesFromTimeReferencer(sleepProfile: DaybookSleepProfile) {
        this._httpShape.sleepProfile = sleepProfile.sleepProfileData;
    }


    // public get daybookActivityDataItems(): DaybookActivityDataItem[] { return this.httpShape.daybookActivityDataItems; }
    // // private updateActivityDataItems() {
    // //     console.log("Not implemented: Updating Activity Data Items");
    // //     let activityDataItems: DaybookActivityDataItem[] = [];
    // //     this._httpShape.daybookActivityDataItems = activityDataItems;
    // // }

    // public get dayStructureDataItems(): DayStructureDataItem[] { return this.httpShape.dayStructureDataItems; }
    // public set dayStructureDataItems(dayStructureDataItems: DayStructureDataItem[]) {
    //     this._httpShape.dayStructureDataItems = dayStructureDataItems;
    //     this.dataChanged();
    // }

    // public get sleepStructureDataItems(): DayStructureSleepCycleDataItem[] { return this.httpShape.sleepCycleDataItems; }
    // public set sleepStructureDataItems(sleepCycleItems: DayStructureSleepCycleDataItem[]) {
    //     this._httpShape.sleepCycleDataItems = sleepCycleItems;
    //     this.dataChanged();
    // }


    public get dailyWeightLogEntryKg(): number { return this.httpShape.dailyWeightLogEntryKg; }
    public set dailyWeightLogEntryKg(kg: number) {
        this._httpShape.dailyWeightLogEntryKg = kg;
        this.dataChanged({ prev: false, current: true, next: false });
    }

    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this.httpShape.dailyTaskListDataItems; }

    // public set taskItemIds(taskItemIds: string[]) {this._httpShape.taskItemIds = taskItemIds;this.dataChanged();}
    // public set dailyTaskListDataItems(dailyTaskListDataItems: DailyTaskListDataItem[]) { this._httpShape.dailyTaskListDataItems = dailyTaskListDataItems; this.dataChanged(); }
    // public set dayTemplateId(dayTemplateId: string) { this._httpShape.dayTemplateId = dayTemplateId; this.dataChanged(); }
    // public set scheduledEventIds(scheduledEventIds: string[]) { this._httpShape.scheduledEventIds = scheduledEventIds; this.dataChanged(); }
    // public set notebookEntryIds(notebookEntryIds: string[]) { this._httpShape.notebookEntryIds = notebookEntryIds; this.dataChanged(); }



    public saveTimelogEntry(timelogEntry: TimelogEntryItem, afterMidnightEntry?: TimelogEntryItem) {
        this.timelog.addTimelogEntryItem(timelogEntry);
        if (afterMidnightEntry) {
            console.log('Warning: this shit probably won\'t work');
            this.followingDay.timelog.addTimelogEntryItem(afterMidnightEntry);
        }
    }

    public updateTimelogEntry(timelogEntry: TimelogEntryItem) {
        this.timelog.updateTimelogEntry(timelogEntry);
    }

    public deleteTimelogEntry(timelogEntry: TimelogEntryItem) {
        console.log("DEleting" , timelogEntry)
        this.timelog.deleteTimelogEntry(timelogEntry);
    }






    // public get scheduledRoutines(): ActivityCategoryDefinition[] {
    //     // return this._scheduledActivities.filter((scheduledActivity)=>{
    //     //     return scheduledActivity.isRoutine;
    //     // });
    //     // console.log("Warning: method disabled.");
    //     return [];
    // }


    private _scheduledActivities: DaybookDayItemScheduledActivity[] = [];
    public buildScheduledActivities(activityTree: ActivityTree) {
        this._scheduledActivities = this.scheduledActivityItems.map((activityItem: DaybookDayItemScheduledActivityItem) => {
            let activityDefinition: ActivityCategoryDefinition = activityTree.findActivityByTreeId(activityItem.activityTreeId);
            if (activityDefinition) {
                return this.buildScheduledActivity(activityItem, activityDefinition, activityTree);
            } else {
                // console.log("Could not find activity by tree id ", activityItem.activityTreeId)
            }
        });
        // console.log("this.scheduledActrivities", this._scheduledActivities);
    }
    private buildScheduledActivity(activityItem: DaybookDayItemScheduledActivityItem, activityDefinition: ActivityCategoryDefinition, activityTree: ActivityTree): DaybookDayItemScheduledActivity {
        let newScheduledActivity = new DaybookDayItemScheduledActivity(activityItem, activityDefinition);
        if (activityItem.routineMemberActivities.length > 0) {
            newScheduledActivity.setRoutineMembers(activityTree);
        }
        return newScheduledActivity;
    }
    public get scheduledActivities(): DaybookDayItemScheduledActivity[] {
        return this._scheduledActivities;
    }
    public get scheduledActivityItems(): DaybookDayItemScheduledActivityItem[] {
        return this.httpShape.scheduledActivityItems;
    }
    public setScheduledActivityItems(items: DaybookDayItemScheduledActivityItem[], activityTree: ActivityTree) {
        this._httpShape.scheduledActivityItems = items;
        this.buildScheduledActivities(activityTree);
        this.dataChanged({ prev: false, current: true, next: false });
    }
    public updateScheduledActivityItems(updateScheduledActivityItems: DaybookDayItemScheduledActivityItem[]) {
        this._httpShape.scheduledActivityItems.forEach((storedItem) => {
            updateScheduledActivityItems.forEach((updateItem) => {
                if (storedItem.activityTreeId == updateItem.activityTreeId) {
                    storedItem = updateItem;
                }
            });
        });
        this.dataChanged({ prev: false, current: true, next: false });
    }

}
