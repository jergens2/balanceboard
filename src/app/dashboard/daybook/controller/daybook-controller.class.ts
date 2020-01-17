import * as moment from 'moment';

import { DaybookEnergyController } from './daybook-energy-controller.class';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryController } from './daybook-timelog-entry-controller.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import { DaybookSleepController } from './daybook-sleep-controller.class';
import { Subject, Observable, Subscription } from 'rxjs';
import { DaybookEnergyLevel } from './daybook-energy-level.enum';
import { DaybookTimelogEntryTemplate } from './items/daybook-timelog-entry-template.interface';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookTimeDelineatorController } from './daybook-time-delineator-controller.class';
import { TimelogZoomControl } from '../widgets/timelog/timelog-large/timelog-zoom-controller/timelog-zoom-control.interface';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';


export class DaybookController extends TimeSchedule<DaybookAvailabilityType> {

    private _previousDay: DaybookDayItem;
    private _thisDay: DaybookDayItem;
    private _followingDay: DaybookDayItem;

    private _sleepController: DaybookSleepController;
    private _timelogEntryController: DaybookTimelogEntryController;
    private _energyController: DaybookEnergyController;
    private _timeDelineatorController: DaybookTimeDelineatorController;


    private _dataChanged$: Subject<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> = new Subject();

    private _subscriptions: Subscription[] = [];

    constructor(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        super(dayItem.thisDay.startOfThisDay, dayItem.thisDay.endOfThisDay);
        // console.log("Constructing the controller: ", dayItem);
        this._reload(dayItem);
    }

    public reload(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        // console.log("Reloading the controller: ", dayItem)
        this._reload(dayItem);
    }


    public get dateYYYYMMDD(): string { return this._thisDay.dateYYYYMMDD; }
    public get isToday(): boolean { return this._thisDay.dateYYYYMMDD === moment().format('YYYY-MM-DD'); }
    public get controllerStartTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').subtract(1, 'days'); }
    public get controllerEndTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').add(2, 'days'); }

    public get previousDay(): DaybookDayItem { return this._previousDay; }
    public get thisDay(): DaybookDayItem { return this._thisDay; }
    public get followingDay(): DaybookDayItem { return this._followingDay; }

    public get dailyWeightLogEntryKg(): number { return this._thisDay.dailyWeightLogEntryKg; }

    public get startOfPrevDay(): moment.Moment { return moment(this.previousDay.dateYYYYMMDD).startOf('day'); }
    public get startOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day'); }
    public get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    public get endOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    public get endOfNextDay(): moment.Moment { return moment(this.followingDay.dateYYYYMMDD).startOf('day').add(1, 'days'); };

    private get timelogEntryController(): DaybookTimelogEntryController { return this._timelogEntryController; }
    private get sleepController(): DaybookSleepController { return this._sleepController; }
    private get energyController(): DaybookEnergyController { return this._energyController; }
    private get timeDelineatorController(): DaybookTimeDelineatorController { return this._timeDelineatorController; }


    public get timelogEntryItems(): TimelogEntryItem[] { return this.timelogEntryController.timelogEntryItems; }
    public saveTimelogEntryItem$(saveTimelogEntry: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.saveTimelogEntryItem$(saveTimelogEntry);
    }
    public updateTimelogEntryItem$(updateTimelogEntry: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.updateTimelogEntryItem$(updateTimelogEntry);
    }
    public deleteTimelogEntryItem$(updateTimelogEntry: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.deleteTimelogEntryItem$(updateTimelogEntry);
    }


    public get timeDelineations(): moment.Moment[] { return this.timeDelineatorController.timeDelineations; }


    public get wakeupTime(): moment.Moment { return this.sleepController.firstWakeupTime; }
    public get wakeupTimeIsSet(): boolean { return this.sleepController.wakeupTimeIsSet; }
    public get fallAsleepTime(): moment.Moment { return this.sleepController.fallAsleepTime; }
    public get prevDayFallAsleepTime(): moment.Moment { return this.sleepController.prevDayFallAsleepTime; }
    public get awakeToAsleepRatio(): number { return this.sleepController.awakeToAsleepRatio; }
    public setWakeupTimeForDay(time: moment.Moment) {
        this.sleepController.setWakeupTimeForDay(time);
    }

    public getEnergyAtTime(time: moment.Moment): number {
        return this.energyController.getEnergyAtTime(time);
    }



    public get dataChanged$(): Observable<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> {
        return this._dataChanged$.asObservable();
    }



