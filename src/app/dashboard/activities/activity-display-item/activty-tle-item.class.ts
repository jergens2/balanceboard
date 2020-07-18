import { TimelogEntryItem } from "../../daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { ActivityCategoryDefinition } from "../api/activity-category-definition.class";
import * as moment from 'moment';

export class ActivityTLEItem {
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    private _activityDurationMs: number;

    constructor(timelogEntry: TimelogEntryItem, activity: ActivityCategoryDefinition) {
        this._startTime = moment(timelogEntry.startTime);
        this._endTime = moment(timelogEntry.endTime);
        const durationMS = moment(this._endTime).diff(this._startTime, 'milliseconds');
        const activityItem = timelogEntry.timelogEntryActivities.find(tlea => tlea.activityTreeId === activity.treeId);
        this._activityDurationMs = (activityItem.percentage/100)  * durationMS;
    }


    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get activityDurationMS(): number { return this._activityDurationMs; }
    
}