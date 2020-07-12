import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle/sleep-cycle-position.enum';
import { timer } from 'rxjs';
import { SleepProfileHTTPData } from './sleep-profile-http-data.interface';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookSleepCycle } from './sleep-cycle/daybook-sleep-cycle.class';
import { UAPAppConfiguration } from '../../user-account-profile/api/uap-app-configuraiton.interface';
import { SleepCyclePositionFinder } from './sleep-cycle/sleep-cycle-position-finder.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleItem } from '../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { DaybookTimeScheduleStatus } from '../api/daybook-time-schedule/daybook-time-schedule-status.enum';
import { SleepCycleBuilder } from './sleep-cycle/sleep-cycle-builder.class';

export class SleepManager {


    private _currentDbValue: SleepProfileHTTPData;

    private _id: string;
    private _userActionRequired = false;
    private _dataUpdateRequired = false;
    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;
    private _energyAtWakeup: number;

    private _daybookDayItems: DaybookDayItem[] = [];

    // private _previousWakeTimeIsSet: boolean = false;
    // private _nextFallAsleepTimeIsSet: boolean = false;
    private _dateYYYYMMDD: string;

    private _wakeupTimeMax: moment.Moment;
    // private _wakeupTimeMin: moment.Moment;
    private _sleepTimeMax: moment.Moment;
    private _sleepTimeMin: moment.Moment;

    private _currentSleepCycle: DaybookSleepCycle;
    private _appConfig: UAPAppConfiguration;

    private _currentPosition: SleepCyclePosition = SleepCyclePosition.ACTIVE;

