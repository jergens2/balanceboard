import { TimeInput } from '../../../../../shared/components/time-input/time-input.class';
import { SleepManager } from '../../sleep-manager.class';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { TimeUnitConverter } from '../../../../../shared/time-utilities/time-unit-converter.class';
import { DurationString } from '../../../../../shared/time-utilities/duration-string.class';
import { TimeUnit } from '../../../../../shared/time-utilities/time-unit.enum';

export class SleepDataForm {

    private _previousActivityTime: moment.Moment;
    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nowTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;

    private _hasAvailableTime: boolean;

    private _energyAtWakeup: number;
    private _sleepDurationPercent: number;

    private _previousVacantDuration: string;
    private _previousSleepDuration: string;
    private _awakeForDuration: string;
    private _timeUntilSleepDuration: string;
    private _nextSleepDuration: string;

    private _previousVacantDurationHours: number;
    private _previousSleepDurationHours: number;
    private _awakeForHours: number;
    private _timeUntilSleepHours: number;
    private _nextSleepDurationHours: number;

    private _newTLEStartTimeInput: TimeInput;
    private _newTLEEndTimeInput: TimeInput;
    private _prevFallAsleepTimeInput: TimeInput;
    private _prevWakeupTimeInput: TimeInput;
    private _nextFallAsleepTimeInput: TimeInput;
    private _nextWakeupTimeInput: TimeInput;


    private _sleepManager: SleepManager;

    public get previousActivityTime(): moment.Moment { return this._previousActivityTime; }
    public get hasAvailableTime(): boolean { return this._hasAvailableTime; }

    public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nowTime(): moment.Moment { return this._nowTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }

    public get previousVacantDuration(): string { return this._previousVacantDuration; }
    public get previousSleepDuration(): string { return this._previousSleepDuration; }
    public get awakeForDuration(): string { return this._awakeForDuration; }
    public get timeUntilSleepDuration(): string { return this._timeUntilSleepDuration; }
    public get nextSleepDuration(): string { return this._nextSleepDuration; }

    public get previousVacantDurationHours(): number { return this._previousVacantDurationHours; }
    public get previousSleepDurationHours(): number { return this._previousSleepDurationHours; }
    public get awakeForDurationHours(): number { return this._awakeForHours; }
    public get timeUntilSleepDurationHours(): number { return this._timeUntilSleepHours; }
    public get nextSleepDurationHours(): number { return this._nextSleepDurationHours; }


    public get prevFallAsleepTimeInput(): TimeInput { return this._prevFallAsleepTimeInput; }
    public get prevWakeupTimeInput(): TimeInput { return this._prevWakeupTimeInput; }
    public get nextFallAsleepTimeInput(): TimeInput { return this._nextFallAsleepTimeInput; }
    public get nextWakeupTimeInput(): TimeInput { return this._nextWakeupTimeInput; }
    public get newTLEStartTimeInput(): TimeInput { return this._newTLEStartTimeInput; }
    public get newTLEEndTimeInput(): TimeInput { return this._newTLEEndTimeInput; }

    public get energyAtWakeup(): number { return this._energyAtWakeup; }
    public get sleepDurationPercent(): number { return this._sleepDurationPercent; }

    constructor(sleepManager: SleepManager) {
        this._sleepManager = sleepManager;
        this._previousActivityTime = moment(this._sleepManager.previousActivityTime);
        console.log("Previous activity time is: " + this.previousActivityTime.format('YYYY-MM-DD hh:mm a'))
        this._previousFallAsleepTime = moment(this._sleepManager.previousFallAsleepTime);
        console.log("Previous fall asleep time is: ", this.previousFallAsleepTime.format('hh:mm a'))
        this._previousWakeupTime = moment(this._sleepManager.previousWakeupTime);
        this._nextFallAsleepTime = moment(this._sleepManager.nextFallAsleepTime);
        this._nextWakeupTime = moment(this._sleepManager.nextWakeupTime);
        this._energyAtWakeup = 100;
        this._sleepDurationPercent = 100;

        const wakeupColor = 'rgb(255, 179, 0)';
        const sleepColor = 'rgb(0, 43, 99)';

        this._prevFallAsleepTimeInput = new TimeInput(this.previousFallAsleepTime);
        this._prevFallAsleepTimeInput.color = sleepColor;
        this._prevFallAsleepTimeInput.isBold = true;
        this._prevWakeupTimeInput = new TimeInput(this.previousWakeupTime);
        this._prevWakeupTimeInput.color = wakeupColor;
        this._prevWakeupTimeInput.isBold = true;
        this._nextFallAsleepTimeInput = new TimeInput(this.nextFallAsleepTime);
        this._nextFallAsleepTimeInput.color = sleepColor;
        this._nextFallAsleepTimeInput.isBold = true;
        this._nextWakeupTimeInput = new TimeInput(this.nextWakeupTime);
        this._nextWakeupTimeInput.color = wakeupColor;
        this._nextWakeupTimeInput.isBold = true;

        let minValue: moment.Moment = moment(this._previousActivityTime);
        let activityStartTime: moment.Moment = moment(this._previousActivityTime);
        if (!this._sleepManager.hasPreviousActivity) {
            activityStartTime = moment(this._previousFallAsleepTime).subtract(1, 'hours');
            minValue = moment(this._previousWakeupTime).subtract(20, 'hours');
            this._hasAvailableTime = true;
        } else {
            if (this._previousFallAsleepTime.diff(this._previousActivityTime, 'milliseconds') > 0) {
                this._hasAvailableTime = true;
            } else {
                this._hasAvailableTime = false;
            }
        }
        console.log("NEW TLE START TIME INPUT: " + activityStartTime.format('YYYY-MM-DD hh:mm a'))
        console.log("max:  " + this._previousFallAsleepTime.format('YYYY-MM-DD hh:mm a'));
        console.log("min: " + minValue.format('YYYY-MM-DD hh:mm a'))
        this._newTLEStartTimeInput = new TimeInput(activityStartTime, this._previousFallAsleepTime, minValue);
        this._newTLEEndTimeInput = new TimeInput(this._previousFallAsleepTime, this._previousFallAsleepTime, activityStartTime);

        this._prevFallAsleepTimeInput.timeValue$.subscribe(time => {
            this._previousFallAsleepTime = moment(time);
            this._recalculateTimeValues();
        });
        this._prevWakeupTimeInput.timeValue$.subscribe(time => {
            this._previousWakeupTime = moment(time);
            this._recalculateTimeValues();
        });
        this._nextFallAsleepTimeInput.timeValue$.subscribe(time => {
            this._nextFallAsleepTime = moment(time);
            this._recalculateTimeValues();
        });
        this._nextWakeupTimeInput.timeValue$.subscribe(time => {
            this._nextWakeupTime = moment(time);
            this._recalculateTimeValues();
        });
        this._newTLEStartTimeInput.timeValue$.subscribe(t => {
            this._recalculateTimeValues();
        });
        this._newTLEEndTimeInput.timeValue$.subscribe(t => this._recalculateTimeValues());
        this._startClock();
        this._recalculateTimeValues();
    }

