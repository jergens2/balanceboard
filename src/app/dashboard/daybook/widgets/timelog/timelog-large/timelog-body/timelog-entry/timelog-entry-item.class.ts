import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { TimeDelineator } from '../../../time-delineator.class';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';

export class TimelogEntryItem{
    constructor(delineator: TimeDelineator, endTime: moment.Moment, wakeupTime: moment.Moment, bedtime: moment.Moment){
        this._startTime = delineator.time;
        this._utcOffsetMinutes = this._startTime.utcOffset();
        this._endTime = endTime;
        this._itemState = new ItemState({startTime: this._startTime, endTime: this._endTime});

        const isBeforeWakeup: boolean = this._startTime.isSameOrBefore(wakeupTime) && this._endTime.isSameOrBefore(wakeupTime);
        const isAfterBedtime: boolean = this._startTime.isSameOrAfter(bedtime) && this._endTime.isSameOrAfter(bedtime);
        if(isBeforeWakeup || isAfterBedtime){
            this._sleepState = "SLEEP";
        }else{
            this._sleepState = "AWAKE";
        }


    }

    private _itemState: ItemState;
    public get itemState(): ItemState { return this._itemState; }

    public beginsBeforeFrameStart: boolean = false;
    public endsAfterFrameEnd: boolean = false;



    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get durationSeconds(): number{
        return this._endTime.diff(this._startTime, "seconds");
    }
    public get durationString(): string{
        return DurationString.calculateDurationString(this._startTime, this._endTime);
    }

    public percentOfTotal(totalSeconds: number): number{
        return (this.durationSeconds / totalSeconds) * 100;
    }

    private _sleepState: "SLEEP" | "AWAKE" = "AWAKE";
    public get sleepState(): "SLEEP" | "AWAKE" { return this._sleepState; }

    private _isConfirmed: boolean = false;
    public get isConfirmed(): boolean { return this._isConfirmed; }

    private _utcOffsetMinutes: number;
    public get utcOffsetMinutes(): number { return this._utcOffsetMinutes; }

    private _timelogEntryActivities: TimelogEntryActivity[] = [];
    private _note: string = "";

    public get dataEntryItem(): DaybookTimelogEntryDataItem{
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