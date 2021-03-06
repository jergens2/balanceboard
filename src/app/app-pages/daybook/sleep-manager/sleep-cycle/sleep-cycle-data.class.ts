import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { SleepCycleHTTPData } from './sleep-cycle-http-data.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { Clock } from '../../../../shared/clock/clock.class';

export class SleepCycleData {
    constructor(data: SleepCycleHTTPData, clock: Clock) {
        console.log("Sleep Cycle Data constructor");
        this._clock = clock;
        if (data) {
            this._dataId = data._id;
            this._userId = data.userId;
            this._energyAtWakeup = data.energyAtWakeup;

            this._previousFallAsleepTimeISO = data.previousFallAsleepTime;
            this._previousFallAsleepUTCOffset = data.previousFallAsleepUTCOffset;
            this._previousFallAsleepTime = moment(this._previousFallAsleepTimeISO);

            this._previousWakeupTimeISO = data.previousWakeupTime;
            this._previousWakeupUTCOffset = data.previousWakeupUTCOffset;
            this._previousWakeupTime = moment(this._previousWakeupTimeISO);

            this._nextFallAsleepTimeISO = data.nextFallAsleepTime;
            this._nextFallAsleepUTCOffset = data.nextFallAsleepUTCOffset;
            this._nextFallAsleepTime = moment(this._nextFallAsleepTimeISO);

            this._nextWakeupTimeISO = data.nextWakeupTime;
            this._nextWakeupUTCOffset = data.nextWakeupUTCOffset;
            this._nextWakeupTime = moment(this._nextWakeupTimeISO);

            this._position$ = new BehaviorSubject(this.getCurrentPosition());
            this._clock.everyClockMinute$.subscribe(()=>{
                this._position$.next(this.getCurrentPosition());
            });
        } else {
            this._position$ = new BehaviorSubject(SleepCyclePosition.ACTIVE);
            this._hasPrompt = true;
            this._dataRequired = true;
        }
    }

    private _clock: Clock;
    private _dataId: string;
    private _userId: string;
    private _previousFallAsleepTimeISO: string;
    private _previousFallAsleepUTCOffset: number;
    private _previousWakeupTimeISO: string;
    private _previousWakeupUTCOffset: number;
    private _energyAtWakeup: number = 100;
    private _nextFallAsleepTimeISO: string;
    private _nextFallAsleepUTCOffset: number;
    private _nextWakeupTimeISO: string;
    private _nextWakeupUTCOffset: number;

    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;

    private _position$: BehaviorSubject<SleepCyclePosition>;
    private _hasPrompt: boolean = false;
    private _dataRequired: boolean = false;

    public get position(): SleepCyclePosition { return this._position$.getValue(); }
    public get position$(): Observable<SleepCyclePosition> { return this._position$.asObservable(); }
    public get positionIsActive(): boolean { return this.position === SleepCyclePosition.ACTIVE; }
    public get dataRequired(): boolean { return this._dataRequired; }
    public get hasPrompt(): boolean { return this._hasPrompt || this.dataRequired; }


    public get userId(): string { return this._userId; }
    public get previousFallAsleepTimeISO(): string { return this._previousFallAsleepTimeISO; }
    public get previousFallAsleepUTCOffset(): number { return this._previousFallAsleepUTCOffset; }
    public get previousWakeupTimeISO(): string { return this._previousWakeupTimeISO; }
    public get previousWakeupUTCOffset(): number { return this._previousWakeupUTCOffset; }
    public get energyAtWakeup(): number { return this._energyAtWakeup; }
    public get nextFallAsleepTimeISO(): string { return this._nextFallAsleepTimeISO; }
    public get nextFallAsleepUTCOffset(): number { return this._nextFallAsleepUTCOffset; }
    public get nextWakeupTimeISO(): string { return this._nextWakeupTimeISO; }
    public get nextWakeupUTCOffset(): number { return this._nextWakeupUTCOffset; }

