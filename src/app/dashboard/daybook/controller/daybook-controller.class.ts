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
import { DaybookSleepEntryItem } from './items/daybook-sleep-entry-item.class';


export class DaybookController extends TimeSchedule<DaybookAvailabilityType> {

    constructor(dayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) {
        super(dayItem.thisDay.startOfThisDay, dayItem.thisDay.endOfThisDay);
        this._reload(dayItem);
    }

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

    public get dateYYYYMMDD(): string { return this._thisDay.dateYYYYMMDD; }
    public get isToday(): boolean { return this._thisDay.dateYYYYMMDD === moment().format('YYYY-MM-DD'); }
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


    public get timeDelineations(): moment.Moment[] { return this.timeDelineatorController.timeDelineations; }
    public saveTimeDelineator$(time: moment.Moment) {
        this._timeDelineatorController.saveTimeDelineator$(time);
    }
    public deleteDelineator(time: moment.Moment) {
        this._timeDelineatorController.deleteDelineator(time);
    }
    public updateDelineator(originalTime: moment.Moment, saveNewDelineator: moment.Moment) {
        this._timeDelineatorController.updateDelineator(originalTime, saveNewDelineator);
    }
    public getEarliestAvailability(rowStartTime: moment.Moment): moment.Moment {
        const availabileItems = this.fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
        const foundIndex = availabileItems.findIndex(item => rowStartTime.isSameOrAfter(item.startTime) && rowStartTime.isSameOrBefore(item.endTime));
        if (foundIndex >= 0) {
            if (foundIndex === 0) {
                return availabileItems[foundIndex].startTime;
            } else if (foundIndex > 0) {
                let startTime = availabileItems[foundIndex].startTime;
                for (let i = foundIndex - 1; i < 0; i--) {
                    if (availabileItems[i].startTime.isSame(availabileItems[i -1].endTime)) {
                        startTime = availabileItems[i-1].startTime;
                    } else {
                        i = -1;
                    }
                }
                return startTime;
            }
        } else {
            // console.log('error: couldnt find availability start time. Row start time:  ' + rowStartTime.format('hh:mm a'));
        }
    }
    public getLatestAvailability(rowStartTime: moment.Moment): moment.Moment {
        const availabileItems = this.fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
        const foundIndex = availabileItems.findIndex(item => rowStartTime.isSameOrAfter(item.startTime) && rowStartTime.isSameOrBefore(item.endTime));
        if (foundIndex >= 0) {

            let endTime = availabileItems[foundIndex].endTime;
            for (let i = foundIndex; i < availabileItems.length; i++) {
                if (availabileItems[i].endTime.isSame(availabileItems[i + 1].startTime)) {
                    endTime = availabileItems[i+1].endTime;
                } else {
                    i = availabileItems.length + 1;
                }
            }
            return endTime;

        } else {
            // console.log('error: couldnt find availability start time. Row start time:  ' + rowStartTime.format('hh:mm a'));
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

    public isTimeAvailable(time: moment.Moment): boolean{
        const foundItem = this.fullScheduleItems.find((item)=>{ 
            return time.isSameOrAfter(item.startTime) && time.isSameOrBefore(item.endTime);
        });
        if(foundItem){
            return foundItem.value === DaybookAvailabilityType.AVAILABLE;
        }else{
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

        // console.log("PRev day: " , this._previousDay)
        // console.log(" cur day"  ,this._thisDay)
        // console.log("next day: " , this._followingDay)
        const timelogDataItems: DaybookTimelogEntryDataItem[] = this._previousDay.timelogEntryDataItems.concat(this._thisDay.timelogEntryDataItems)
            .concat(this._followingDay.timelogEntryDataItems);
        const allSleepSpanItems = this._previousDay.sleepTimes.concat(this._thisDay.sleepTimes).concat(this._followingDay.sleepTimes);
        const allEnergyLevelInputs = this._previousDay.sleepEnergyLevelInputs.concat(this._thisDay.sleepEnergyLevelInputs)
            .concat(this._followingDay.sleepEnergyLevelInputs);

        // console.log("Building the controller: " + moment().format('hh:mm:ss a'))
        // const nowTime = moment(); 
        const allTimeDelineations = this._previousDay.timeDelineators.concat(this._thisDay.timeDelineators).concat(this._followingDay.timeDelineators);


        this._sleepController = new DaybookSleepController(this._previousDay.sleepTimes,
            this._thisDay.sleepTimes, this._followingDay.sleepTimes, this.dateYYYYMMDD);

        // console.log("TimelogDataItems is ", timelogDataItems)
        const timeScheduleValueItems: TimeScheduleItem<DaybookAvailabilityType>[] = [
            ...timelogDataItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(moment(item.startTimeISO), moment(item.endTimeISO), true, DaybookAvailabilityType.TIMELOG_ENTRY)),
            ...this.sleepController.valueItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(item.startTime, item.endTime, true, DaybookAvailabilityType.SLEEP)),
        ]
        // timeScheduleValueItems.forEach((item)=>{
        // console.log("TSE: " + item.toString());
        // })
        // console.log("Adding TimeScheudle value itmes:  " + timeScheduleValueItems.length)
        this.addScheduleValueItems(timeScheduleValueItems);
        this._setAvailabilitySections(allTimeDelineations);

        // console.log("Schedule has been rebuilt in the daybookcontoller.")
        // this.logFullScheduleItems();

        this._timelogEntryController = new DaybookTimelogEntryController(this.dateYYYYMMDD, timelogDataItems, allSleepSpanItems);
        this._energyController = new DaybookEnergyController(this.fullScheduleItems, this.awakeToAsleepRatio);
        this._timeDelineatorController = new DaybookTimeDelineatorController(this.dateYYYYMMDD, allTimeDelineations);
        this._updateSubscriptions();
    }

    private _setAvailabilitySections(allTimeDelineations: moment.Moment[]) {

        allTimeDelineations = allTimeDelineations.sort((t1, t2)=>{
            if(t1.isBefore(t2)){ return -1; }
            else if(t1.isAfter(t2)){ return 1; }
            else { return 0; }
        });
        let nullItems = this.fullScheduleItems.filter(item => item.value === null);
        nullItems.forEach((scheduleItem) => {
            scheduleItem.value = DaybookAvailabilityType.AVAILABLE;
        });
        allTimeDelineations.forEach((timeDelineator) => {
            // if(timeDelineator.isSame(nowTime)){

            // }else{
                const foundItem = nullItems.find(item => timeDelineator.isSameOrAfter(item.startTime) && timeDelineator.isSameOrBefore(item.endTime));
                if (foundItem) {
                    const foundDelineators = allTimeDelineations.filter(del => del.isSameOrAfter(foundItem.startTime) && del.isSameOrBefore(foundItem.endTime));
                    this._splitItemAtTimes(foundDelineators, foundItem);
                }
            // }
            
        });
    }

    private _isNewTLEFirstOfDay(currentTime: moment.Moment): boolean {
        let newTLEisStartOfDay: boolean = true;
        if (this.sleepController.wakeupTimeIsSet) {
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
            // console.log("Energy difference between current time (" + currentTime.format('YYYY-MM-DD hh:mm a') + ")and last time (" + this.timelogEntryController.lastTimelogEntryItemTime.format('YYYY-MM-DD hh:mm a') + ") - ", energyDiff)
        } else {
            // console.log("The wakeup time is not set")
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
        const timelogSub = this.timelogEntryController.timelogUpdated$.subscribe((update) => {
            // console.log("Received an update from timelog.  Updating.")
            this._updateTimelog(update);
        });
        const sleepSub = this.sleepController.sleepTimesUpdated$.subscribe((sleepTimes: DaybookSleepEntryItem[]) => {
            this._updateThisDaySleepTimes(sleepTimes);
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

    private _updateThisDaySleepTimes(sleepTimes: DaybookSleepEntryItem[]) {
        let prevDayChanged = false, thisDayChanged = false, nextDayChanged = false;
        let thisDayTimes = sleepTimes
            .filter(time => moment(time.startTime).isSameOrAfter(this.startOfThisDay) && moment(time.endTime).isSameOrBefore(this.endOfThisDay));
        let prevDayTimes = sleepTimes
            .filter(time => moment(time.startTime).isSameOrAfter(this.startOfPrevDay) && moment(time.endTime).isSameOrBefore(this.endOfPrevDay));
        let nextDayTimes = sleepTimes
            .filter(time => moment(time.startTime).isSameOrAfter(this.startOfNextDay) && moment(time.endTime).isSameOrBefore(this.endOfNextDay));
        if (thisDayTimes.length > 0) {
            thisDayChanged = true;
            this._thisDay.sleepTimes = thisDayTimes.map(item => item.saveToDB);
        }
        if (prevDayTimes.length > 0) {
            prevDayChanged = true;
            this._previousDay.sleepTimes = prevDayTimes.map(item => item.saveToDB);
        }
        if (nextDayTimes.length > 0) {
            nextDayChanged = true;
            this._followingDay.sleepTimes = nextDayTimes.map(item => item.saveToDB);
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
