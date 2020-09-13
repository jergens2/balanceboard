import { DaybookSleepInputDataItem } from "../daybook-day-item/data-items/daybook-sleep-input-data-item.interface";
import { TimelogEntryActivity } from "../daybook-day-item/data-items/timelog-entry-activity.interface";
import * as moment from 'moment';

export class SleepEntryInputItem {

    constructor(inputItem: DaybookSleepInputDataItem) {
        this._startSleepTimeISO = inputItem.startSleepTimeISO;
        this._startSleepTimeUtcOffsetMinutes = inputItem.startSleepTimeUtcOffsetMinutes;
        this._endSleepTimeISO = inputItem.endSleepTimeISO;
        this._endSleepTimeUtcOffsetMinutes = inputItem.endSleepTimeUtcOffsetMinutes;
        this._percentAsleep = inputItem.percentAsleep;
        this._embeddedNote = inputItem.embeddedNote;
        this._activities = inputItem.activities;
        this._energyAtEnd = inputItem.energyAtEnd;
    }

    private _startSleepTimeISO: string;
    private _startSleepTimeUtcOffsetMinutes: number;
    private _endSleepTimeISO: string;
    private _endSleepTimeUtcOffsetMinutes: number;
    private _percentAsleep: number;
    private _embeddedNote: string;
    private _activities: TimelogEntryActivity[];
    private _energyAtEnd: number;


    public get startTime(): moment.Moment { return moment(this._startSleepTimeISO); }
    public get endTime(): moment.Moment { return moment(this._endSleepTimeISO); }
    /** Returns the calculated value with respect to percentage */
    public get durationMs(): number { return moment(this.endTime).diff(this.startTime, 'milliseconds') * (this.percentAsleep / 100); }
    public get energyAtEnd(): number { return this._energyAtEnd; }
    public get percentAsleep(): number { return this._percentAsleep; }
    public get note(): string { return this._embeddedNote; }
    public get activities(): TimelogEntryActivity[] { return this._activities; }

}