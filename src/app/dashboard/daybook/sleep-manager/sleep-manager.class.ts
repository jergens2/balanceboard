import * as moment from 'moment';
import { SleepCyclePosition } from './sleep-cycle/sleep-cycle-position.enum';
import { timer, Subscription, BehaviorSubject, Observable } from 'rxjs';
import { SleepCycleHTTPData } from './sleep-cycle/sleep-cycle-http-data.interface';
import { DaybookDayItem } from '../daybook-day-item/daybook-day-item.class';
import { SleepCycleScheduleItemsBuilder } from './sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { UAPAppConfiguration } from '../../user-account-profile/api/uap-app-configuraiton.interface';
import { SleepCycleData } from './sleep-cycle/sleep-cycle-data.class';
import { DaybookSleepInputDataItem } from '../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleItem } from '../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { DaybookTimeScheduleStatus } from '../display-manager/daybook-time-schedule/daybook-time-schedule-status.enum';
import { SleepCycleBuilder } from './sleep-cycle/sleep-cycle-builder.class';
import { SleepCycleDaybookAnalyzer } from './sleep-cycle/sleep-cycle-daybook-analyzer.class';
import { DaybookTimelogEntryDataItem } from '../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';

export class SleepManager {

    /**
     * This class is the master class for Sleep data.
     *
     */
    constructor(data: SleepCycleData, dayItems: DaybookDayItem[], appConfig: UAPAppConfiguration) {
        this._sleepData = data;
        this._daybookDayItems = dayItems;
        this._appConfig = appConfig;
        this._setDefaults();
        this._sleepAnalysis = new SleepCycleDaybookAnalyzer(this._daybookDayItems, this._appConfig);
        console.log("TO DO:  if sleep analysis has good value, then use it to calculate approximate sleep and wakeup times.")
        if (this._sleepAnalysis.isValid) {

        } else {

        }
        if (!this._sleepData.hasPrompt) {
            this._setValues();
            this._updateEnergyLevel();
            this._startClock();
        }
    }


    private _previousActivity: DaybookTimelogEntryDataItem = null;

    private _previousActivityTime: moment.Moment;
    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;



    private _clockSubs: Subscription[] = [];
    private _clock$: BehaviorSubject<moment.Moment>;
    private _id: string;


    private _sleepData: SleepCycleData;
    private _daybookDayItems: DaybookDayItem[] = [];

    private _wakeupTimeMax: moment.Moment;
    // private _wakeupTimeMin: moment.Moment;
    private _sleepTimeMax: moment.Moment;
    private _sleepTimeMin: moment.Moment;

    // private _currentSleepCycle: SleepCycleScheduleItemsBuilder;
    private _appConfig: UAPAppConfiguration;
    private _energyLevel$: BehaviorSubject<number> = new BehaviorSubject(100);

    private _sleepAnalysis: SleepCycleDaybookAnalyzer;

    private _defaultWakeupTime: moment.Moment;
    private _defaultFallAsleepTime: moment.Moment;


    public get clock(): moment.Moment { return this._clock$.getValue(); }
    public get clock$(): Observable<moment.Moment> { return this._clock$.asObservable(); }
    public get sleepData(): SleepCycleData { return this._sleepData; }
    public get position(): SleepCyclePosition { return this.sleepData.position; }
    public get positionIsActive(): boolean { return this.sleepData.positionIsActive; }
    public get dataRequired(): boolean { return this.sleepData.dataRequired; }


    public get dataUpdateRequired(): boolean { return this.sleepData.dataRequired; }

