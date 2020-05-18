import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { BehaviorSubject } from 'rxjs';


export class SleepManager {

    private _id: string;
    private _userActionRequired = false;
    private _dataUpdateRequired = false;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;
    private _energyAtWakeup: number;

    private _previousWakeTimeIsSet: boolean = false;
    private _nextFallAsleepTimeIsSet: boolean = false;

    private _wakeupTimeMax: moment.Moment;
    // private _wakeupTimeMin: moment.Moment;
    private _sleepTimeMax: moment.Moment;
    private _sleepTimeMin: moment.Moment;

    private _currentPosition: SleepCyclePosition = SleepCyclePosition.ACTIVE;

    public get userActionRequired(): boolean { return this._userActionRequired; }
    public get dataUpdateRequired(): boolean { return this._dataUpdateRequired; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }
    public get energyAtWakeup(): number { return this._energyAtWakeup; }
    public get id(): string { return this._id; }

    public get previousWakeTimeIsSet(): boolean { return this._previousWakeTimeIsSet; }
    public get nextFallAsleepTimeIsSet(): boolean { return this._nextFallAsleepTimeIsSet; }

    public get currentPosition(): SleepCyclePosition { return this._currentPosition; }

    public get wakeupTimeMax(): moment.Moment { return this._wakeupTimeMax; }
    // public get wakeupTimeMin(): moment.Moment { return this._wakeupTimeMin; }
    public get sleepTimeMax(): moment.Moment { return this._sleepTimeMax; }
    public get sleepTimeMin(): moment.Moment { return this._sleepTimeMin; }


    public formInputWakeupTime: moment.Moment;
    public formInputPrevFallAsleep: moment.Moment;
    public formInputStartEnergyPercent: number;
    public formInputDreams: string[];
    public formInputDurationPercent: number;
    public formInputBedTime: moment.Moment;
    public formInputNextWakeup: moment.Moment;



    private _previousWakeupTimeDbVal: string;
    private _nextFallAsleepTimeDbVal: string;
    private _nextWakeupTimeDbVal: string;
    private _energyAtWakeupDbVal: number;
    /**
     * Class takes data from the http request.
     * these incoming variables might be null
     * @param id 
     * @param previousWakeupTime 
     * @param nextFallAsleepTime 
     * @param nextWakeupTime 
     * @param energyAtWakeup 
     */
    constructor(id: string, previousWakeupTime: string, nextFallAsleepTime: string, nextWakeupTime: string, energyAtWakeup: number) {
        this._id = id;
        this._previousWakeupTimeDbVal = previousWakeupTime;
        this._nextFallAsleepTimeDbVal = nextFallAsleepTime;
        this._nextWakeupTimeDbVal = nextWakeupTime;
        this._energyAtWakeupDbVal = energyAtWakeup;

        this._validate();
        if (this._dataUpdateRequired) {
            this._prepareUpdate();
        }
    }

    /**
     *   return a value >= 0 && <= 1;
     */
    public getEnergyLevel(): number {


        return 0;
    }

    private _prepareUpdate() {

        // prepare variables, such as wakeup time min and max values, etc.
        console.log("Method disabled.  To do.")
        // this.
    }

    private _validate() {
        let userActionRequired: boolean = false;
        let dataUpdateRequired: boolean = false;
        const dataExists = this._previousWakeupTimeDbVal && this._nextFallAsleepTimeDbVal && this._nextWakeupTimeDbVal && this._energyAtWakeupDbVal;
        if (dataExists) {

            const now = moment();
            const defaultWakeupTime: moment.Moment = moment(now).hour(7).minute(30).startOf('minute');
            const defaultSleepTime: moment.Moment = moment(now).hour(22).minute(30).startOf('minute');

            this._currentPosition = this._getCurrentPosition();
            /**
             * Under most circumstances (SleepCyclePosition.Active, which would probably capture about 80 % of cases)
             * no action or input is required.
             * However, otherwise we will either require to show the user a prompt to address the case,
             * and if the data is out of date, then new data is required.
             */
            if (this._currentPosition === SleepCyclePosition.ACTIVE) {
                userActionRequired = false;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.BEFORE_BEDTIME) {
                userActionRequired = true;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.AFTER_BEDTIME) {
                userActionRequired = true;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.SLEEP) {
                userActionRequired = true;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.EARLY_WAKEUP) {
                userActionRequired = true;
                dataUpdateRequired = true;
            } else if (this._currentPosition === SleepCyclePosition.NEXT_DAY) {
                userActionRequired = true;
                dataUpdateRequired = true;
            }
        } else {
            userActionRequired = true;
            dataUpdateRequired = true
        }

        console.log("Usraction required, dataupdate required: ", userActionRequired, dataUpdateRequired)
        this._userActionRequired = userActionRequired;
        this._dataUpdateRequired = dataUpdateRequired;

    }



    /**
     * refer to:
     * sleep-cycle-position.jpg 
     */
    private _getCurrentPosition(): SleepCyclePosition {
        const now: moment.Moment = moment();
        const firstWakeupTime = moment(this._previousWakeupTimeDbVal);
        const firstFallAsleepTime = moment(this._nextFallAsleepTimeDbVal);
        const secondWakeupTime = moment(this._nextWakeupTimeDbVal);

        const isAfterWakeup: boolean = now.isSameOrAfter(firstWakeupTime);
        const bedTimeWarning: moment.Moment = moment(firstFallAsleepTime).subtract(1, 'hour');
        const isBeforeBedtimeWarning: boolean = now.isBefore(bedTimeWarning);

        if (isAfterWakeup && isBeforeBedtimeWarning) {
            return SleepCyclePosition.ACTIVE;
        } else {
            const isBeforeSleepTime: boolean = now.isBefore(firstFallAsleepTime);
            if (isBeforeSleepTime) {
                return SleepCyclePosition.BEFORE_BEDTIME;
            } else if (!isBeforeSleepTime) {
                const sleepDuration = moment(this.nextWakeupTime).diff(this.nextFallAsleepTime, 'milliseconds');
                const endOfFirstQuarter = moment(this.nextFallAsleepTime).add((sleepDuration / 4), 'milliseconds');
                const endOfThirdQuarter = moment(this.nextFallAsleepTime).add(((sleepDuration / 4) * 3), 'milliseconds');
                if (now.isBefore(endOfFirstQuarter)) {
                    return SleepCyclePosition.AFTER_BEDTIME;
                } else if (now.isSameOrAfter(endOfFirstQuarter) && now.isBefore(endOfThirdQuarter)) {
                    return SleepCyclePosition.SLEEP;
                } else if (now.isSameOrAfter(endOfThirdQuarter) && now.isBefore(this.nextWakeupTime)) {
                    return SleepCyclePosition.EARLY_WAKEUP;
                } else if (now.isSameOrAfter(this.nextWakeupTime)) {
                    return SleepCyclePosition.NEXT_DAY;
                }
            }
        }
        return SleepCyclePosition.ACTIVE;
    }

}