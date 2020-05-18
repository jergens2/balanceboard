import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { BehaviorSubject } from 'rxjs';


export class SleepManager {

    private _id: string;
    private _userActionRequired;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;
    private _energyAtWakeup: number;


    public get userActionRequired(): boolean { return this._userActionRequired; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }
    public get energyAtWakeup(): number { return this._energyAtWakeup; }
    public get id(): string { return this._id; }


    constructor(id: string, previousWakeupTime: string, nextFallAsleepTime: string, nextWakeupTime: string, energyAtWakeup: number) {
        this._id = id;
        if (previousWakeupTime) {
            this._previousWakeupTime = moment(previousWakeupTime);
        } else {
            this._userActionRequired = true;
        }
        if (nextFallAsleepTime) {
            this._nextFallAsleepTime = moment(nextFallAsleepTime);
        } else {
            this._userActionRequired = true;
        }
        if (nextWakeupTime) {
            this._nextWakeupTime = moment(nextWakeupTime);
            this._userActionRequired = true;
        }

        this._energyAtWakeup = energyAtWakeup;

        // const currentPosition = this._determineCurrentPosition();
        // this._currentPosition$.next(currentPosition);
    }

    public getCurrentPosition(): SleepCyclePosition {
        const now: moment.Moment = moment();
        const isAfterWakeup: boolean = now.isSameOrAfter(this.previousWakeupTime);
        const isBeforeSleepTime: boolean = now.isSameOrBefore(this.nextFallAsleepTime);
        if (isAfterWakeup && isBeforeSleepTime) {
            return SleepCyclePosition.ACTIVE;
        } else {
            if (!isBeforeSleepTime) {
                const sleepDuration = moment(this.nextWakeupTime).diff(this.nextFallAsleepTime, 'milliseconds');
                const endOfFirstQuarter = moment(this.nextFallAsleepTime).add((sleepDuration/4), 'milliseconds');
                const endOfThirdQuarter = moment(this.nextFallAsleepTime).add(((sleepDuration/4)*3), 'milliseconds'); 
                if(now.isBefore(endOfFirstQuarter)){
                    return SleepCyclePosition.AFTER_BEDTIME;
                }else if(now.isSameOrAfter(endOfFirstQuarter) && now.isBefore(endOfThirdQuarter)){
                    return SleepCyclePosition.SLEEP;
                }else if(now.isSameOrAfter(endOfThirdQuarter) && now.isBefore(this.nextWakeupTime)){
                    return SleepCyclePosition.EARLY_WAKEUP;
                }else if(now.isSameOrAfter(this.nextWakeupTime)){
                    return SleepCyclePosition.NEXT_DAY;
                }
            } else {
                console.log("Error with calculation");
            }
        }
        return SleepCyclePosition.ACTIVE;
    }

}