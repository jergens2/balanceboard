import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { TimelogDelineator } from '../../../timelog-delineator.class';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';

export class TimelogEntryItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        this._startTime = moment(startTime);
        this._utcOffsetMinutes = moment(this._startTime).utcOffset();
        this._endTime = moment(endTime);
        this._timelogEntryActivities = [];
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _utcOffsetMinutes: number;
    private _timelogEntryActivities: TimelogEntryActivity[];
    private _embeddedNote: string = '';

    public beginsBeforeFrameStart = false;
    public endsAfterFrameEnd = false;
    public isSavedEntry = false;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public setStartTime(startTime: moment.Moment) { this._startTime = moment(startTime); }
    public setEndTime(endTime: moment.Moment) { this._endTime = moment(endTime); }

    public get embeddedNote(): string { return this._embeddedNote; }
    public set embeddedNote(note: string) { this._embeddedNote = note; }

    public get durationMilliseconds(): number {
        return moment(this.endTime).diff(moment(this.startTime), 'milliseconds');
    }
    public get durationSeconds(): number {
        return moment(this.endTime).diff(moment(this.startTime), 'seconds');
    }
    public get durationString(): string {
        return DurationString.calculateDurationString(this._startTime, this._endTime);
    }

    public percentOfTotal(totalSeconds: number): number {
        return (this.durationSeconds / totalSeconds) * 100;
    }

    public get utcOffsetMinutes(): number { return this._utcOffsetMinutes; }
    public set timelogEntryActivities(activities: TimelogEntryActivity[]) {
        // console.log("Setting to: " , activities)
        this._timelogEntryActivities = activities;
    }
    public get timelogEntryActivities(): TimelogEntryActivity[] { 
        // console.log(" returning value: " , this, this._timelogEntryActivities)
        return this._timelogEntryActivities; 
    }


    public exportDataEntryItem(): DaybookTimelogEntryDataItem {
        const returnItem = {
            startTimeISO: this._startTime.toISOString(),
            startTimeUtcOffsetMinutes: this._startTime.utcOffset(),
            endTimeISO: this._endTime.toISOString(),
            endTimeUtcOffsetMinutes: this._endTime.utcOffset(),
            timelogEntryActivities: this._timelogEntryActivities,
            embeddedNote: this._embeddedNote,
            noteIds: [],
        };
        // console.log("return item is ", returnItem)
        return returnItem;
    }

    public get toString(): string{
        return "Timelog Entry Item: start: " + this.startTime.format('YYYY-MM-DD hh:mm a') + " to end:  " + this.endTime.format('YYYY-MM-DD hh:mm a');
    }

}