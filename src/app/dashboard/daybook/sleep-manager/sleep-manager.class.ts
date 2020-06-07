import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle-position.enum';
import { BehaviorSubject } from 'rxjs';
import { SleepProfileHTTPData } from './sleep-profile-http-data.interface';
import { DaybookTimeSchedule } from '../api/controllers/daybook-time-schedule.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleStatus } from '../api/controllers/daybook-time-schedule-status.enum';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookSleepCycle } from '../controller/daybook-sleep-cycle.class';


export class SleepManager {

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

    private _wakeupTimeMax: moment.Moment;
    // private _wakeupTimeMin: moment.Moment;
    private _sleepTimeMax: moment.Moment;
    private _sleepTimeMin: moment.Moment;

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



    private _currentDbValue: SleepProfileHTTPData;

    /**
     * 
     * @param data 
     * response data from http request
     * can be null, and SleepManager will handle this assume this means data is required.
     * 
     * @param dayItems
     */
    constructor(data: SleepProfileHTTPData, dayItems: DaybookDayItem[]) {
        console.log("constructing profile: ", data);
        this._currentDbValue = data;
        this._daybookDayItems = dayItems;
        this._validate();
    }

    /**
     *   return a value >= 0 && <= 1;
     * 
     *  TO DO: 
     *  during user action prompt sleep form manager,
     *  calculate approximate bed time from 7 day ratio
     * 
     *  This method will therefore assume that the value saved for nextFallAsleepTime is a calculated value that represents what the likely fall asleep time should be.
     */
    public getEnergyLevel(): number {
        const now = moment();
        const totalDurationMS = moment(this.nextFallAsleepTime).diff(moment(this.previousWakeupTime), 'milliseconds');
        const durationFromStart = moment(now).diff(moment(this.previousWakeupTime), 'milliseconds');
        const currentEnergy = (durationFromStart / totalDurationMS) * this._energyAtWakeup;
        console.log("Energy level is: ", currentEnergy)
        return currentEnergy;
    }

    /**
     *  Ths purpose of this method is to hold relevant DaybookDayItems.
     *  Relevant in this context means it is an some item between today and 14 days ago,
     *  and contains within it the sleepDataItems, thus we can make inferences from this.
     */
    public get relevantItems(): DaybookDayItem[] {
        return this._relevantPastSleepItems;
    }


    public getTodayItems(): DaybookSleepInputDataItem[] {
        const now = moment();
        const prevDayYYYYMMDD: string = moment(now).startOf('day').subtract(24, 'hours').format('YYYY-MM-DD');
        const prevDay = this._daybookDayItems.find(item => item.dateYYYYMMDD === prevDayYYYYMMDD);
        const prevDayItems = prevDay.sleepInputItems;

        let startTime = moment().startOf('day');
        if (this.previousFallAsleepTime.isAfter(startTime)) {
            startTime = moment(this.previousFallAsleepTime);
        }
        const todayItems: DaybookSleepInputDataItem[] = [];
        todayItems.push({
            startSleepTimeISO: startTime.toISOString(),
            startSleepTimeUtcOffsetMinutes: startTime.utcOffset(),
            endSleepTimeISO: this._previousWakeupTime.toISOString(),
            endSleepTimeUtcOffsetMinutes: this._previousWakeupTime.utcOffset(),
            percentAsleep: 100,
            embeddedNote: '',
            activities: [],
            energyAtEnd: 100,
        });
        startTime = moment(this.nextFallAsleepTime);
        const endOfThisDay = moment(now).startOf('day').add(24, 'hours');
        let tomorrowStartItem: DaybookSleepInputDataItem;
        if (startTime.isBefore(endOfThisDay)) {
            let endTime = moment(endOfThisDay);
            if (this.nextWakeupTime.isBefore(endTime)) {
                console.log("Warning: unusual");
                endTime = moment(this.nextWakeupTime);
            } else {
                tomorrowStartItem = {
                    startSleepTimeISO: endOfThisDay.toISOString(),
                    startSleepTimeUtcOffsetMinutes: endOfThisDay.utcOffset(),
                    endSleepTimeISO: this.nextWakeupTime.toISOString(),
                    endSleepTimeUtcOffsetMinutes: this.nextWakeupTime.utcOffset(),
                    percentAsleep: 100,
                    embeddedNote: '',
                    activities: [],
                    energyAtEnd: 100,
                }
            }
            todayItems.push({
                startSleepTimeISO: startTime.toISOString(),
                startSleepTimeUtcOffsetMinutes: startTime.utcOffset(),
                endSleepTimeISO: endTime.toISOString(),
                endSleepTimeUtcOffsetMinutes: endTime.utcOffset(),
                percentAsleep: 100,
                embeddedNote: '',
                activities: [],
                energyAtEnd: 100,
            });
        }
        const tomorrowItems = [tomorrowStartItem];
        if (todayItems.length > 1) {
            const lastItem = todayItems[todayItems.length - 1];
            tomorrowItems.push({
                startSleepTimeISO: moment(lastItem.startSleepTimeISO).add(24, 'hours').toISOString(),
                startSleepTimeUtcOffsetMinutes: moment(lastItem.startSleepTimeISO).add(24, 'hours').utcOffset(),
                endSleepTimeISO: moment(lastItem.endSleepTimeISO).add(24, 'hours').toISOString(),
                endSleepTimeUtcOffsetMinutes: moment(lastItem.endSleepTimeISO).add(24, 'hours').utcOffset(),
                percentAsleep: 100,
                embeddedNote: '',
                activities: [],
                energyAtEnd: 100,
            });
        }
        return [...prevDayItems, ...todayItems, ...tomorrowItems];
    }