    public getNewCurrentTLETemplate(): DaybookTimelogEntryTemplate {
        let startTime: moment.Moment;
        let endTime: moment.Moment = moment();
        if (this.sleepController.wakeupTimeIsSet) {
            startTime = this.timelogEntryController.getNewTLEStartTime(this.sleepController.firstWakeupTime);
        } else {
            startTime = this.sleepController.firstWakeupTime;
        }
        return {
            timelogEntry: new TimelogEntryItem(startTime, endTime),
            isFirstOfDay: this._isNewTLEFirstOfDay(endTime),
            isLastOfDay: this._isNewTLELastOfDay(endTime),
        };
    }

    /**
     * Searches for availability, which is where the schedule item does not have value.
     */
    public isRowAvailable(startTime: moment.Moment, endTime: moment.Moment): boolean {
        let foundItems = this.getScheduleSlice(startTime, endTime);
        const diffMS = endTime.diff(startTime, 'milliseconds');
        if (diffMS < 0) {
            console.log('Error: endtime is before start time');
        }
        if (foundItems.length === 0) {
            return false;
        } else if (foundItems.length === 1) {
            return !foundItems[0].hasValue;
        } else if (foundItems.length > 1) {
            const availableMS: number = foundItems.filter(item => !item.hasValue).reduce((a, b) => { return a += b.durationMS }, 0);
            if (availableMS > (Math.abs(diffMS) / 2)) {
                return true;
            }
        }
        return false;
    }

    private _reload(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        this._previousDay = dayItem.prevDay;
        this._thisDay = dayItem.thisDay;
        this._followingDay = dayItem.nextDay;
        super._rebuildSchedule(this.startOfPrevDay, this.endOfNextDay);
        this._buildController();
    }

