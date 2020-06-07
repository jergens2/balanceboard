import * as moment from 'moment';

import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryController } from './daybook-timelog-entry-controller.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookTimeDelineatorController } from './daybook-time-delineator-controller.class';

import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';


/** 
 *  The DaybookController class is a superclass to contain and control the DaybookDayItem class objects.
 *  
 *  Specifically, the contoller contains 3 DaybookDayItem objects:  previousDay, thisDay, nextDay.
 *  With this controller we can execute CRUD operations for things such as TimelogEntryItems and other DaybookDayItem input values.
 */
export class DaybookController {

    constructor(thisDayYYYYMMDD: string, daybookDayItems: DaybookDayItem[], startTime: moment.Moment, endTime: moment.Moment, clock: moment.Moment) {
        // console.log("*Constructing Daybook Controller")
        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._thisDayYYYYMMDD = thisDayYYYYMMDD;
        this._clock = clock;
        this._reload(daybookDayItems);
    }

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    private _clock: moment.Moment;
    private _previousDay: DaybookDayItem;
    private _thisDay: DaybookDayItem;
    private _followingDay: DaybookDayItem;

    private _thisDayYYYYMMDD: string;

    // private _sleepController: DaybookSleepController;
    private _timelogEntryController: DaybookTimelogEntryController;
    // private _energyController: DaybookEnergyController;
    private _timeDelineatorController: DaybookTimeDelineatorController;

    private _dataChanged$: Subject<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> = new Subject();
    private _subscriptions: Subscription[] = [];

    private get timelogEntryController(): DaybookTimelogEntryController { return this._timelogEntryController; }
    // private get sleepController(): DaybookSleepController { return this._sleepController; }
    // private get energyController(): DaybookEnergyController { return this._energyController; }
    private get timeDelineatorController(): DaybookTimeDelineatorController { return this._timeDelineatorController; }