    private _recalculateTimeValues() {
        const previousVacantMs = moment(this.previousFallAsleepTime).diff(this.newTLEEndTimeInput.timeValue, 'milliseconds');
        const previousSleepMs = moment(this.previousWakeupTime).diff(this.previousFallAsleepTime, 'milliseconds');
        const awakeForMs = moment().diff(this.previousWakeupTime, 'milliseconds');
        const timeUntilSleepMs = moment(this.nextFallAsleepTime).diff(moment(), 'milliseconds');
        const nextSleepDuratoin = moment(this.nextWakeupTime).diff(this.nextFallAsleepTime, 'milliseconds');

        this._previousVacantDuration = DurationString.getDurationStringFromMS(previousVacantMs, true);
        this._previousSleepDuration = DurationString.getDurationStringFromMS(previousSleepMs, true);
        this._awakeForDuration = DurationString.getDurationStringFromMS(awakeForMs, true);
        this._timeUntilSleepDuration = DurationString.getDurationStringFromMS(timeUntilSleepMs, true);
        this._nextSleepDuration = DurationString.getDurationStringFromMS(nextSleepDuratoin, true);

        this._previousVacantDurationHours = TimeUnitConverter.convert(previousVacantMs, TimeUnit.Millisecond, TimeUnit.Hour);
        this._previousSleepDurationHours = TimeUnitConverter.convert(previousSleepMs, TimeUnit.Millisecond, TimeUnit.Hour);
        this._awakeForHours = TimeUnitConverter.convert(awakeForMs, TimeUnit.Millisecond, TimeUnit.Hour);
        this._timeUntilSleepHours = TimeUnitConverter.convert(timeUntilSleepMs, TimeUnit.Millisecond, TimeUnit.Hour);
        this._nextSleepDurationHours = TimeUnitConverter.convert(nextSleepDuratoin, TimeUnit.Millisecond, TimeUnit.Hour);

        if (this._sleepManager.hasPreviousActivity) {
            this._prevFallAsleepTimeInput.minValue = moment(this._newTLEStartTimeInput.minValue);
        } else {
            this._prevFallAsleepTimeInput.minValue = moment(this.previousActivityTime).subtract(8, 'hours');
        }
        this._prevFallAsleepTimeInput.maxValue = moment(this.previousWakeupTime).subtract(1, 'hours');
        this._prevWakeupTimeInput.maxValue = moment(this._nowTime);
        this._prevWakeupTimeInput.minValue = moment(this.previousFallAsleepTime).add(1, 'hours');
        this._nextFallAsleepTimeInput.maxValue = moment(this.nextWakeupTime).subtract(1, 'hours');
        this._nextFallAsleepTimeInput.minValue = moment(this._nowTime).add(20, 'minutes');
        this._nextWakeupTimeInput.maxValue = moment(this.nextFallAsleepTime).add(18, 'hours');
        this._nextWakeupTimeInput.minValue = moment(this.nextFallAsleepTime).add(1, 'hours');
        this._newTLEStartTimeInput.maxValue = moment(this._newTLEEndTimeInput.timeValue).subtract(1, 'minute');
        this._newTLEEndTimeInput.minValue = moment(this._newTLEStartTimeInput.timeValue).add(1, 'minute');
        this._newTLEEndTimeInput.maxValue = moment(this._previousFallAsleepTime);

        if (this._previousFallAsleepTime.diff(this._previousActivityTime, 'milliseconds') > 0) {
            this._hasAvailableTime = true;
        } else {
            this._hasAvailableTime = false;
        }
    }

    private _startClock() {
        this._nowTime = moment();
        const msToNextSecond: number = moment(this._nowTime).startOf('second').add(1, 'seconds').diff(this._nowTime, 'milliseconds');
        timer(msToNextSecond, 1000).subscribe(t => this._nowTime = moment());
    }
}