    public get userActionRequired(): boolean { return this._userActionRequired; }
    public get dataUpdateRequired(): boolean { return this._dataUpdateRequired; }
    public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }
    public get energyAtWakeup(): number { return this._energyAtWakeup; }
    public get id(): string { return this._id; }
    public get dayItems(): DaybookDayItem[] { return this._daybookDayItems; }



    // public get previousWakeTimeIsSet(): boolean { return this._previousWakeTimeIsSet; }
    // public get nextFallAsleepTimeIsSet(): boolean { return this._nextFallAsleepTimeIsSet; }

    public get currentPosition(): SleepCyclePosition { return this._currentPosition; }

    // public get wakeupTimeMax(): moment.Moment { return this._wakeupTimeMax; }
    // public get wakeupTimeMin(): moment.Moment { return this._wakeupTimeMin; }
    public get sleepTimeMax(): moment.Moment { return this._sleepTimeMax; }
    public get sleepTimeMin(): moment.Moment { return this._sleepTimeMin; }

    public get prevSleepDurationMs(): number { return moment(this._previousWakeupTime).diff(moment(this._previousFallAsleepTime), 'milliseconds'); }


    /**
     *  Ths purpose of this method is to hold relevant DaybookDayItems.
     *  Relevant in this context means it is an some item between today and 14 days ago,
     *  and contains within it the sleepDataItems, thus we can make inferences from this.
     */
    public get relevantItems(): DaybookDayItem[] { return this._relevantPastSleepItems; }
    public get currentSleepCycle(): DaybookSleepCycle { return this._currentSleepCycle; }

    public updateConfig(config: UAPAppConfiguration) {
        this._appConfig = config;
        this._setDefaults();
    }


    /**
     * 
     * @param data 
     * response data from http request
     * can be null, and SleepManager will handle this assuming this means data is required.
     * 
     * @param dayItems
     */
    constructor(data: SleepProfileHTTPData, dayItems: DaybookDayItem[], appConfig: UAPAppConfiguration) {
        // console.log("Constructing sleep manager: ", data);
        this._rebuild(data, dayItems, appConfig);
        const now = moment();
        const msToNextMinute = moment(now).add(1, 'minutes').startOf('minute').diff(now, 'milliseconds');
        timer(msToNextMinute, 60000).subscribe(s => this._rebuild(data, dayItems, appConfig));
    }

    private _rebuild(data: SleepProfileHTTPData, dayItems: DaybookDayItem[], appConfig: UAPAppConfiguration) {
        this._dateYYYYMMDD = moment().format('YYYY-MM-DD');
        this.updateConfig(appConfig)
        this._currentDbValue = data;
        this._daybookDayItems = dayItems;
        const positionFinder = new SleepCyclePositionFinder(data);
        this._currentPosition = positionFinder.position;  //  null is permissable
        this._validateExistingData();
        this._currentSleepCycle = new DaybookSleepCycle(this._dateYYYYMMDD, this._relevantPastSleepItems, appConfig,
            moment(this.previousFallAsleepTime), moment(this.previousWakeupTime), moment(this.nextFallAsleepTime), moment(this.nextWakeupTime));


    }


    private _defaultWakeupTime: moment.Moment;
    private _defaultFallAsleepTime: moment.Moment;

    public get defaultWakeupTimeToday(): moment.Moment { return this._defaultWakeupTime; }
    public get defaultSleepTimeToday(): moment.Moment { return this._defaultFallAsleepTime; }

    private _setDefaults() {
        const startOfDay = moment().startOf('day');
        this._defaultWakeupTime = moment(startOfDay)
            .add(this._appConfig.defaultWakeupHour, 'hours').add(this._appConfig.defaultWakeupMinute, 'minutes');
        this._defaultFallAsleepTime = moment(startOfDay)
            .add(this._appConfig.defaultFallAsleepHour, 'hours').add(this._appConfig.defaultFallAsleepMinute, 'minutes');
    }

    public getEnergyLevel(): number {
        const now = moment();
        const totalDurationMS = moment(this.nextFallAsleepTime).diff(moment(this.previousWakeupTime), 'milliseconds');
        const durationFromStart = moment(now).diff(moment(this.previousWakeupTime), 'milliseconds');
        let energy = this._energyAtWakeup;
        const currentEnergy = (durationFromStart / totalDurationMS) * this._energyAtWakeup;
        return currentEnergy;
    }

    public getSleepCycleForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): DaybookSleepCycle {
        const builder: SleepCycleBuilder = new SleepCycleBuilder();
        return builder.buildSleepCycleForDate(dateYYYYMMDD, dayItems, this._appConfig)
    }






    /**Returns an array of DaybookDayItems where the item has some sleep values */
    private get _relevantPastSleepItems(): DaybookDayItem[] {
        return this._daybookDayItems.filter(item => item.hasSleepItems);
    }

    /**
     * Validates existing data provided upon construction, and will determine if user input is required.
     */
    private _validateExistingData() {
        // console.log("Validating")
        let userActionRequired: boolean = false;
        let dataUpdateRequired: boolean = false;
        const dataExists = this._currentDbValue.previousFallAsleepTime && this._currentDbValue.previousWakeupTime && this._currentDbValue.nextFallAsleepTime && this._currentDbValue.nextWakeupTime;
        const now = moment();
        if (dataExists && this.currentPosition !== null) {
            this._previousFallAsleepTime = moment(this._currentDbValue.previousFallAsleepTime);
            this._previousWakeupTime = moment(this._currentDbValue.previousWakeupTime);
            this._nextFallAsleepTime = moment(this._currentDbValue.nextFallAsleepTime);
            this._nextWakeupTime = moment(this._currentDbValue.nextWakeupTime);
            // console.log("Setting energy value: ", this._currentDbValue.energyAtWakeup)
            this._energyAtWakeup = this._currentDbValue.energyAtWakeup;


            /**
             * Under most circumstances (SleepCyclePosition.Active, no action or input is required.
             * 
             * However, otherwise we will either require to show the user a prompt to address the case,
             * and if the data is out of date, then new data is required.
             * 
             */
            // console.log("Current position is ", this.currentPosition)

            if (this._currentPosition === SleepCyclePosition.ACTIVE) {
                userActionRequired = false;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.BEFORE_BEDTIME || this._currentPosition === SleepCyclePosition.AFTER_BEDTIME || this._currentPosition === SleepCyclePosition.SLEEP) {
                userActionRequired = true;
                dataUpdateRequired = false;
            } else if (this._currentPosition === SleepCyclePosition.EARLY_WAKEUP || this._currentPosition === SleepCyclePosition.NEXT_DAY) {
                // Shift forward by 1 day, now requiring user input.
                let prevFallAsleepTime = moment(this._nextFallAsleepTime);
                let previousWakeupTime = moment(this._nextWakeupTime);
                if (previousWakeupTime.isAfter(now)) {
                    previousWakeupTime = moment(now);
                }
                const daysAgo = moment().diff(previousWakeupTime, 'days');
                if (daysAgo > 0) {
                    this._previousFallAsleepTime = moment(this._defaultFallAsleepTime).subtract(24, 'hours');
                    this._previousWakeupTime = moment(this._defaultWakeupTime);
                    this._nextFallAsleepTime = moment(this._defaultFallAsleepTime);
                    this._nextWakeupTime = moment(this._defaultWakeupTime).add(24, 'hours');
                } else {
                    this._previousFallAsleepTime = prevFallAsleepTime;
                    this._previousWakeupTime = previousWakeupTime;
                    this._nextFallAsleepTime = moment(prevFallAsleepTime).add(24, 'hours');
                    this._nextWakeupTime = moment(previousWakeupTime).add(24, 'hours');
                }
                userActionRequired = true;
                dataUpdateRequired = true;
            }
        } else {
            // console.log("No data")
            this._previousFallAsleepTime = moment(this._defaultFallAsleepTime).subtract(24, 'hours');
            this._previousWakeupTime = moment(this._defaultWakeupTime);
            if (this._previousWakeupTime.isAfter(now)) {
                this._previousWakeupTime = moment(now);
            }
            this._nextFallAsleepTime = moment(this._defaultFallAsleepTime);
            this._nextWakeupTime = moment(this._defaultWakeupTime).add(24, 'hours');

            userActionRequired = true;
            dataUpdateRequired = true
        }

        // console.log("Usraction required, dataupdate required: ", userActionRequired, dataUpdateRequired)
        this._userActionRequired = userActionRequired;
        this._dataUpdateRequired = dataUpdateRequired;

    }
}