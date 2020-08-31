import * as moment from 'moment';
import { DurationString } from './duration-string.class';
import { TimeRangeRelationship } from './time-range-relationship.enum';

export class TimeScheduleItem {

    protected _startTimeUTCOffset: number;
    protected _endTimeUTCOffset: number;
    protected _startTime: moment.Moment;
    protected _endTime: moment.Moment;

    constructor(startTimeISO: string, endTimeISO: string, startTimeUTCOffset?: number, endTimeUTCOffset?: number) {
        this._startTime = moment(startTimeISO);
        this._endTime = moment(endTimeISO);
        this._startTimeUTCOffset = this._startTime.utcOffset();
        this._endTimeUTCOffset = this._endTime.utcOffset();
        if (startTimeUTCOffset) {
            this._startTimeUTCOffset = startTimeUTCOffset;
        }
        if (endTimeUTCOffset) {
            this._endTimeUTCOffset = endTimeUTCOffset;
        }
    }

    public get startTime(): moment.Moment { return moment(this._startTime); }
    public get startTimeISO(): string { return moment(this._startTime).toISOString(); }
    public get startDateYYYYMMDD(): string { return moment(this._startTime).format('YYYY-MM-DD'); }
    public get startTimeUTCOffset(): number { return this._startTimeUTCOffset; }
    public get endTime(): moment.Moment { return moment(this._endTime); }
    public get endTimeISO(): string { return moment(this._endTime).toISOString(); }
    public get endDateYYYYMMDD(): string { return moment(this._endTime).format('YYYY-MM-DD'); }
    public get endTimeUTCOffset(): number { return this._endTimeUTCOffset; }
    public get sameUTCOffset(): boolean { return this.startTimeUTCOffset === this.endTimeUTCOffset; }
    public get sameDateYYYYMMDD(): boolean { return this.startDateYYYYMMDD === this.endDateYYYYMMDD; }

    public get durationMs(): number { return this.endTime.diff(this.startTime, 'milliseconds'); }
    public get durationString(): string { return DurationString.getDurationStringFromMS(this.durationMs); }

    public changeStartTime(time: moment.Moment) {
        this._startTime = moment(time);
        this._startTimeUTCOffset = moment(this._startTime).utcOffset();
    }
    public changeEndTime(time: moment.Moment) {
        this._endTime = moment(time);
        this._endTimeUTCOffset = moment(this._endTime).utcOffset();
    }
    /**
     * Compares this range to another range and returns the position that THIS range has, relative to the other range.
     * e.g. if this method returns GAP_BEFORE, then that means there is a gap of time before the end of this item and the start of other item
     */
    public getRelationshipTo(otherRange: TimeScheduleItem): TimeRangeRelationship {
        if (otherRange.startTime.isAfter(this.endTime)) {
            return TimeRangeRelationship.GAP_BEFORE;
        } else if (otherRange.startTime.isSame(this.endTime)) {
            return TimeRangeRelationship.IMMEDIATELY_BEFORE;
        } else if (otherRange.endTime.isSame(this.startTime)) {
            return TimeRangeRelationship.IMMEDIATELY_AFTER;
        } else if (otherRange.endTime.isBefore(this.startTime)) {
            return TimeRangeRelationship.GAP_AFTER;
        } else {
            let overlaps: boolean = false;
            const crossesStart: boolean = otherRange.startTime.isBefore(this.startTime) && otherRange.endTime.isAfter(this.startTime);
            const crossesEnd: boolean = otherRange.startTime.isBefore(this.endTime) && otherRange.endTime.isAfter(this.endTime);
            const isIn: boolean = otherRange.startTime.isSameOrAfter(this.startTime) && otherRange.endTime.isSameOrBefore(this.endTime);
            const encompasses: boolean = otherRange.startTime.isSameOrBefore(this.startTime)
                && otherRange.endTime.isSameOrAfter(this.endTime);
            overlaps = crossesStart || crossesEnd || isIn || encompasses;
            if (overlaps === true) {
                return TimeRangeRelationship.OVERLAPS;
            } else {
                console.log("Error comparing 2 times: " + otherRange.toString(), this.toString())
            }
        }
    }

    public getRelationshipToTime(timeToCheck: moment.Moment): TimeRangeRelationship {
        if (timeToCheck.isAfter(this.endTime)) {
            return TimeRangeRelationship.GAP_BEFORE;
        } else if (timeToCheck.isSame(this.endTime)) {
            return TimeRangeRelationship.IMMEDIATELY_BEFORE;
        } else if (timeToCheck.isSame(this.startTime)) {
            return TimeRangeRelationship.IMMEDIATELY_AFTER;
        } else if (timeToCheck.isBefore(this.startTime)) {
            return TimeRangeRelationship.GAP_AFTER;
        } else {
            if (timeToCheck.isSameOrAfter(this.startTime) && timeToCheck.isSameOrBefore(this.endTime)) {
                return TimeRangeRelationship.OVERLAPS;
            } else {
                console.log("Error getting relationship: " + timeToCheck.format('YYYY-MM-DD hh:mm a'), this.toString())
            }
        }
    }
    public isSame(otherRange: TimeScheduleItem): boolean {
        return this.startTime.isSame(otherRange.startTime) && this.endTime.isSame(otherRange.endTime);
    }
    public toString() {
        return this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format('YYYY-MM-DD hh:mm a');
    }
}