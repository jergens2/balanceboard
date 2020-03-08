
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';

import * as moment from 'moment';

import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition.class';
import { ActivityTree } from '../../activities/api/activity-tree.class';
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';

import blankDaybookItemHttpShape from './data-items/blank-http-shape';
import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import { SleepEnergyLevelInput } from './data-items/energy-level-input.interface';
import { DaybookSleepInputDataItem } from './data-items/daybook-sleep-input-data-item.interface';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';


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

    // public set sleepDataItems(items: DaybookSleepInputDataItem[]) { this._httpShape.sleepInputItems = items; }

    public get httpShape(): DaybookDayItemHttpShape { return this._httpShape; }

    public get id(): string { return this.httpShape._id; }
    public get userId(): string { return this.httpShape.userId; }
    public get dateYYYYMMDD(): string { return this.httpShape.dateYYYYMMDD; }
    public get startOfThisDay(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day'); }
    public get endOfThisDay(): moment.Moment { return moment(this.startOfThisDay).add(24, 'hours'); }
    public get timeDelineators(): moment.Moment[] { return this.httpShape.timeDelineators.map(timeString => moment(timeString)); }
    public get timelogEntryDataItems(): DaybookTimelogEntryDataItem[] { return this.httpShape.daybookTimelogEntryDataItems; }
    public get dayTemplateId(): string { return this.httpShape.dayTemplateId; }
    public get scheduledEventIds(): string[] { return this.httpShape.scheduledEventIds; }
    public get notebookEntryIds(): string[] { return this.httpShape.notebookEntryIds; }
    public get taskItemIds(): string[] { return this.httpShape.taskItemIds; }

    public get sleepInputItem(): DaybookSleepInputDataItem { return this.httpShape.sleepInputItem }
    public set sleepInputItem(item: DaybookSleepInputDataItem) { this._httpShape.sleepInputItem = item; }

    public getSleepEntryItem(): SleepEntryItem { 
        if(this.sleepInputItem.startSleepTimeISO && this.sleepInputItem.endSleepTimeISO){
            const startTime = moment(this.sleepInputItem.startSleepTimeISO);
            const endTime = moment(this.sleepInputItem.endSleepTimeISO);
            return new SleepEntryItem(this.dateYYYYMMDD, startTime, endTime, this.sleepInputItem);
        }else{
            return null;
        }
        
    }

    public get isToday(): boolean { return this._isToday; }
    public setIsToday() { this._isToday = true; }

    public set timelogEntryDataItems(items: DaybookTimelogEntryDataItem[]) {
        // console.log(this.dateYYYYMMDD + ": setting tle items: ", items)
        this._httpShape.daybookTimelogEntryDataItems = items;
    }

    public set timeDelineators(timeDelineators: moment.Moment[]) { this._httpShape.timeDelineators = timeDelineators.map(item => item.toISOString()); }


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
