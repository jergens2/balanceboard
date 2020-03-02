import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { TimeUtilities } from '../../../shared/utilities/time-utilities/time-utilities';
import { TimeSchedule } from '../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookAvailabilityType } from './items/daybook-availability-type.enum';

export class DaybookSleepController {

    private _awakeToAsleepRatio: number = 2

    private _sleepTimesUpdated$: Subject<DaybookSleepInputDataItem[]> = new Subject();

    private _sleepEntryItems: SleepEntryItem[] = [];

    private _prevDaySleepItem: SleepEntryItem;
    private _thisDaySleepItem: SleepEntryItem;
    private _nextDaySleepItem: SleepEntryItem;

    private _clock: moment.Moment;

    constructor(prevDaySleepItem: DaybookSleepInputDataItem, thisDaySleepItem: DaybookSleepInputDataItem, nextDaySleepItem: DaybookSleepInputDataItem, clock: moment.Moment) {
        // console.log("BUILDING CONTORLLER:")
        // console.log("PREV DAY: ", prevDaySleepItem)
        // console.log("THIS DAY: ", thisDaySleepItem)
        // console.log("NEXT DAY: ", nextDaySleepItem)
        this._buildSleepController(prevDaySleepItem, thisDaySleepItem, nextDaySleepItem);
        this._clock = moment(clock);
    }

    public getDaybookTimeScheduleItems(): TimeScheduleItem<DaybookAvailabilityType>[] {
        const sleepItems: SleepEntryItem[] = [
            this._prevDaySleepItem,
            this._thisDaySleepItem,
            this._nextDaySleepItem,
        ];
        const items = sleepItems.map(item => {
            let startTime = item.startTime;
            if (startTime.isBefore(this.startOfPrevDay)) {
                startTime = moment(this.startOfPrevDay);
            }
            let endTime = item.endTime;
            if (endTime.isAfter(this.endOfNextDay)) {
                endTime = moment(this.endOfNextDay);
            }
            return new TimeScheduleItem(startTime, endTime, true, DaybookAvailabilityType.SLEEP)
        });
        console.log("ITEMS: ", items)
        return items;
    }

    private _buildSleepController(prevDaySleepItem: DaybookSleepInputDataItem, thisDaySleepItem: DaybookSleepInputDataItem, nextDaySleepItem: DaybookSleepInputDataItem) {
        let prevDaySleepEntry: SleepEntryItem, thisDaySleepEntry: SleepEntryItem, nextDaySleepEntry: SleepEntryItem;
        if (thisDaySleepItem.endSleepTimeISO) {
            const endTime = moment(thisDaySleepItem.endSleepTimeISO);
            let startTime: moment.Moment = endTime.subtract(this.ratioAsleepHoursPerDay, 'hours');
            if (thisDaySleepItem.startSleepTimeISO) {
                startTime = moment(thisDaySleepItem.startSleepTimeISO);
            } 
            thisDaySleepEntry = new SleepEntryItem(startTime, endTime, thisDaySleepItem);
        }
        if (prevDaySleepItem.endSleepTimeISO) {
            const endTime = moment(prevDaySleepItem.endSleepTimeISO);
            let startTime: moment.Moment = endTime.subtract(this.ratioAsleepHoursPerDay, 'hours');
            if (prevDaySleepItem.startSleepTimeISO) {
                startTime = moment(prevDaySleepItem.startSleepTimeISO);
            } 
            prevDaySleepEntry = new SleepEntryItem(startTime, endTime, prevDaySleepItem);
        }
        if (nextDaySleepItem.endSleepTimeISO) {
            const endTime = moment(nextDaySleepItem.endSleepTimeISO);
            let startTime: moment.Moment = endTime.subtract(this.ratioAsleepHoursPerDay, 'hours');
            if (nextDaySleepItem.startSleepTimeISO) {
                startTime = moment(nextDaySleepItem.startSleepTimeISO);
            } 
            nextDaySleepEntry = new SleepEntryItem(startTime, endTime, nextDaySleepItem);
        }
        if (!thisDaySleepEntry) {
            if (prevDaySleepEntry) {
                const start = (prevDaySleepEntry.startTime).add(24, 'hours');
                const end = (prevDaySleepEntry.endTime).add(24, 'hours');
                thisDaySleepEntry = new SleepEntryItem(start, end)
            } else if (nextDaySleepEntry) {
                const start = (nextDaySleepEntry.startTime).subtract(24, 'hours');
                const end = (nextDaySleepEntry.endTime).subtract(24, 'hours');
                thisDaySleepEntry = new SleepEntryItem(start, end)
            } else {
                thisDaySleepEntry = this._buildDefaultSleepEntry();
            }
        }
        if (!prevDaySleepEntry) {
            const start = moment(thisDaySleepEntry.startTime).subtract(24, 'hours');
            const end = moment(thisDaySleepEntry.endTime).subtract(24, 'hours');
            prevDaySleepEntry = new SleepEntryItem(start, end)
        }
        if (!nextDaySleepEntry) {
            const start = moment(thisDaySleepEntry.startTime).add(24, 'hours');
            const end = moment(thisDaySleepEntry.endTime).add(24, 'hours');
            nextDaySleepEntry = new SleepEntryItem(start, end)
        }

        this._prevDaySleepItem = prevDaySleepEntry;
        this._thisDaySleepItem = thisDaySleepEntry;
        this._nextDaySleepItem = nextDaySleepEntry;

        // console.log("Setting items:", this._prevDaySleepItem, this._thisDaySleepItem, this._nextDaySleepItem)
    }

