import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { TimeDelineator } from '../../../time-delineator.class';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';

export class TimelogEntryItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment, sleepState: "SLEEP" | "AWAKE") {
        this._startTime = moment(startTime);
        this._utcOffsetMinutes = this._startTime.utcOffset();
        this._endTime = moment(endTime);
        this._itemState = new ItemState({ startTime: this._startTime, endTime: this._endTime });
        this._sleepState = sleepState;
    }


    private _itemState: ItemState;
    public get itemState(): ItemState { return this._itemState; }

    public beginsBeforeFrameStart: boolean = false;
    public endsAfterFrameEnd: boolean = false;

    public isSmallSize: boolean = false;
    public isSavedEntry: boolean = false;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    public note: string = "";

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public set startTime(startTime: moment.Moment) { this._startTime = moment(startTime); }
    public set endTime(endTime: moment.Moment) { this._endTime = moment(endTime); }

    public get durationSeconds(): number {
        return this._endTime.diff(this._startTime, "seconds");
    }
    public get durationString(): string {
        return DurationString.calculateDurationString(this._startTime, this._endTime);
    }

    public percentOfTotal(totalSeconds: number): number {
        return (this.durationSeconds / totalSeconds) * 100;
    }

    private _sleepState: "SLEEP" | "AWAKE" = "AWAKE";
    public get sleepState(): "SLEEP" | "AWAKE" { return this._sleepState; }

    private _isConfirmed: boolean = false;
    public get isConfirmed(): boolean { return this._isConfirmed; }

    private _utcOffsetMinutes: number;
    public get utcOffsetMinutes(): number { return this._utcOffsetMinutes; }

    private _timelogEntryActivities: TimelogEntryActivity[] = [];
    public set timelogEntryActivities(activities: TimelogEntryActivity[]) { this._timelogEntryActivities = activities; }
    public get timelogEntryActivities(): TimelogEntryActivity[] { return this._timelogEntryActivities; }
    private _note: string = "";

    public get dataEntryItem(): DaybookTimelogEntryDataItem {
        return {
            startTimeISO: this._startTime.toISOString(),
            endTimeISO: this._endTime.toISOString(),
            utcOffsetMinutes: this._utcOffsetMinutes,
            timelogEntryActivities: this._timelogEntryActivities,
            isConfirmed: false,
            note: this._note,
        }
    }

}