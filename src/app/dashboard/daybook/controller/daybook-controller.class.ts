import * as moment from 'moment';

import { DaybookEnergyController } from './daybook-energy-controller.class';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryController } from './daybook-timelog-entry-controller.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookSleepController } from './daybook-sleep-controller.class';
import { Subject, Observable, Subscription } from 'rxjs';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookTimeDelineatorController } from './daybook-time-delineator-controller.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { DisplayGridBarItem } from '../widgets/timelog/timelog-entry-form/daybook-grid-items-bar/display-grid-bar-item.class';
import { DaybookTimePosition } from '../daybook-time-position-form/daybook-time-position.enum';


/** 
 *  The DaybookController class is a superclass to contain and control the DaybookDayItem class objects.
 *  
 *  Specifically, the contoller contains 3 DaybookDayItem objects:  previousDay, thisDay, nextDay.
 *  With this controller we can execute CRUD operations for things such as TimelogEntryItems and other DaybookDayItem input values.
 */
export class DaybookController extends TimeSchedule<DaybookAvailabilityType> {

    constructor(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }, clock: moment.Moment) {
        super(dayItem.thisDay.startOfThisDay, dayItem.thisDay.endOfThisDay);
        this._clock = clock;
        this._reload(dayItem);
    }

    private _clock: moment.Moment;
    private _previousDay: DaybookDayItem;
    private _thisDay: DaybookDayItem;
    private _followingDay: DaybookDayItem;

    private _sleepController: DaybookSleepController;
    private _timelogEntryController: DaybookTimelogEntryController;
    private _energyController: DaybookEnergyController;
    private _timeDelineatorController: DaybookTimeDelineatorController;


    private _dataChanged$: Subject<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> = new Subject();
    private _subscriptions: Subscription[] = [];

    private get timelogEntryController(): DaybookTimelogEntryController { return this._timelogEntryController; }
    private get sleepController(): DaybookSleepController { return this._sleepController; }
    private get energyController(): DaybookEnergyController { return this._energyController; }
    private get timeDelineatorController(): DaybookTimeDelineatorController { return this._timeDelineatorController; }

    public reload(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        // console.log("Reloading the controller: ", dayItem)
        this._reload(dayItem);
    }

    public get clock(): moment.Moment { return this._clock; }
    public get dateYYYYMMDD(): string { return this._thisDay.dateYYYYMMDD; }
    public get isToday(): boolean { return this._thisDay.dateYYYYMMDD === this.clock.format('YYYY-MM-DD'); }
    public get controllerStartTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').subtract(1, 'days'); }
    public get controllerEndTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').add(2, 'days'); }

    public get previousDay(): DaybookDayItem { return this._previousDay; }
    public get thisDay(): DaybookDayItem { return this._thisDay; }
    public get followingDay(): DaybookDayItem { return this._followingDay; }

    public get startOfPrevDay(): moment.Moment { return moment(this.previousDay.dateYYYYMMDD).startOf('day'); }
    public get startOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day'); }
    public get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    public get endOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    public get endOfNextDay(): moment.Moment { return moment(this.followingDay.dateYYYYMMDD).startOf('day').add(1, 'days'); };

    public get dailyWeightLogEntryKg(): number { return this._thisDay.dailyWeightLogEntryKg; }


    public get savedTimeDelineators(): moment.Moment[] { return this.timeDelineatorController.savedTimeDelineators; }
    public saveTimeDelineators(delineators: moment.Moment[]) {
        this._timeDelineatorController.saveTimeDelineators(delineators);
    }
    public deleteDelineator(time: moment.Moment) {
        this._timeDelineatorController.deleteDelineator(time);
    }
    public updateDelineator(originalTime: moment.Moment, saveNewDelineator: moment.Moment) {
        this._timeDelineatorController.updateDelineator(originalTime, saveNewDelineator);
    }

    public getSleepItem(gridItemStart: moment.Moment, gridItemEnd: moment.Moment): SleepEntryItem {
        return this.sleepController.getSleepItem(gridItemStart, gridItemEnd);
    }
    public getTimelogEntryItem(gridItemStart: moment.Moment, gridItemEnd: moment.Moment): TimelogEntryItem {
        return this.timelogEntryController.getTimelogEntryItem(gridItemStart, gridItemEnd);
    }

    public getDaybookAvailability(startTime: moment.Moment, endTime: moment.Moment): DaybookAvailabilityType{
        
        const foundItem = this.fullScheduleItems.find((item)=>{
            const sameStart = item.startTime.isSame(startTime) && item.endTime.isAfter(startTime);
            const sameEnd = item.endTime.isSame(endTime) && item.startTime.isBefore(endTime );
            return sameStart || sameEnd;
        });
        if(foundItem){
            // console.log("FInding items.  start: " + startTime.format('hh:mm a') + " to " + endTime.format('hh:mm a') + " -- : " + foundItem.value)
            return foundItem.value;
        }else{
            console.log("Could not find availability");
            return null;
        }
    }


    public getEarliestAvailability(fromTime: moment.Moment): moment.Moment {
        const availabileItems = this.fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
        const foundIndex = availabileItems.findIndex(item => fromTime.isSameOrAfter(item.startTime) && fromTime.isBefore(item.endTime));
        if (foundIndex >= 0) {
            if (foundIndex === 0) {
                return availabileItems[foundIndex].startTime;
            } else if (foundIndex > 0) {
                let startTime = availabileItems[foundIndex].startTime;
                for (let i = foundIndex - 1; i < 0; i--) {
                    if (availabileItems[i].startTime.isSame(availabileItems[i - 1].endTime)) {
                        startTime = availabileItems[i - 1].startTime;
                    } else {
                        i = -1;
                    }
                }
                return startTime;
            }
        } else {
            return fromTime;
        }
    }
    public getLatestAvailability(fromTime: moment.Moment): moment.Moment {
        const availabileItems = this.fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
        const foundIndex = availabileItems.findIndex(item => fromTime.isSameOrAfter(item.startTime) && fromTime.isSameOrBefore(item.endTime));
        if (foundIndex >= 0) {
            let endTime = availabileItems[foundIndex].endTime;
            for (let i = foundIndex; i < availabileItems.length; i++) {
                if (i < availabileItems.length-1) {
                    if (availabileItems[i].endTime.isSame(availabileItems[i + 1].startTime)) {
                        endTime = availabileItems[i + 1].endTime;
                    } else {
                        i = availabileItems.length + 1;
                    }
                }
            }
            return endTime;

        } else {
            // console.log('error: couldnt find availability start time. Row start time:  ' + rowStartTime.format('hh:mm a'));
            return fromTime;
        }
    }

    public get wakeupTime(): moment.Moment { return this.sleepController.firstWakeupTime; }
    public get wakeupTimeIsSet(): boolean { return this.sleepController.wakeupTimeIsSet; }
    public get fallAsleepTime(): moment.Moment { return this.sleepController.fallAsleepTime; }
    public get prevDayFallAsleepTime(): moment.Moment { return this.sleepController.prevDayFallAsleepTime; }
    public get awakeToAsleepRatio(): number { return this.sleepController.awakeToAsleepRatio; }

    public getEnergyAtTime(time: moment.Moment): number { return this.energyController.getEnergyAtTime(time); }
    public setWakeupTimeForDay(time: moment.Moment) { this.sleepController.setWakeupTimeForDay(time); }

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

    public getNewCurrentTLE(): TimelogEntryItem {
        const endTime: moment.Moment = this.clock;
        const foundItem = this.fullScheduleItems.find((item) => {
            return endTime.isSameOrBefore(item.endTime) && endTime.isAfter(item.startTime)
        });
        if (foundItem) {
            const startTime = foundItem.startTime;
            return new TimelogEntryItem(startTime, endTime);
        } else {
            console.log('Error: could not find schedule item');
            return new TimelogEntryItem(endTime, endTime);
        }

    }


    /**
     * Determines the current time position, relative to the sleep cycle.
     */
    public getCurrentTimePosition(): DaybookTimePosition {
        let timePosition: DaybookTimePosition;
        const isBeforeWakeupTime: boolean = moment(this.clock).isBefore(this.wakeupTime);
        const prevDayActivities: boolean = this.previousDay.timelogEntryDataItems.length > 0;
        if (isBeforeWakeupTime) {
            const sleepStartTime = moment(this.sleepController.prevDayFallAsleepTime);
            const sleepMS = moment(this.wakeupTime).diff(sleepStartTime, 'milliseconds');
            if (sleepMS <= 0) {
                console.log('Error with sleep time calculations.');
            } else {
                const endOfFirstQuartile = moment(sleepStartTime).add((sleepMS / 4), 'milliseconds');
                const startOfFourthQuartile = moment(this.wakeupTime).subtract((sleepMS) / 4, 'milliseconds');
                const isFirstQuartile = moment(this.clock).isSameOrBefore(endOfFirstQuartile);
                const isFourthQuartile = moment(this.clock).isSameOrAfter(startOfFourthQuartile);
                const isMiddle = moment(this.clock).isSameOrAfter(endOfFirstQuartile) && moment(this.clock).isSameOrBefore(startOfFourthQuartile);
                if (isFirstQuartile) {
                    if (prevDayActivities) {
                        timePosition = DaybookTimePosition.AWAKE_FROM_PREV_DAY;
                    } else {
                        timePosition = DaybookTimePosition.UNCLEAR;
                    }
                } else if (isFourthQuartile) {
                    timePosition = DaybookTimePosition.NEW_DAY;
                } else if (isMiddle) {
                    timePosition = DaybookTimePosition.UNCLEAR;
                } else {
                    console.log('Error with time calculations');
                }
            }
        } else {
            if (!this.wakeupTimeIsSet) {
                timePosition = DaybookTimePosition.NEW_DAY;
            } else {
                const awakeMS = moment(this.fallAsleepTime).diff(this.wakeupTime, 'milliseconds');
                const startOfFourthQuartile = moment(this.fallAsleepTime).subtract((awakeMS) / 4, 'milliseconds');
                const isAfterFourthQuartile = moment(this.clock).isSameOrAfter(startOfFourthQuartile);
                if (isAfterFourthQuartile) {
                    timePosition = DaybookTimePosition.APPROACHING_SLEEP;
                } else {
                    timePosition = DaybookTimePosition.NORMAL;
                }
            }
        }
        if (!timePosition) {
            console.log('Error with finding timePosition');
        }
        // console.log("Time Position is: " + timePosition);
        return timePosition;
    }


    public get isNewDay(): boolean {
        return this.getCurrentTimePosition() === DaybookTimePosition.NEW_DAY;
    }

    public isTimeAvailable(time: moment.Moment): boolean {
        const foundItem = this.fullScheduleItems.find((item) => {
            return time.isSameOrAfter(item.startTime) && time.isSameOrBefore(item.endTime);
        });
        if (foundItem) {
            return foundItem.value === DaybookAvailabilityType.AVAILABLE;
        } else {
            console.log("Error: could not find item for time : " + time.format('YYYY-MM-DD hh:mm a'));
        }
    }
    /**
     * Searches for availability, which is where the schedule item does not have value.
     */
    public isRangeAvailable(startTime: moment.Moment, endTime: moment.Moment): boolean {
        let foundItems = this.getScheduleSlice(startTime, endTime);
        const diffMS = endTime.diff(startTime, 'milliseconds');
        let isAvailable: boolean = false;
        if (diffMS < 0) {
            console.log('Error: endtime is before start time');
        }
        if (foundItems.length === 0) {
            isAvailable = false;
        } else if (foundItems.length === 1) {
            isAvailable = foundItems[0].value === DaybookAvailabilityType.AVAILABLE;
        } else if (foundItems.length > 1) {
            const availableMS: number = foundItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE).reduce((a, b) => { return a += b.durationMS }, 0);
            if (availableMS > (Math.abs(diffMS) / 2)) {
                isAvailable = true;
            } else {
                isAvailable = false;
            }
        }
        return isAvailable;
    }

    public get dataChanged$(): Observable<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> {
        return this._dataChanged$.asObservable();
    }

    private _reload(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        this._previousDay = dayItem.prevDay;
        this._thisDay = dayItem.thisDay;
        this._followingDay = dayItem.nextDay;
        super._reconstructSchedule(this.startOfPrevDay, this.endOfNextDay);
        this._buildController();
    }

    private _buildController() {
        const timelogDataItems: DaybookTimelogEntryDataItem[] = this._previousDay.timelogEntryDataItems.concat(this._thisDay.timelogEntryDataItems)
            .concat(this._followingDay.timelogEntryDataItems);
        const allSleepSpanItems = this._previousDay.sleepDataItems.concat(this._thisDay.sleepDataItems).concat(this._followingDay.sleepDataItems);
        const allTimeDelineations = this._previousDay.timeDelineators.concat(this._thisDay.timeDelineators).concat(this._followingDay.timeDelineators);

        this._sleepController = new DaybookSleepController(this._previousDay.sleepDataItems, this._thisDay.sleepDataItems, this._followingDay.sleepDataItems, this.dateYYYYMMDD);

        const timeScheduleValueItems: TimeScheduleItem<DaybookAvailabilityType>[] = [
            ...timelogDataItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(moment(item.startTimeISO), moment(item.endTimeISO), true, DaybookAvailabilityType.TIMELOG_ENTRY)),
            ...this.sleepController.valueItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(item.startTime, item.endTime, true, DaybookAvailabilityType.SLEEP)),
        ];
        this.addScheduleValueItems(timeScheduleValueItems);

        this._timeDelineatorController = new DaybookTimeDelineatorController(this.dateYYYYMMDD, allTimeDelineations);
        this._timelogEntryController = new DaybookTimelogEntryController(this.dateYYYYMMDD, timelogDataItems, allSleepSpanItems);
        this._energyController = new DaybookEnergyController(this.fullScheduleItems, this.awakeToAsleepRatio);

        allTimeDelineations.push(this.clock.startOf('minute'));

        this._setAvailabilitySections(allTimeDelineations);


        this._updateSubscriptions();
    }

    private _setAvailabilitySections(allTimeDelineations: moment.Moment[]) {
        allTimeDelineations = allTimeDelineations.sort((t1, t2) => {
            if (t1.isBefore(t2)) { return -1; }
            else if (t1.isAfter(t2)) { return 1; }
            else { return 0; }
        });
        let nullItems = this.fullScheduleItems.filter(item => item.value === null);
        nullItems.forEach((scheduleItem) => {
            scheduleItem.value = DaybookAvailabilityType.AVAILABLE;
        });
        allTimeDelineations.forEach((timeDelineator) => {
            const foundItem = nullItems.find(item => timeDelineator.isSameOrAfter(item.startTime) && timeDelineator.isSameOrBefore(item.endTime));
            if (foundItem) {
                const foundDelineators = allTimeDelineations.filter(del => del.isSameOrAfter(foundItem.startTime) && del.isSameOrBefore(foundItem.endTime));
                this._splitItemAtTimes(foundDelineators, foundItem);
            }
        });
    }

    private _updateSubscriptions() {
        this._subscriptions.forEach(s => s.unsubscribe());
        this._subscriptions = [];
        const timelogSub = this.timelogEntryController.timelogUpdated$.subscribe((update) => {
            // console.log("Received an update from timelog.  Updating.")
            this._updateTimelog(update);
        });
        const sleepSub = this.sleepController.sleepTimesUpdated$.subscribe((sleepInputDataItems: DaybookSleepInputDataItem[]) => {
            this._updateThisDaySleepInputItems(sleepInputDataItems);
        });
        const delineatorSub = this.timeDelineatorController.saveChanges$.subscribe((delineators: moment.Moment[]) => {
            this._updateTimeDelineators(delineators);
        })
        this._subscriptions = [timelogSub, sleepSub, delineatorSub];
    }

    private _updateTimeDelineators(delineators: moment.Moment[]) {
        this._thisDay.timeDelineators = delineators;
        this._dataChanged$.next({
            prevDayChanged: false,
            thisDayChanged: true,
            nextDayChanged: false,
        });
    }

    private _updateThisDaySleepInputItems(sleepInputDataItems: DaybookSleepInputDataItem[]) {
        let prevDayChanged = false, thisDayChanged = false, nextDayChanged = false;
        let thisDayTimes = sleepInputDataItems
            .filter(dataItem => moment(dataItem.startTimeISO).isSameOrAfter(this.startOfThisDay) && moment(dataItem.endTimeISO).isSameOrBefore(this.endOfThisDay));
        let prevDayTimes = sleepInputDataItems
            .filter(dataItem => moment(dataItem.startTimeISO).isSameOrAfter(this.startOfPrevDay) && moment(dataItem.endTimeISO).isSameOrBefore(this.endOfPrevDay));
        let nextDayTimes = sleepInputDataItems
            .filter(dataItem => moment(dataItem.startTimeISO).isSameOrAfter(this.startOfNextDay) && moment(dataItem.endTimeISO).isSameOrBefore(this.endOfNextDay));
        if (thisDayTimes.length > 0) {
            thisDayChanged = true;
            this._thisDay.sleepDataItems = thisDayTimes;
        }
        if (prevDayTimes.length > 0) {
            prevDayChanged = true;
            this._previousDay.sleepDataItems = prevDayTimes;
        }
        if (nextDayTimes.length > 0) {
            nextDayChanged = true;
            this._followingDay.sleepDataItems = nextDayTimes;
        }
        const daysChanged = {
            prevDayChanged: prevDayChanged,
            thisDayChanged: thisDayChanged,
            nextDayChanged: nextDayChanged,
        };
        this._dataChanged$.next(daysChanged);
    }

    private _updateTimelog(update: { prevDayItems: DaybookTimelogEntryDataItem[], thisDayItems: DaybookTimelogEntryDataItem[], nextDayItems: DaybookTimelogEntryDataItem[] }) {
        // console.log("Updating timelog: ", update);
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