    private _buildDefaultSleepEntry(): SleepEntryItem {
        const wakeupTime = moment(this._clock).startOf('day').add(7, 'hours').add(30, 'minutes');
        const startTime = moment(wakeupTime).subtract(this.ratioAsleepHoursPerDay, 'hours');
        const defaultEntry = new SleepEntryItem(startTime, wakeupTime);
        return defaultEntry;
    }

    public get dateYYYYMMDD(): string { return this._clock.format('YYYY-MM-DD'); }
    private get prevDateYYYYMMDD(): string { return moment(this.dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this.dateYYYYMMDD).format('YYYY-MM-DD'); }
    private get nextDateYYYYMMDD(): string { return moment(this.dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }


    private get startOfPrevDay(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    private get startOfThisDay(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day'); }
    private get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    private get endOfThisDay(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    private get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    private get endOfNextDay(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(1, 'days'); };


    public get sleepEntryItems(): SleepEntryItem[] {
        return [
            this._prevDaySleepItem,
            this._thisDaySleepItem,
            this._nextDaySleepItem,
        ];
    }

    public get wakeupTimeIsSet(): boolean { return this._thisDaySleepItem.endTimeIsSaved }

    public get ratioAwakeHoursPerDay(): number { return (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1); }
    public get ratioAsleepHoursPerDay(): number { return 24 - this.ratioAwakeHoursPerDay; }
    public get awakeToAsleepRatio(): number { return this._awakeToAsleepRatio; }

    public get prevDayWakeupTime(): moment.Moment { return this._prevDaySleepItem.endTime; }
    public get prevDayFallAsleepTime(): moment.Moment { return this._thisDaySleepItem.startTime; }

    public get thisDayWakeupTime(): moment.Moment { return this._thisDaySleepItem.endTime; }
    public get thisDayFallAsleepTime(): moment.Moment { return this._nextDaySleepItem.startTime; }

    public get nextDayWakeupTime(): moment.Moment { return this._nextDaySleepItem.endTime; }


    public isAwakeAtTime(timeToCheck: moment.Moment): boolean {
        return !this.isAsleepAtTime(timeToCheck);
    }
    public isAsleepAtTime(timeToCheck: moment.Moment): boolean {
        return this._prevDaySleepItem.timeIsIn(timeToCheck) || this._thisDaySleepItem.timeIsIn(timeToCheck) || this._nextDaySleepItem.timeIsIn(timeToCheck);
    }


    public get sleepTimesUpdated$(): Observable<DaybookSleepInputDataItem[]> { return this._sleepTimesUpdated$.asObservable(); }

    public getSleepItem(gridItemStart, gridItemEnd): SleepEntryItem {
        const foundItem = this.sleepEntryItems.find((item) => {
            const startsAfterStart = gridItemStart.isSameOrAfter(item.startTime);
            const startsBeforeEnd = gridItemStart.isSameOrBefore(item.endTime);
            const endsAfterStart = gridItemEnd.isSameOrAfter(item.startTime);
            const endsBeforeEnd = gridItemEnd.isSameOrBefore(item.endTime);
            return startsAfterStart && startsBeforeEnd && endsAfterStart && endsBeforeEnd;
        });
        if (foundItem) {
            return foundItem;
        } else {
            console.log('Error: could not find sleep item from grid item.');
            return null;
        }

    }

    // public getSleepItemAtTime(startTime: moment.Moment): SleepEntryItem {
    //     const foundItem = this.sleepEntryItems.find(item => startTime.isSameOrAfter(item.startTime) && startTime.isSameOrBefore(item.endTime));
    //     if (foundItem) {
    //         return foundItem;
    //     } else {
    //         console.log('Error: could not find item.')
    //         return null;
    //     }
    // }


    public setWakeupTime(wakeupTime: moment.Moment) {
        console.log("Method incomplete");
    }

    public setFallAsleepTime(fallAsleepTime: moment.Moment) {
        console.log("Method incomplete");
    }



}
