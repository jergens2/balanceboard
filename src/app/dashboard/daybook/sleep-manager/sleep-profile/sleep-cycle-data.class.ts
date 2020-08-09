import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { SleepProfileHTTPData } from './sleep-profile-http-data.interface';

export class SleepCycleData {
    constructor(data: SleepProfileHTTPData){
        if(data){
            this._userId = data.userId;
            this._previousFallAsleepTimeISO = data.previousFallAsleepTime;
            this._previousFallAsleepUTCOffset = data.previousFallAsleepUTCOffset;
            this._previousWakeupTimeISO = data.previousWakeupTime;
            this._previousWakeupUTCOffset = data.previousWakeupUTCOffset;
            this._energyAtWakeup = data.energyAtWakeup;
            this._nextFallAsleepTimeISO = data.nextFallAsleepTime;
            this._nextFallAsleepUTCOffset = data.nextFallAsleepUTCOffset;
            this._nextWakeupTimeISO = data.nextWakeupTime;
            this._nextWakeupUTCOffset = data.nextWakeupUTCOffset;
            this._previousFallAsleepTime = moment(this._previousFallAsleepTimeISO);
            this._previousWakeupTime = moment(this._previousWakeupTimeISO);
            this._nextFallAsleepTime = moment(this._nextFallAsleepTimeISO);
            this._nextWakeupTime = moment(this._nextWakeupTimeISO);
            this._position = this._getCurrentPosition();
        }else{
            this._position = SleepCyclePosition.ACTIVE;
            this._promptUser = true;
        }
    }

    private _userId: string;
    private _previousFallAsleepTimeISO: string;
    private _previousFallAsleepUTCOffset: number;
    private _previousWakeupTimeISO: string;
    private _previousWakeupUTCOffset: number;
    private _energyAtWakeup:  number;
    private _nextFallAsleepTimeISO: string;
    private _nextFallAsleepUTCOffset: number;
    private _nextWakeupTimeISO: string;
    private _nextWakeupUTCOffset: number;

    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;

    private _position: SleepCyclePosition;
    private _promptUser: boolean = false;
    
    public get position(): SleepCyclePosition { return this._position; }
    public get positionIsActive(): boolean { return this.position === SleepCyclePosition.ACTIVE; }
    public get dataRequired(): boolean { return this.position === SleepCyclePosition.EARLY_WAKEUP || this.position === SleepCyclePosition.NEXT_DAY; }
    public get promptUser(): boolean { return this._promptUser || this.dataRequired; }


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

    /**
     * refer to:
     * sleep-cycle-position.jpg 
     */
    private _getCurrentPosition(): SleepCyclePosition {
        const now: moment.Moment = moment();
        const previousWakeupTime = moment(this.previousWakeupTime);
        const nextFallAsleepTime = moment(this.nextFallAsleepTime);
        const nextWakeupTime = moment(this.nextWakeupTime);
        const isAfterWakeup: boolean = now.isSameOrAfter(previousWakeupTime);
        const bedTimeWarning: moment.Moment = moment(nextFallAsleepTime).subtract(1, 'hour');
        const isBeforeBedtimeWarning: boolean = now.isBefore(bedTimeWarning);
        if (isAfterWakeup && isBeforeBedtimeWarning) {
            return SleepCyclePosition.ACTIVE;
        } else {
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
                    return SleepCyclePosition.EARLY_WAKEUP;
                } else if (now.isSameOrAfter(nextWakeupTime)) {
                    return SleepCyclePosition.NEXT_DAY;
                }
            }
        }
        return SleepCyclePosition.ACTIVE;
    }
}