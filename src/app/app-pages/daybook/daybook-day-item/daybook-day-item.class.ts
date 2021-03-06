
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { DaybookTimelogEntryDataItem } from './data-items/daybook-timelog-entry-data-item.interface';
import { DailyTaskListDataItem } from './data-items/daily-task-list-data-item.interface';

import * as moment from 'moment';

import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition.class';
import { ActivityDefinitionTree } from '../../activities/api/activity-definition-tree.class';
import { DaybookDayItemScheduledActivity, DaybookDayItemScheduledActivityItem } from './data-items/daybook-day-item-scheduled-activity.class';

import blankDaybookItemHttpShape from './data-items/blank-http-shape';
import { DaybookSleepInputDataItem } from './data-items/daybook-sleep-input-data-item.interface';


export class DaybookDayItem {

    constructor(dateYYYYMMDD: string, isSavedItem: boolean = true) {
        // console.log("CONSTRUCTING DAYBOOK ITEM: " + dateYYYYMMDD)
        const shape: DaybookDayItemHttpShape = Object.assign({}, blankDaybookItemHttpShape);
        shape.dateYYYYMMDD = dateYYYYMMDD;
        this.setHttpShape(shape);
        this._isSavedItem = isSavedItem;
    }

    private _httpShape: DaybookDayItemHttpShape;
    private _isToday: boolean;
    private _isSavedItem: boolean;

    private _scheduledActivities: DaybookDayItemScheduledActivity[] = [];

    public setHttpShape(shape: DaybookDayItemHttpShape) {
        // console.log("Setting shape: " , shape);
        this._httpShape = Object.assign({}, shape);
    }

    public set id(id: string) { this._httpShape._id = id; }
    public set userId(userId: string) { this._httpShape.userId = userId; }

    // public set sleepDataItems(items: DaybookSleepInputDataItem[]) { this._httpShape.sleepInputItems = items; }

    public get httpShape(): DaybookDayItemHttpShape { return this._httpShape; }
    public get isSavedItem(): boolean { return this._isSavedItem; }

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

    public get sleepInputItems(): DaybookSleepInputDataItem[] { return this.httpShape.sleepInputItems }
    public set sleepInputItems(items: DaybookSleepInputDataItem[]) { this._httpShape.sleepInputItems = items; }

    public toString(): string {
        return "" + this.dateYYYYMMDD + " " + this.sleepInputItems.length + " sleep items (" +
            this.hasSleepItems + "), and " + this.timelogEntryDataItems.length + " timelog items";
    }
    public sleepItemsToString(): string {
        let strVal = this.dateYYYYMMDD + "\n";
        if (this.sleepInputItems.length > 0) {
            this.sleepInputItems.forEach(item => {
                strVal += "\tFrom: " + moment(item.startSleepTimeISO).format('YYYY-MM-DD hh:mm a') + " ";
                strVal += "To: " + moment(item.endSleepTimeISO).format('YYYY-MM-DD hh:mm a');
                strVal += "\n";
            });
        } else {
            strVal = this.dateYYYYMMDD + "  no sleep items for this day."
        }
        return strVal;
    }

    public get hasSleepItems(): boolean {
        return this.sleepInputItems.length > 0;
    }



    public get isToday(): boolean { return this._isToday; }
    public setIsToday() { this._isToday = true; }

    public set timelogEntryDataItems(items: DaybookTimelogEntryDataItem[]) {
        // console.log(this.dateYYYYMMDD + ": setting tle items: ", items)
        this._httpShape.daybookTimelogEntryDataItems = items;
    }

    public set timeDelineators(timeDelineators: moment.Moment[]) {
        this._httpShape.timeDelineators = timeDelineators.map(item => item.toISOString());
    }


    public get dailyWeightLogEntryKg(): number { return this.httpShape.dailyWeightLogEntryKg; }
    public set dailyWeightLogEntryKg(kg: number) { this._httpShape.dailyWeightLogEntryKg = kg; }

    public get dailyTaskListDataItems(): DailyTaskListDataItem[] { return this.httpShape.dailyTaskListDataItems; }


    public buildScheduledActivities(activityTree: ActivityDefinitionTree) {
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
        activityDefinition: ActivityCategoryDefinition, activityTree: ActivityDefinitionTree): DaybookDayItemScheduledActivity {

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
    public setScheduledActivityItems(items: DaybookDayItemScheduledActivityItem[], activityTree: ActivityDefinitionTree) {
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