    public reload(dayItems: DaybookDayItem[]) {
        this._reload(dayItems);
    }

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }

    public get clock(): moment.Moment { return this._clock; }
    public get dateYYYYMMDD(): string { return this._thisDayYYYYMMDD; }
    public get isToday(): boolean { return this._thisDay.dateYYYYMMDD === this.clock.format('YYYY-MM-DD'); }
    public get isAfterToday(): boolean { return this._thisDay.dateYYYYMMDD > this.clock.format('YYYY-MM-DD'); }
    public get isBeforeToday(): boolean { return this._thisDay.dateYYYYMMDD < this.clock.format('YYYY-MM-DD'); }
    public get controllerStartTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').subtract(1, 'days'); }
    public get controllerEndTime(): moment.Moment { return moment(this._thisDay.dateYYYYMMDD).startOf('day').add(2, 'days'); }

    public get previousDay(): DaybookDayItem { return this._previousDay; }
    public get thisDay(): DaybookDayItem { return this._thisDay; }
    public get followingDay(): DaybookDayItem { return this._followingDay; }
    public get dayItems(): DaybookDayItem[] { return [this.previousDay, this.thisDay, this.followingDay]; }

    public get startOfPrevDay(): moment.Moment { return moment(this.previousDay.dateYYYYMMDD).startOf('day'); }
    public get startOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day'); }
    public get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    public get endOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    public get endOfNextDay(): moment.Moment { return moment(this.followingDay.dateYYYYMMDD).startOf('day').add(1, 'days'); };

    public get dailyWeightLogEntryKg(): number { return this._thisDay.dailyWeightLogEntryKg; }



    // public get batteryLevel(): number { return this._batteryLevel; }

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

    public getSleepDataItems(): DaybookSleepInputDataItem[] {
        const allSleepItems = [
            ...this._previousDay.sleepInputItems,
            ...this._thisDay.sleepInputItems,
            ...this._followingDay.sleepInputItems,
        ];
        return allSleepItems;
    }
    public getTimelogEntryItem(gridItemStart: moment.Moment, gridItemEnd: moment.Moment): TimelogEntryItem {
        return this.timelogEntryController.getTimelogEntryItem(gridItemStart, gridItemEnd);
    }


    public getLastActivityEndTime(): moment.Moment {
        /*
        this method assumes that the timelogEntryItems array are all saved items for past events.  this is an unhandled situation.
        */
        const now = moment();
        let lastTime: moment.Moment;
        if (this.timelogEntryItems.length > 0) {
            for (let i = 0; i < this.timelogEntryItems.length; i++) {
                const startIsBefore = this.timelogEntryItems[i].startTime.isBefore(now);
                const endIsBefore = this.timelogEntryItems[i].endTime.isBefore(now);
                if (startIsBefore && endIsBefore) {
                    if (this.timelogEntryItems[i].endTime.isAfter(lastTime)) {
                        lastTime = moment(this.timelogEntryItems[i].endTime);
                    }
                }
            }
        }
        return lastTime;
    }


    public setSleepEntryItems(prevDayItems: DaybookSleepInputDataItem[], thisDayItems: DaybookSleepInputDataItem[]) {
        this._previousDay.sleepInputItems = prevDayItems;
        this._thisDay.sleepInputItems = thisDayItems;
        // this._dataChanged$.next({ prevDayChanged: true, thisDayChanged: true, nextDayChanged: false});
    }



    public get timelogEntryItems(): TimelogEntryItem[] { return this.timelogEntryController.timelogEntryItems; }
    public saveTimelogEntryItem(saveTimelogEntry: TimelogEntryItem) {
        return this.timelogEntryController.saveTimelogEntryItem(this.dateYYYYMMDD, saveTimelogEntry);
    }
    public updateTimelogEntryItem$(updateTimelogEntry: TimelogEntryItem) {
        return this.timelogEntryController.updateTimelogEntryItem(this.dateYYYYMMDD, updateTimelogEntry);
    }
    public deleteTimelogEntryItem$(deleteItem: TimelogEntryItem) {
        return this.timelogEntryController.deleteTimelogEntryItem(this.dateYYYYMMDD, deleteItem);
    }

    // public isTimeAvailable(timeToCheck: moment.Moment): boolean {
    //     return this._schedule.isAvailableAtTime(timeToCheck);
    // }
    // public isRangeAvailable(startTime: moment.Moment, endTime: moment.Moment): boolean {
    //     const isAvailable = this._schedule.isRangeAvailable(startTime, endTime);
    //     console.log("isRangeAvailable? " + startTime.format('hh:mm a') + " - " + endTime.format('hh:mm a'), isAvailable)
    //     return isAvailable;
    // }

    public get dataChanged$(): Observable<{ prevDayChanged: boolean, thisDayChanged: boolean, nextDayChanged: boolean }> {
        return this._dataChanged$.asObservable();
    }

    private _reload(dayItems: DaybookDayItem[]) {
        // this._dayItems = dayItems;
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
        this._buildController();
        // this.logFullScheduleItems();
    }

    private _buildController() {

        const allTimeDelineations = [
            ...this._previousDay.timeDelineators,
            ...this._thisDay.timeDelineators,
            ...this._followingDay.timeDelineators,
        ];
        const allSleepItems = [
            ...this._previousDay.sleepInputItems,
            ...this._thisDay.sleepInputItems,
            ...this._followingDay.sleepInputItems,
        ];
        const allTimelogEntryItems = [
            ...this._previousDay.timelogEntryDataItems,
            ...this._thisDay.timelogEntryDataItems,
            ...this._followingDay.timelogEntryDataItems,
        ]

        const relevantTimelogItems = {
            prevItems: this._previousDay.timelogEntryDataItems,
            thisItems: this._thisDay.timelogEntryDataItems,
            nextItems: this._followingDay.timelogEntryDataItems,
        }
        this._timeDelineatorController = new DaybookTimeDelineatorController(this.dateYYYYMMDD, allTimeDelineations);
        this._timelogEntryController = new DaybookTimelogEntryController(this.dateYYYYMMDD, relevantTimelogItems);



        this._updateSubscriptions();
    }



    private _updateSubscriptions() {
        this._subscriptions.forEach(s => s.unsubscribe());
        this._subscriptions = [];
        const timelogSub = this.timelogEntryController.timelogUpdated$.subscribe((update) => {
            this._updateTimelog(update);
        });

        const delineatorSub = this.timeDelineatorController.saveChanges$.subscribe((delineators: moment.Moment[]) => {
            this._updateTimeDelineators(delineators);
        })
        this._subscriptions = [timelogSub, delineatorSub];
    }

    private _updateTimeDelineators(delineators: moment.Moment[]) {
        this._thisDay.timeDelineators = delineators;
        this._dataChanged$.next({
            prevDayChanged: false,
            thisDayChanged: true,
            nextDayChanged: false,
        });
    }

    private _updateTimelog(updateItem: { dateYYYYMMDD: string, items: DaybookTimelogEntryDataItem[] }) {
        const daysChanged = {
            prevDayChanged: updateItem.dateYYYYMMDD === this.previousDay.dateYYYYMMDD,
            thisDayChanged: updateItem.dateYYYYMMDD === this.thisDay.dateYYYYMMDD,
            nextDayChanged: updateItem.dateYYYYMMDD === this.followingDay.dateYYYYMMDD,
        };
        if (daysChanged.prevDayChanged) {
            this._previousDay.timelogEntryDataItems = updateItem.items;
        } else if (daysChanged.thisDayChanged) {
            this._thisDay.timelogEntryDataItems = updateItem.items;
        } else if (daysChanged.nextDayChanged) {
            this._followingDay.timelogEntryDataItems = updateItem.items;
        }
        // console.log("Next: ", daysChanged);
        this._dataChanged$.next(daysChanged);
    }

}
