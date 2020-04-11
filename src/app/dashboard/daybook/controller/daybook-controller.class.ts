import * as moment from 'moment';


import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryController } from './daybook-timelog-entry-controller.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookSleepController } from './daybook-sleep-controller.class';
import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookTimeDelineatorController } from './daybook-time-delineator-controller.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookTimePosition } from '../daybook-time-position-form/daybook-time-position.enum';
import { DetermineDaybookTimePosition } from './items/determine-daybook-time-position.class';


/** 
 *  The DaybookController class is a superclass to contain and control the DaybookDayItem class objects.
 *  
 *  Specifically, the contoller contains 3 DaybookDayItem objects:  previousDay, thisDay, nextDay.
 *  With this controller we can execute CRUD operations for things such as TimelogEntryItems and other DaybookDayItem input values.
 */
export class DaybookController extends TimeSchedule<DaybookAvailabilityType> {

    constructor(thisDayYYYYMMDD: string, daybookDayItems: DaybookDayItem[], startTime: moment.Moment, endTime: moment.Moment, clock: moment.Moment) {
        super(startTime, endTime);
        // console.log("*Constructing Daybook Controller")
        this._thisDayYYYYMMDD = thisDayYYYYMMDD;
        this._clock = clock;
        this._reload(daybookDayItems);
    }

    private _clock: moment.Moment;
    private _previousDay: DaybookDayItem;
    private _thisDay: DaybookDayItem;
    private _followingDay: DaybookDayItem;

    private _thisDayYYYYMMDD: string;

    private _sleepController: DaybookSleepController;
    private _timelogEntryController: DaybookTimelogEntryController;
    // private _energyController: DaybookEnergyController;
    private _timeDelineatorController: DaybookTimeDelineatorController;

    private _dayItems: DaybookDayItem[] = [];
    private _batteryLevel: number = 0;


    private _dataChanged$: Subject<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> = new Subject();
    private _subscriptions: Subscription[] = [];

    private get timelogEntryController(): DaybookTimelogEntryController { return this._timelogEntryController; }
    private get sleepController(): DaybookSleepController { return this._sleepController; }
    // private get energyController(): DaybookEnergyController { return this._energyController; }
    private get timeDelineatorController(): DaybookTimeDelineatorController { return this._timeDelineatorController; }

    public reload(dayItems: DaybookDayItem[]) {
        this._reload(dayItems);
    }

    public get clock(): moment.Moment { return this._clock; }
    public get dateYYYYMMDD(): string { return this._thisDayYYYYMMDD; }
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

    public get batteryLevel(): number { return this._batteryLevel; }

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

    public getDaybookAvailability(startTime: moment.Moment, endTime: moment.Moment): DaybookAvailabilityType {

        const foundItem = this.fullScheduleItems.find((item) => {
            const sameStart = item.startTime.isSame(startTime) && item.endTime.isAfter(startTime);
            const sameEnd = item.endTime.isSame(endTime) && item.startTime.isBefore(endTime);
            return sameStart || sameEnd;
        });
        if (foundItem) {
            // console.log("FInding items.  start: " + startTime.format('hh:mm a') + " to " + endTime.format('hh:mm a') + " -- : " + foundItem.value)
            return foundItem.value;
        } else {
            const foundInnerItem = this.fullScheduleItems.find((item) => {
                return item.startTime.isSameOrBefore(startTime) && item.endTime.isSameOrAfter(endTime);
            });
            if(foundInnerItem){
                return foundInnerItem.value;
            }else{
                
            }
        }
        console.log("Could not find an item;");
        return null;
    }