    public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }


    public changePrevWakeupTime(time: moment.Moment){
        this._previousWakeupTime = moment(time);
        this._previousWakeupTimeISO = moment(time).toISOString();
        this._previousWakeupUTCOffset = moment(time).utcOffset();
    }
    public changePrevFallAsleepTime(time: moment.Moment){
        this._previousFallAsleepTime = moment(time);
        this._previousFallAsleepTimeISO = moment(time).toISOString();
        this._previousFallAsleepUTCOffset = moment(time).utcOffset();
    }

    public changeNextFallAsleepTime(time: moment.Moment) { 
        this._nextFallAsleepTime = moment(time);
        this._nextFallAsleepTimeISO = moment(time).toISOString();
        this._nextFallAsleepUTCOffset = moment(time).utcOffset();
    }
    public changeNextWakeupTime(time: moment.Moment) { 
        this._nextWakeupTime = moment(time);
        this._nextWakeupTimeISO = moment(time).toISOString();
        this._nextWakeupUTCOffset = moment(time).utcOffset();
    }

    /**
     * refer to:
     * sleep-cycle-position.jpg
     */
    public getCurrentPosition(): SleepCyclePosition {
        const now: moment.Moment = moment(this._clock.currentTime);
        const previousWakeupTime = moment(this.previousWakeupTime);
        const nextFallAsleepTime = moment(this.nextFallAsleepTime);
        const nextWakeupTime = moment(this.nextWakeupTime);
        const isAfterWakeup: boolean = now.isSameOrAfter(previousWakeupTime);
        const bedTimeWarning: moment.Moment = moment(nextFallAsleepTime).subtract(1, 'hour');
        const isBeforeBedtimeWarning: boolean = now.isBefore(bedTimeWarning);
        if (isAfterWakeup && isBeforeBedtimeWarning) {
            return SleepCyclePosition.ACTIVE;
        } else {
            this._hasPrompt = true;
            const isBeforeSleepTime: boolean = now.isBefore(nextFallAsleepTime);
            if (isBeforeSleepTime) {
                return SleepCyclePosition.BEFORE_BEDTIME;
            } else if (!isBeforeSleepTime) {
                const sleepDuration = moment(nextWakeupTime).diff(nextFallAsleepTime, 'milliseconds');
                const endOfFirstQuarter = moment(nextFallAsleepTime).add((sleepDuration / 4), 'milliseconds');
                const endOfThirdQuarter = moment(nextFallAsleepTime).add(((sleepDuration / 4) * 3), 'milliseconds');
                if (now.isBefore(endOfFirstQuarter)) {
                    return SleepCyclePosition.AFTER_BEDTIME;
                } else if (now.isSameOrAfter(endOfFirstQuarter) && now.isBefore(endOfThirdQuarter)) {
                    return SleepCyclePosition.SLEEP;
                } else if (now.isSameOrAfter(endOfThirdQuarter) && now.isBefore(nextWakeupTime)) {
                    this._dataRequired = true;
                    return SleepCyclePosition.EARLY_WAKEUP;
                } else if (now.isSameOrAfter(nextWakeupTime)) {
                    this._dataRequired = true;
                    return SleepCyclePosition.NEXT_DAY;
                }
            }
        }
        return SleepCyclePosition.ACTIVE;
    }

    public toHttpData(): SleepCycleHTTPData { 
        return {
            _id: this._dataId,
            userId: this._userId,
            previousFallAsleepTime: this._previousFallAsleepTime.toISOString(),
            previousFallAsleepUTCOffset: this._previousFallAsleepTime.utcOffset(),
            previousWakeupTime: this._previousWakeupTime.toISOString(),
            previousWakeupUTCOffset: this._previousWakeupTime.utcOffset(),
            energyAtWakeup: this._energyAtWakeup,
            nextFallAsleepTime: this._nextFallAsleepTime.toISOString(),
            nextFallAsleepUTCOffset: this._nextFallAsleepTime.utcOffset(),
            nextWakeupTime: this._nextWakeupTime.toISOString(),
            nextWakeupUTCOffset: this._nextWakeupTime.utcOffset(),
        };
    }


    public toString(): string { 
        let string = "Sleep Data: ";
        string += "\n\tPrev Fall Asleep time: " + this._previousFallAsleepTime.format('YYYY-MM-DD hh:mm a');
        string += "\n\tPrev Wakeup time: " + this._previousWakeupTime.format('YYYY-MM-DD hh:mm a');
        string += "\n\tNext Fall Asleep time: " + this._nextFallAsleepTime.format('YYYY-MM-DD hh:mm a');
        string += "\n\tNext Wakeup time: " + this._nextWakeupTime.format('YYYY-MM-DD hh:mm a');
        return string;
    }
}