    private _buildController() {

        // console.log("PRev day: " , this._previousDay)
        // console.log(" cur day"  ,this._thisDay)
        // console.log("next day: " , this._followingDay)
        const timelogDataItems: DaybookTimelogEntryDataItem[] = this._previousDay.timelogEntryDataItems.concat(this._thisDay.timelogEntryDataItems)
            .concat(this._followingDay.timelogEntryDataItems);
        const allSleepSpanItems = this._previousDay.sleepTimes.concat(this._thisDay.sleepTimes).concat(this._followingDay.sleepTimes);
        const allEnergyLevelInputs = this._previousDay.sleepEnergyLevelInputs.concat(this._thisDay.sleepEnergyLevelInputs)
            .concat(this._followingDay.sleepEnergyLevelInputs);
        const allTimeDelineations = this._previousDay.timeDelineators.concat(this._thisDay.timeDelineators).concat(this._followingDay.timeDelineators);


        this._sleepController = new DaybookSleepController(this._previousDay.sleepTimes,
            this._thisDay.sleepTimes, this._followingDay.sleepTimes, this.dateYYYYMMDD);

        const timeScheduleValueItems: TimeScheduleItem<DaybookAvailabilityType>[] = [
            ...timelogDataItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(moment(item.startTimeISO), moment(item.endTimeISO), true, DaybookAvailabilityType.TIMELOG_ENTRY)),
            ...this.sleepController.valueItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(item.startTime, item.endTime, true, DaybookAvailabilityType.SLEEP)),
        ]
        timeScheduleValueItems.forEach((item)=>{
            console.log("TSE: " + item.toString());
        })
        this.addScheduleValueItems(timeScheduleValueItems);
        console.log("Daybook controller:  Full Schedule Log:")
        this.logFullScheduleItems();


        this._timelogEntryController = new DaybookTimelogEntryController(this.dateYYYYMMDD, timelogDataItems, allSleepSpanItems);
        this._energyController = new DaybookEnergyController(this.fullScheduleItems, this.awakeToAsleepRatio);
        this._timeDelineatorController = new DaybookTimeDelineatorController(this.dateYYYYMMDD, allTimeDelineations);
        this._updateSubscriptions();
    }


    private _isNewTLEFirstOfDay(currentTime: moment.Moment): boolean {
        console.log("Is TLEF first one of the day ? " + currentTime.format('YYYY-MM-DD hh:mm a'))
        let newTLEisStartOfDay: boolean = true;
        if (this.sleepController.wakeupTimeIsSet) {
            console.log("The wakeup time is set.  Therefore, this is not the start entry.  teehee")
            newTLEisStartOfDay = false;
        } else if (this.timelogEntryController.lastTimelogEntryItemTime) {
            /**
             * if there is a previous time in the timelog, then that means that the user was active in the previous day, 
             * but now it's a new day and the wakeuptime is not set. 
             */
            const energyAtLastActivityEnd: number = this.energyController.getEnergyAtTime(this.timelogEntryController.lastTimelogEntryItemTime);
            const currentEnergy: number = this.energyController.getEnergyAtTime(currentTime);
            const energyDiff = currentEnergy - energyAtLastActivityEnd;

            const energyDiffThreshold = 0.5;
            if (energyDiff >= energyDiffThreshold) {
                newTLEisStartOfDay = true;
            } else {
                const minutesDiff = moment(currentTime).diff(this.sleepController.prevDayFallAsleepTime);

                newTLEisStartOfDay = false;
            }
            // this.sleepController.prevDayFallAsleepTime
            console.log("Energy difference between current time (" + currentTime.format('YYYY-MM-DD hh:mm a') + ")and last time (" + this.timelogEntryController.lastTimelogEntryItemTime.format('YYYY-MM-DD hh:mm a') + ") - ", energyDiff)
        } else {
            console.log("The wakeup time is not set")
        }
        return newTLEisStartOfDay;
    }


    private _isNewTLELastOfDay(currentTime: moment.Moment): boolean {
        let isLast: boolean = false;
        if (this.sleepController.wakeupTimeIsSet) {
            const checkWithinHours: number = 2;
            const askTimeDelineation: moment.Moment = moment(this.sleepController.fallAsleepTime).subtract(checkWithinHours, 'hours')
            if (currentTime.isSameOrAfter(askTimeDelineation)) {
                isLast = true;
            }
        } else {
            if (this.energyController.getEnergyLevelAtTime(currentTime) === DaybookEnergyLevel.Low) {
                isLast = true;
            }
        }
        return isLast;
    }

    private _updateSubscriptions() {
        this._subscriptions.forEach(s => s.unsubscribe());
        this._subscriptions = [];
        const timelogSub = this._timelogEntryController.timelogUpdated$.subscribe((update) => {
            // console.log("Received an update from timelog.  Updating.")
            this._updateTimelog(update);
        });
        const sleepSub = this._sleepController.sleepTimesUpdated$.subscribe((sleepTimes) => {
            this._updateThisDaySleepTimes(sleepTimes);
        });
        this._subscriptions = [timelogSub, sleepSub];
    }

    private _updateThisDaySleepTimes(sleepTimes: TimeSpanItem[]) {
        let prevDayChanged = false, thisDayChanged = false, nextDayChanged = false;
        let thisDayTimes = sleepTimes
            .filter(time => moment(time.startTimeISO).isSameOrAfter(this.startOfThisDay) && moment(time.endTimeISO).isSameOrBefore(this.endOfThisDay));
        let prevDayTimes = sleepTimes
            .filter(time => moment(time.startTimeISO).isSameOrAfter(this.startOfPrevDay) && moment(time.endTimeISO).isSameOrBefore(this.endOfPrevDay));
        let nextDayTimes = sleepTimes
            .filter(time => moment(time.startTimeISO).isSameOrAfter(this.startOfNextDay) && moment(time.endTimeISO).isSameOrBefore(this.endOfNextDay));
        if (thisDayTimes.length > 0) {
            thisDayChanged = true;
            this._thisDay.sleepTimes = thisDayTimes;
        }
        if (prevDayTimes.length > 0) {
            prevDayChanged = true;
            this._previousDay.sleepTimes = prevDayTimes;
        }
        if (nextDayTimes.length > 0) {
            nextDayChanged = true;
            this._followingDay.sleepTimes = nextDayTimes;
        }
        const daysChanged = {
            prevDayChanged: prevDayChanged,
            thisDayChanged: thisDayChanged,
            nextDayChanged: nextDayChanged,
        };
        this._dataChanged$.next(daysChanged);
    }

    private _updateTimelog(update: { prevDayItems: DaybookTimelogEntryDataItem[], thisDayItems: DaybookTimelogEntryDataItem[], nextDayItems: DaybookTimelogEntryDataItem[] }) {
        console.log("Updating timelog: ", update);
        let prevDayChanged = false, thisDayChanged = false, nextDayChanged = false;
        if (update.prevDayItems) {
            this._previousDay.timelogEntryDataItems = update.prevDayItems;
            prevDayChanged = true;
        }
        if (update.thisDayItems) {
            this._thisDay.timelogEntryDataItems = update.thisDayItems;
            thisDayChanged = true;
        }
        if (update.nextDayItems) {
            this._followingDay.timelogEntryDataItems = update.nextDayItems;
            nextDayChanged = true;
        }
        const daysChanged = {
            prevDayChanged: prevDayChanged,
            thisDayChanged: thisDayChanged,
            nextDayChanged: nextDayChanged,
        };
        // console.log("Next: ", daysChanged);
        this._dataChanged$.next(daysChanged);
    }


}
