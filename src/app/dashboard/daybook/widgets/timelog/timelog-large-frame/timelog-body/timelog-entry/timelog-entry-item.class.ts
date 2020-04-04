import * as moment from 'moment';
import { ItemState } from '../../../../../../../shared/utilities/item-state.class';
import { TimelogDelineator } from '../../../timelog-delineator.class';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';

export class TimelogEntryItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        // console.log("constructing tle: " + startTime.format('hh:mm a') + " to " + endTime.format('hh:mm a'))
        this._startTime = moment(startTime);
        this._utcOffsetMinutes = moment(this._startTime).utcOffset();
        this._endTime = moment(endTime);
        // this._itemState = new ItemState({ startTime: this._startTime, endTime: this._endTime });
        this._timelogEntryActivities = [];
        // console.log("this._timelogEntryActivities " , this._timelogEntryActivities)
    }


    // private _sleepState: 'SLEEP' | 'AWAKE' = 'AWAKE';
    // private _isConfirmed = false;
    private _utcOffsetMinutes: number;
    private _timelogEntryActivities: TimelogEntryActivity[];
    private _note = '';

    private _itemState: ItemState;
    public get itemState(): ItemState { return this._itemState; }

    public beginsBeforeFrameStart = false;
    public endsAfterFrameEnd = false;

    // public isSmallSize = false;
    public isSavedEntry = false;

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    public note = '';

    /**
     * This property is a flag used to indicate to the TimelogEntryForm that the item clicked on is the current item,
     * the item which is from previous time to now
     */
    public isCurrentEntry = false;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public set startTime(startTime: moment.Moment) { this._startTime = moment(startTime); }
    public set endTime(endTime: moment.Moment) { this._endTime = moment(endTime); }

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

    // public get isConfirmed(): boolean { return this._isConfirmed; }

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
            embeddedNote: this._note,
            noteIds: [],
        };
        // console.log("return item is ", returnItem)
        return returnItem;
    }

    public logToConsole(){
        console.log("Timelog Entry Item: ")
        console.log("   Start:" + this.startTime.format('YYYY-MM-DD hh:mm a'))
        console.log("     End:" + this.endTime.format('YYYY-MM-DD hh:mm a'))
    }

}