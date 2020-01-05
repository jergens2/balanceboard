
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';
import { Subject, Observable, Subscription } from 'rxjs';
import * as moment from 'moment';

import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition.class';
import { ActivityTree } from '../../activities/api/activity-tree.class';
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';
import { DaybookDayItemTimelog } from '../controller/daybook-day-item-timelog.class';
import blankDaybookItemHttpShape from './data-items/blank-http-shape';
import { DaybookTimeReferencer } from './controllers/daybook-time-referencer.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeSpanItem } from './data-items/time-span-item.interface';
import { SleepEnergyLevelInput } from './data-items/energy-level-input.interface';


export class DaybookDayItem {

    constructor(dateYYYYMMDD: string) {
        // console.log("CONSTRUCTING DAYBOOK ITEM: " + dateYYYYMMDD)
        const shape: DaybookDayItemHttpShape = Object.assign({}, blankDaybookItemHttpShape);
        shape.dateYYYYMMDD = dateYYYYMMDD;
        this.setHttpShape(shape);
    }

    private _httpShape: DaybookDayItemHttpShape;
    private _isToday: boolean;

    private _scheduledActivities: DaybookDayItemScheduledActivity[] = [];

    public setHttpShape(shape: DaybookDayItemHttpShape) {
        // console.log("Setting shape: " , shape);
        this._httpShape = Object.assign({}, shape);
    }

    public set id(id: string) { this._httpShape._id = id; }
    public set userId(userId: string) { this._httpShape.userId = userId; }

    public set sleepTimes(times: TimeSpanItem[]) { this._httpShape.sleepTimes = times; }

    public get httpShape(): DaybookDayItemHttpShape { return this._httpShape; }

    public get id(): string { return this.httpShape._id; }
    public get userId(): string { return this.httpShape.userId; }
    public get dateYYYYMMDD(): string { return this.httpShape.dateYYYYMMDD; }
    public get timeDelineators(): string[] { return this.httpShape.timeDelineators; }
    public get sleepTimes(): TimeSpanItem[] { return this.httpShape.sleepTimes; }
    public get timelogEntryDataItems(): DaybookTimelogEntryDataItem[] { return this.httpShape.daybookTimelogEntryDataItems; }
    public get sleepEnergyLevelInputs(): SleepEnergyLevelInput[] { return this.httpShape.sleepEnergyLevelInputs; }
    public get dayTemplateId(): string { return this.httpShape.dayTemplateId; }
    public get scheduledEventIds(): string[] { return this.httpShape.scheduledEventIds; }
    public get notebookEntryIds(): string[] { return this.httpShape.notebookEntryIds; }
    public get taskItemIds(): string[] { return this.httpShape.taskItemIds; }


    public get isToday(): boolean { return this._isToday; }
    public setIsToday() { this._isToday = true; }

    public set timelogEntryDataItems(items: DaybookTimelogEntryDataItem[]){
        console.log(this.dateYYYYMMDD + ": setting tle items: " , items)
        this._httpShape.daybookTimelogEntryDataItems = items;
    }


    public get dailyWeightLogEntryKg(): number { return this.httpShape.dailyWeightLogEntryKg; }
    public set dailyWeightLogEntryKg(kg: number) { this._httpShape.dailyWeightLogEntryKg = kg; }

    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this.httpShape.dailyTaskListDataItems; }


    public buildScheduledActivities(activityTree: ActivityTree) {
        this._scheduledActivities = this.scheduledActivityItems.map((activityItem: DaybookDayItemScheduledActivityItem) => {
            const activityDefinition: ActivityCategoryDefinition = activityTree.findActivityByTreeId(activityItem.activityTreeId);
            if (activityDefinition) {
                return this.buildScheduledActivity(activityItem, activityDefinition, activityTree);
            } else {
                // console.log("Could not find activity by tree id ", activityItem.activityTreeId)
            }
        });
        // console.log("this.scheduledActrivities", this._scheduledActivities);
    }
    private buildScheduledActivity(
        activityItem: DaybookDayItemScheduledActivityItem,
        activityDefinition: ActivityCategoryDefinition, activityTree: ActivityTree): DaybookDayItemScheduledActivity {

        const newScheduledActivity = new DaybookDayItemScheduledActivity(activityItem, activityDefinition);
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
        // this.dataChanged({ prev: false, current: true, next: false });
    }
    public updateScheduledActivityItems(updateScheduledActivityItems: DaybookDayItemScheduledActivityItem[]) {
        this._httpShape.scheduledActivityItems.forEach((storedItem) => {
            updateScheduledActivityItems.forEach((updateItem) => {
                if (storedItem.activityTreeId == updateItem.activityTreeId) {
                    storedItem = updateItem;
                }
            });
        });
        // this.dataChanged({ prev: false, current: true, next: false });
    }

}
