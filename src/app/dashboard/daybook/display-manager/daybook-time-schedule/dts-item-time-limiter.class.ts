import * as moment from 'moment';
import { TimeInput } from '../../../../shared/components/time-input/time-input.class';

export class DTSItemTimeLimiter {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _upperLimit: moment.Moment;
    private _lowerLimit: moment.Moment;
    private _isStartTime: boolean;

    private _startTimeInput: TimeInput;
    private _endTimeInput: TimeInput;

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get upperLimit(): moment.Moment { return this._upperLimit; }
    public get lowerLimit(): moment.Moment { return this._lowerLimit; }
    public get isStartItem(): boolean { return this._isStartTime; }
    public get isEndItem(): boolean { return !this._isStartTime; }

    public get startTimeInput(): TimeInput { return this._startTimeInput; }
    public get endTimeInput(): TimeInput { return this._endTimeInput; }
    public get canDecreaseTime(): boolean { return this.lowerLimit.isBefore(this.startTime); }
    public get canIncreaseTime(): boolean { return this.upperLimit.isAfter(this.startTime); }
    public get canChangeTime(): boolean { return this.canDecreaseTime || this.canIncreaseTime; }


    /**
     * the DTS (Daybook Time Schedule) Item Time Limiter contains 4 primary variables:
     *
     * start limit, start time, end time, end limit
     */
    constructor(startTime: moment.Moment, endTime: moment.Moment, upperLimit?: moment.Moment, lowerLimit?: moment.Moment) {
        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._upperLimit = moment(endTime);
        this._lowerLimit = moment(startTime);
        if (upperLimit) {
            this._upperLimit = moment(upperLimit);
        }
        if (lowerLimit) {
            this._lowerLimit = moment(lowerLimit);
        }
        this._startTimeInput = new TimeInput(this._startTime, this._endTime, this._lowerLimit);
        this._endTimeInput = new TimeInput(this._endTime, this._upperLimit, this._startTime);
    }

    public toString(): string {
        const string = 'Time limiter: \n\t Start time ('
            + this.startTime.format('h:mm:a')
            + ') can go as low as:  ' + this.lowerLimit.format('h:mm a')
            + '\t   end time (' + this.endTime.format('h:mm:a')
            + ') can go as high as: ' + this.upperLimit.format('h:mm a');
        return string;
    }

}