    public getEarliestAvailability(fromTime: moment.Moment): moment.Moment {
        const availabileItems = this.fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
        const foundIndex = availabileItems.findIndex(item => fromTime.isSameOrAfter(item.startTime) && fromTime.isAfter(item.startTime));
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
                if (i < availabileItems.length - 1) {
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

    
    public getFallAsleepTimeMaxVal(): moment.Moment {
        return moment(this.sleepController.nextDayWakeupTime).subtract(10, 'minutes');
    }
    public getFallAsleepTimeMinVal(): moment.Moment {
        let minVal: moment.Moment = moment(this.fallAsleepTime);
        const thisIndex = this.findItemIndex(this.fallAsleepTime);
        if(thisIndex > 0){
            if(this.fullScheduleItems[thisIndex-1].value === DaybookAvailabilityType.AVAILABLE){
                minVal = moment(this.fullScheduleItems[thisIndex-1].startTime);
            }
        }
        return minVal;
    }
    public getWakeupTimeMaxVal(): moment.Moment {
        let maxVal: moment.Moment = moment(this.wakeupTime);
        const thisIndex = this.findItemIndex(this.wakeupTime);
        if(thisIndex > -1 && thisIndex < this.fullScheduleItems.length-1){
            if(this.fullScheduleItems[thisIndex].value === DaybookAvailabilityType.AVAILABLE){
                maxVal = moment(this.fullScheduleItems[thisIndex].endTime);
            }
        }
        return maxVal;
    }
    public getWakeupTimeMinVal(): moment.Moment {
        return moment(this.prevDayFallAsleepTime).add(10, 'minutes');
    }

    public get wakeupTime(): moment.Moment { return this.sleepController.thisDayWakeupTime; }
    public get wakeupTimeIsSet(): boolean { return this.sleepController.wakeupTimeIsSet; }
    public get fallAsleepTime(): moment.Moment { return this.sleepController.thisDayFallAsleepTime; }
    public get fallAsleepTimeIsSet(): boolean { return this.sleepController.fallAsleepTimeIsSet; }
    public get prevDayFallAsleepTime(): moment.Moment { return this.sleepController.prevDayFallAsleepTime; }
    public get awakeToAsleepRatio(): number { return this.sleepController.awakeToAsleepRatio; }

    public getEnergyAtTime(time: moment.Moment): number { return this.sleepController.getEnergyAtTime(time); }
    public setWakeupTime(time: moment.Moment) { this.sleepController.setWakeupTime(time); }
    public setFallAsleepTime(time: moment.Moment) { this.sleepController.setFallAsleepTime(time); }

    public get timelogEntryItems(): TimelogEntryItem[] { return this.timelogEntryController.timelogEntryItems; }
    public saveTimelogEntryItem$(saveTimelogEntry: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.saveTimelogEntryItem$(this.dateYYYYMMDD, saveTimelogEntry);
    }
    public updateTimelogEntryItem$(updateTimelogEntry: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.updateTimelogEntryItem$(this.dateYYYYMMDD, updateTimelogEntry);
    }
    public deleteTimelogEntryItem$(deleteItem: TimelogEntryItem): Observable<boolean> {
        return this.timelogEntryController.deleteTimelogEntryItem$(this.dateYYYYMMDD, deleteItem);
    }

    public getNewCurrentTLE(): TimelogEntryItem {
        const endTime: moment.Moment = this.clock;
        const foundItem = this.fullScheduleItems
            .filter(item => item.value === DaybookAvailabilityType.AVAILABLE)
            .find((item) => {
            return endTime.isSameOrBefore(item.endTime) && endTime.isAfter(item.startTime)
        });
        if (foundItem) {
            const startTime = foundItem.startTime;
            return new TimelogEntryItem(startTime, endTime);
        } else {
            return null;
        }

    }

    private _timePosition$: BehaviorSubject<DaybookTimePosition> = new BehaviorSubject(null);
    public get timePosition$(): Observable<DaybookTimePosition> { return this._timePosition$.asObservable(); }
    public get timePosition(): DaybookTimePosition { return this._timePosition$.getValue(); }


    


    public get isNewDay(): boolean {
        return this.timePosition === DaybookTimePosition.NEW_DAY;
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

    private _reload(dayItems: DaybookDayItem[]) {
        this._dayItems = dayItems;
        // console.log("*Reloading.  DayItems count: " + this._dayItems.length)
        const thisDateYYYYMMDD: string = this.dateYYYYMMDD;
        const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'day').format('YYYY-MM-DD');
        const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'day').format('YYYY-MM-DD');

        // console.log("Prev date: " + prevDateYYYYMMDD)
        // console.log("This date: " + thisDateYYYYMMDD)
        // console.log("Next date: " + nextDateYYYYMMDD)
        this._previousDay = dayItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
        this._thisDay = dayItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
        this._followingDay = dayItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
        super._reconstructSchedule(this.startOfPrevDay, this.endOfNextDay);
        this._buildController();
        // this.logFullScheduleItems();
    }

    private _buildController() {
        const allTimelogDataItems: DaybookTimelogEntryDataItem[] = this._previousDay.timelogEntryDataItems.concat(this._thisDay.timelogEntryDataItems)
            .concat(this._followingDay.timelogEntryDataItems);

        const allTimeDelineations = this._previousDay.timeDelineators.concat(this._thisDay.timeDelineators).concat(this._followingDay.timeDelineators);        
        this._sleepController = new DaybookSleepController(this.dateYYYYMMDD, this._previousDay.sleepInputItem,
            this._thisDay.sleepInputItem,
            this._followingDay.sleepInputItem,
            this.clock, this._dayItems.map(item => item.sleepInputItem));

        const timeScheduleValueItems: TimeScheduleItem<DaybookAvailabilityType>[] = [
            ...allTimelogDataItems.map(item => new TimeScheduleItem<DaybookAvailabilityType>(moment(item.startTimeISO), moment(item.endTimeISO), true, DaybookAvailabilityType.TIMELOG_ENTRY)),
            ...this.sleepController.getDaybookTimeScheduleItems(),
        ];

        this.addScheduleValueItems(timeScheduleValueItems);

        const relevantTimelogItems = {
            prevItems: this._previousDay.timelogEntryDataItems,
            thisItems: this._thisDay.timelogEntryDataItems,
            nextItems: this._followingDay.timelogEntryDataItems,
        }
        this._timeDelineatorController = new DaybookTimeDelineatorController(this.dateYYYYMMDD, allTimeDelineations);
        this._timelogEntryController = new DaybookTimelogEntryController(this.dateYYYYMMDD, relevantTimelogItems);

        // this._buildEnergyController();


        allTimeDelineations.push(this.clock.startOf('minute'));

        this._setAvailabilitySections(allTimeDelineations);
        this._updateSubscriptions();
        const timePosition = this._determineCurrentTimePosition();
        this._timePosition$.next(timePosition);
        this._batteryLevel = this.getEnergyAtTime(this.clock);
    }

    private _determineCurrentTimePosition(): DaybookTimePosition{
        const prevDayActivities: boolean = this.previousDay.timelogEntryDataItems.length > 0;
        const determiner: DetermineDaybookTimePosition = new DetermineDaybookTimePosition(this.clock, this.wakeupTime, this.prevDayFallAsleepTime, this.fallAsleepTime, prevDayActivities, this.wakeupTimeIsSet);
        return determiner.currentTimePosition;
    }

    private _setAvailabilitySections(allTimeDelineations: moment.Moment[]) {
        allTimeDelineations = allTimeDelineations.sort((t1, t2) => {
            if (t1.isBefore(t2)) { return -1; }
            else if (t1.isAfter(t2)) { return 1; }
            else { return 0; }
        });
        let nullItems = this.fullScheduleItems.filter(item => item.value === null);
        nullItems.forEach(item => item.value = DaybookAvailabilityType.AVAILABLE);
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
        const sleepSub = this.sleepController.sleepEntryUpdated$.subscribe((update: { entryItem: SleepEntryItem, dateYYYYMMDD: string }[]) => {
            this._updateSleepItems(update)
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

    private _updateSleepItems(update: { entryItem: SleepEntryItem, dateYYYYMMDD: string }[]) {
        const daysChanged = {
            prevDayChanged: false,
            thisDayChanged: false,
            nextDayChanged: false,
        };
        update.forEach((updatedDay)=>{
            // console.log("Updating sleep item: " + updatedDay.dateYYYYMMDD + " -  " + updatedDay.entryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + updatedDay.entryItem.endTime.format('YYYY-MM-DD hh:mm a'))
            
            if (updatedDay.dateYYYYMMDD === this.previousDay.dateYYYYMMDD) {
                this._previousDay.sleepInputItem = updatedDay.entryItem.exportToDataItem();
                daysChanged.prevDayChanged = true;
            } else if (updatedDay.dateYYYYMMDD === this.thisDay.dateYYYYMMDD) {
                this._thisDay.sleepInputItem = updatedDay.entryItem.exportToDataItem();
                daysChanged.thisDayChanged = true;
            } else if (updatedDay.dateYYYYMMDD === this.followingDay.dateYYYYMMDD) {
                this._followingDay.sleepInputItem = updatedDay.entryItem.exportToDataItem();
                daysChanged.nextDayChanged = true;
            }
            
        });
        this._dataChanged$.next(daysChanged)
    }
    private _updateTimelog(updateItem: { dateYYYYMMDD: string, items: DaybookTimelogEntryDataItem[] }) {
        const daysChanged = {
            prevDayChanged: updateItem.dateYYYYMMDD === this.previousDay.dateYYYYMMDD,
            thisDayChanged: updateItem.dateYYYYMMDD === this.thisDay.dateYYYYMMDD,
            nextDayChanged: updateItem.dateYYYYMMDD === this.followingDay.dateYYYYMMDD,
        };
        if(daysChanged.prevDayChanged){
            this._previousDay.timelogEntryDataItems = updateItem.items;
        }else if(daysChanged.thisDayChanged){
            this._thisDay.timelogEntryDataItems = updateItem.items;
        }else if(daysChanged.nextDayChanged){
            this._followingDay.timelogEntryDataItems = updateItem.items;
        }
        // console.log("Next: ", daysChanged);
        this._dataChanged$.next(daysChanged);
    }

}
