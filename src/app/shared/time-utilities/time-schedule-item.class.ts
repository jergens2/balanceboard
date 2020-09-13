import * as moment from 'moment';
import { DurationString } from './duration-string.class';
import { TimeRangeRelationship } from './time-range-relationship.enum';

export class TimeScheduleItem {

    private _startTimeUTCOffset: number;
    private _endTimeUTCOffset: number;
    private _schedItemStartTime: moment.Moment;
    private _schedItemEndTime: moment.Moment;

    constructor(startTimeISO: string, endTimeISO: string, startTimeUTCOffset?: number, endTimeUTCOffset?: number) {
        this._schedItemStartTime = moment(startTimeISO);
        this._schedItemEndTime = moment(endTimeISO);
        this._startTimeUTCOffset = this._schedItemStartTime.utcOffset();
        this._endTimeUTCOffset = this._schedItemEndTime.utcOffset();
        if (startTimeUTCOffset) {
            this._startTimeUTCOffset = startTimeUTCOffset;
        }
        if (endTimeUTCOffset) {
            this._endTimeUTCOffset = endTimeUTCOffset;
        }
    }

    public get schedItemStartTime(): moment.Moment { return moment(this._schedItemStartTime); }
    public get schedItemStartTimeISO(): string { return moment(this._schedItemStartTime).toISOString(); }
    public get startDateYYYYMMDD(): string { return moment(this._schedItemStartTime).format('YYYY-MM-DD'); }
    public get startTimeUTCOffset(): number { return this._startTimeUTCOffset; }
    public get schedItemEndTime(): moment.Moment { return moment(this._schedItemEndTime); }
    public get schedItemEndTimeISO(): string { return moment(this._schedItemEndTime).toISOString(); }
    public get endDateYYYYMMDD(): string { return moment(this._schedItemEndTime).format('YYYY-MM-DD'); }
    public get endTimeUTCOffset(): number { return this._endTimeUTCOffset; }
    public get sameUTCOffset(): boolean { return this.startTimeUTCOffset === this.endTimeUTCOffset; }
    public get sameDateYYYYMMDD(): boolean { return this.startDateYYYYMMDD === this.endDateYYYYMMDD; }

    public get durationMs(): number { return this.schedItemEndTime.diff(this.schedItemStartTime, 'milliseconds'); }
    public get durationString(): string { return DurationString.getDurationStringFromMS(this.durationMs); }

    public changeSchedItemStartTime(time: moment.Moment) {
        this._schedItemStartTime = moment(time);
        this._startTimeUTCOffset = moment(this._schedItemStartTime).utcOffset();
    }
    public changeSchedItemEndTime(time: moment.Moment) {
        this._schedItemEndTime = moment(time);
        this._endTimeUTCOffset = moment(this._schedItemEndTime).utcOffset();
    }
    /**
     * Compares this range to another range and returns the position that THIS range has, relative to the other range.
     * e.g. if this method returns GAP_BEFORE, then that means there is a gap of time before the end of this item and the start of other item
     */
    public getRelationshipTo(otherRange: TimeScheduleItem): TimeRangeRelationship {
        if (otherRange.schedItemStartTime.isAfter(this.schedItemEndTime)) {
            return TimeRangeRelationship.GAP_BEFORE;
        } else if (otherRange.schedItemStartTime.isSame(this.schedItemEndTime)) {
            return TimeRangeRelationship.IMMEDIATELY_BEFORE;
        } else if (otherRange.schedItemEndTime.isSame(this.schedItemStartTime)) {
            return TimeRangeRelationship.IMMEDIATELY_AFTER;
        } else if (otherRange.schedItemEndTime.isBefore(this.schedItemStartTime)) {
            return TimeRangeRelationship.GAP_AFTER;
        } else {
            let overlaps: boolean = false;
            const crossesStart: boolean = otherRange.schedItemStartTime.isBefore(this.schedItemStartTime)
                && otherRange.schedItemEndTime.isAfter(this.schedItemStartTime);
            const crossesEnd: boolean = otherRange.schedItemStartTime.isBefore(this.schedItemEndTime)
                && otherRange.schedItemEndTime.isAfter(this.schedItemEndTime);
            const isIn: boolean = otherRange.schedItemStartTime.isSameOrAfter(this.schedItemStartTime)
                && otherRange.schedItemEndTime.isSameOrBefore(this.schedItemEndTime);
            const encompasses: boolean = otherRange.schedItemStartTime.isSameOrBefore(this.schedItemStartTime)
                && otherRange.schedItemEndTime.isSameOrAfter(this.schedItemEndTime);
            overlaps = crossesStart || crossesEnd || isIn || encompasses;
            if (overlaps === true) {
                return TimeRangeRelationship.OVERLAPS;
            } else {
                console.log("Error comparing 2 times: " + otherRange.toString(), this.toString())
            }
        }
    }

    public getRelationshipToTime(timeToCheck: moment.Moment): TimeRangeRelationship {
        if (timeToCheck.isAfter(this.schedItemEndTime)) {
            return TimeRangeRelationship.GAP_BEFORE;
        } else if (timeToCheck.isSame(this.schedItemEndTime)) {
            return TimeRangeRelationship.IMMEDIATELY_BEFORE;
        } else if (timeToCheck.isSame(this.schedItemStartTime)) {
            return TimeRangeRelationship.IMMEDIATELY_AFTER;
        } else if (timeToCheck.isBefore(this.schedItemStartTime)) {
            return TimeRangeRelationship.GAP_AFTER;
        } else {
            if (timeToCheck.isSameOrAfter(this.schedItemStartTime) && timeToCheck.isSameOrBefore(this.schedItemEndTime)) {
                return TimeRangeRelationship.OVERLAPS;
            } else {
                console.log("Error getting relationship: " + timeToCheck.format('YYYY-MM-DD hh:mm a'), this.toString())
            }
        }
    }
    public isSame(otherRange: TimeScheduleItem): boolean {
        return this.schedItemStartTime.isSame(otherRange.schedItemStartTime) && this.schedItemEndTime.isSame(otherRange.schedItemEndTime);
    }
    public toString() {
        return this.schedItemStartTime.format('YYYY-MM-DD hh:mm a') + " to " + this.schedItemEndTime.format('YYYY-MM-DD hh:mm a');
    }
}