    public get hasPreviousActivity(): boolean { return this._previousActivity !== null; }
    public get previousActivity(): DaybookTimelogEntryDataItem { return this._previousActivity; }
    public get previousActivityTime(): moment.Moment { return this._previousActivityTime; }
    public get previousFallAsleepTime(): moment.Moment { return this._previousFallAsleepTime; }
    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }
    public get nextWakeupTime(): moment.Moment { return this._nextWakeupTime; }

    public get id(): string { return this._id; }
    public get dayItems(): DaybookDayItem[] { return this._daybookDayItems; }

    public get sleepTimeMax(): moment.Moment { return this._sleepTimeMax; }
    public get sleepTimeMin(): moment.Moment { return this._sleepTimeMin; }

    public get prevSleepDurationMs(): number {
        return moment(this.previousWakeupTime).diff(moment(this.previousFallAsleepTime), 'milliseconds');
    }
    public get analysis(): SleepCycleDaybookAnalyzer { return this._sleepAnalysis; }

    public get energyAtWakeup(): number { return this._sleepData.energyAtWakeup; }
    public get energyLevel(): number { return this._energyLevel$.getValue(); }
    public get energyLevel$(): Observable<number> { return this._energyLevel$.asObservable(); }

    /**
     *  Ths purpose of this method is to hold relevant DaybookDayItems.
     *  Relevant in this context means it is an some item between today and 14 days ago,
     *  and contains within it the sleepDataItems, thus we can make inferences from this.
     */
    public get relevantSleepItems(): DaybookDayItem[] { return this._daybookDayItems.filter(item => item.hasSleepItems); }
    // public get currentSleepCycle(): SleepCycleScheduleItemsBuilder { return this._currentSleepCycle; }

    public get defaultWakeupTimeToday(): moment.Moment { return this._defaultWakeupTime; }
    public get defaultSleepTimeToday(): moment.Moment { return this._defaultFallAsleepTime; }

    /**
     *  This method is used by the daybook display service
     */
    public getSleepCycleForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): SleepCycleScheduleItemsBuilder {
        const builder: SleepCycleBuilder = new SleepCycleBuilder();
        // console.log("BUILDER THING.  Day items: ", dayItems)
        return builder.buildSleepCycleForDate(dateYYYYMMDD, dayItems, this._appConfig);
    }

    private _setDefaults() {
        const startOfDay = moment().startOf('day');
        this._defaultWakeupTime = moment(startOfDay)
            .add(this._appConfig.defaultWakeupHour, 'hours').add(this._appConfig.defaultWakeupMinute, 'minutes');
        this._defaultFallAsleepTime = moment(startOfDay)
            .add(this._appConfig.defaultFallAsleepHour, 'hours').add(this._appConfig.defaultFallAsleepMinute, 'minutes');
        this._clock$ = new BehaviorSubject(moment());
        this._previousFallAsleepTime = moment(this._defaultFallAsleepTime).subtract(24, 'hours');
        this._previousActivityTime = moment(this._previousFallAsleepTime);
        this._previousWakeupTime = moment(this._defaultWakeupTime);
        this._nextFallAsleepTime = moment(this._defaultFallAsleepTime);
        this._nextWakeupTime = moment(this._defaultWakeupTime).add(24, 'hours');
    }

    private _setValues() {
        this._previousFallAsleepTime = moment(this._sleepData.previousFallAsleepTime);
        this._previousWakeupTime = moment(this._sleepData.previousWakeupTime);
        this._nextFallAsleepTime = moment(this._sleepData.nextFallAsleepTime);
        this._nextWakeupTime = moment(this._sleepData.nextWakeupTime);
        this._setPreviousActivityValue();
    }


    /**
     * Determine the end time of the last activity.
     * 
     * When sleep data form prompt comes up, it necessarily implies that the sleep position is a new day, 
     * therefore the sleep data has all changed.
     * 
     * The previous activity will be the most recent one from now.
     * There might not be a previous activity, in which case set the value to the same as previous fall asleep time.
     */
    private _setPreviousActivityValue() {
        const now: moment.Moment = moment();
        const todayYYYYMMDD: string = now.format('YYYY-MM-DD');
        const yesterdayYYYYMMDD: string = moment(now).subtract(1, 'days').format('YYYY-MM-DD');
        let allActivities: DaybookTimelogEntryDataItem[] = [];
        this.dayItems
            .filter(item => item.dateYYYYMMDD === todayYYYYMMDD || item.dateYYYYMMDD === yesterdayYYYYMMDD)
            .forEach(item => allActivities.concat(item.timelogEntryDataItems));
        allActivities = allActivities.sort((a1, a2) => {
            if (a1.startTimeISO < a2.startTimeISO) { return -1; }
            else if (a1.startTimeISO > a2.startTimeISO) { return 1; }
            return 0;
        });
        if (allActivities.length > 0) {
            this._previousActivity = allActivities[allActivities.length - 1];
            this._previousActivityTime = moment(this._previousActivity.endTimeISO);
        } else {
            this._previousActivityTime = moment(this.previousFallAsleepTime);
            this._previousActivity = null;
        }
    }

    private _startClock() {
        this._clock$.next(moment());
        const msToNextSecond = moment().startOf('second').add(1, 'second').diff(moment(), 'milliseconds');
        const msToNextMinute = moment().add(1, 'minutes').startOf('minute').diff(moment(), 'milliseconds');
        this._clockSubs = [
            timer(msToNextSecond, 1000).subscribe(tick => this._clock$.next(moment())),
            timer(msToNextMinute, 60000).subscribe(tick => this._updateEnergyLevel()),
        ];
    }
    private _updateEnergyLevel() {
        const totalDurationMS = moment(this.nextFallAsleepTime).diff(moment(this.previousWakeupTime), 'milliseconds');
        const durationFromStart = moment().diff(moment(this.previousWakeupTime), 'milliseconds');
        const currentEnergy = 100 - (durationFromStart / totalDurationMS) * this.energyAtWakeup;
        // console.log(currentEnergy, " <== Energy level updated");
        this._energyLevel$.next(currentEnergy);
    }

}