    private get _relevantPastSleepItems(): DaybookDayItem[] {
        return this._daybookDayItems.filter((item) => {
            let totalSleepTimeMs = 0;
            item.sleepInputItems.forEach((sleepItem) => {
                totalSleepTimeMs += moment(sleepItem.endSleepTimeISO).diff(moment(sleepItem.startSleepTimeISO), 'milliseconds');
            });
            const aboveMin: boolean = totalSleepTimeMs > (1000 * 60 * 60);
            const beforeToday = item.dateYYYYMMDD < moment().format('YYYY-MM-DD');
            return (totalSleepTimeMs && beforeToday);
        });
    }





    private _validate() {
        let userActionRequired: boolean = false;
        let dataUpdateRequired: boolean = false;
        const dataExists = this._currentDbValue.previousFallAsleepTime && this._currentDbValue.previousWakeupTime && this._currentDbValue.nextFallAsleepTime && this._currentDbValue.nextWakeupTime;
        const now = moment();
        const defaultWakeupTime: moment.Moment = moment(now).hour(7).minute(30).startOf('minute');
        const defaultSleepTime: moment.Moment = moment(now).hour(22).minute(30).startOf('minute');




        if (dataExists) {
            this._previousFallAsleepTime = moment(this._currentDbValue.previousFallAsleepTime);
            this._previousWakeupTime = moment(this._currentDbValue.previousWakeupTime);
            this._nextFallAsleepTime = moment(this._currentDbValue.nextFallAsleepTime);
            this._nextWakeupTime = moment(this._currentDbValue.nextWakeupTime);
            this._energyAtWakeup = this._currentDbValue.energyAtWakeup;

            this._currentPosition = this._getCurrentPosition();
            /**
             * Under most circumstances (SleepCyclePosition.Active, which would probably capture about 80 % of cases)
             * no action or input is required.
             * However, otherwise we will either require to show the user a prompt to address the case,
             * and if the data is out of date, then new data is required.
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
                const daysAgo = moment().diff(previousWakeupTime, 'days');
                if (daysAgo > 0) {
                    this._previousFallAsleepTime = moment(defaultSleepTime).subtract(24, 'hours');
                    this._previousWakeupTime = defaultWakeupTime;
                    this._nextFallAsleepTime = defaultSleepTime;
                    this._nextWakeupTime = moment(defaultWakeupTime).add(24, 'hours');
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
            this._previousFallAsleepTime = moment(defaultSleepTime).subtract(24, 'hours');
            this._previousWakeupTime = defaultWakeupTime;
            this._nextFallAsleepTime = defaultSleepTime;
            this._nextWakeupTime = moment(defaultWakeupTime).add(24, 'hours');

            userActionRequired = true;
            dataUpdateRequired = true
        }

        // console.log("Usraction required, dataupdate required: ", userActionRequired, dataUpdateRequired)
        this._userActionRequired = userActionRequired;
        this._dataUpdateRequired = dataUpdateRequired;

    }


    /**
     * refer to:
     * sleep-cycle-position.jpg 
     */
    private _getCurrentPosition(): SleepCyclePosition {
        const now: moment.Moment = moment();
        const firstWakeupTime = moment(this.previousWakeupTime);
        const firstFallAsleepTime = moment(this.nextFallAsleepTime);
        const secondWakeupTime = moment(this.nextWakeupTime);

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