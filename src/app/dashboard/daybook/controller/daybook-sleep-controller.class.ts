import { TimeSpanItem } from '../../../shared/utilities/time-utilities/time-span-item.interface';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { TimeUtilities } from '../../../shared/utilities/time-utilities/time-utilities';
import { TimeScheduleOldnComplicated } from '../../../shared/utilities/time-utilities/time-schedule-old-complicated.class';
import { TimeScheduleItem } from '../../../shared/utilities/time-utilities/time-schedule-item.class';
import { SleepEntryItem } from '../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleStatus } from './items/daybook-availability-type.enum';

export class DaybookSleepController {

    private _awakeToAsleepRatio: number;

    private _sleepEntryUpdated$: Subject<{ entryItem: SleepEntryItem, dateYYYYMMDD: string }[]> = new Subject();

    private _prevDaySleepItem: SleepEntryItem;
    private _thisDaySleepItem: SleepEntryItem;
    private _nextDaySleepItem: SleepEntryItem;

    private _clock: moment.Moment;
    private _dateYYYYMMDD: string;

    private get dayIsToday(): boolean { return this._clock.format('YYYY-MM-DD') === this._dateYYYYMMDD; }

    constructor(dateYYYYMMDD: string, prevDaySleepItem: DaybookSleepInputDataItem,
        thisDaySleepItem: DaybookSleepInputDataItem, nextDaySleepItem: DaybookSleepInputDataItem,
        clock: moment.Moment, allSleepInputItems: DaybookSleepInputDataItem[]) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._clock = moment(clock);
        this._awakeToAsleepRatio = this._calculateRatio(allSleepInputItems)
        this._buildSleepController(prevDaySleepItem, thisDaySleepItem, nextDaySleepItem);
        // console.log("***Building Sleep Controller: " + dateYYYYMMDD)
        // // console.log(" " + this.prevDayWakeupTime.format('YYYY-MM-DD hh:mm a') + " - prevDayWakeupTime")
        // // console.log(" " + this.prevDayFallAsleepTime.format('YYYY-MM-DD hh:mm a') + " - prevDayFallAsleepTime")
        // console.log("   " + this.thisDayWakeupTime.format('YYYY-MM-DD hh:mm a') + " - thisDayWakeupTime")
        // console.log("   " + this.thisDayFallAsleepTime.format('YYYY-MM-DD hh:mm a') + " - thisDayFallAsleepTime")
        // // console.log(" " + this.nextDayWakeupTime.format('YYYY-MM-DD hh:mm a') + " - nextDayWakeupTime")

        if (this.dayIsToday) {
            this._runTests();
        }

    }

    private _runTests() {
        let currentTime = moment(this._clock).startOf('day').subtract(24, 'hours');
        const endTime = moment(currentTime).add(3, 'days');
        while (currentTime.isSameOrBefore(endTime)) {
            const energy = this.getEnergyAtTime(currentTime);
            if (energy >= 0 && energy <= 1) {
                // console.log(energy.toFixed(2) + " - " + currentTime.format('hh:mm a YYYY-MM-DD '))
            } else {
                console.log('Error with energy value: ', energy);
            }
            currentTime = moment(currentTime).add(7, 'minutes');
        }
    }


    public get sleepEntryUpdated$(): Observable<{ entryItem: SleepEntryItem, dateYYYYMMDD: string }[]> { return this._sleepEntryUpdated$.asObservable(); }


    public getDaybookTimeScheduleItems(): TimeScheduleItem<DaybookTimeScheduleStatus>[] {
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
            return new TimeScheduleItem(startTime, endTime, true, DaybookTimeScheduleStatus.SLEEP)
        });
        return items;
    }

    public getEnergyAtTime(timeToCheck: moment.Moment): number {
        /**
         * 2020-03-07
         * as of now, we will just use the linear function which will be mostly accurate.
         * sleeping == energy increasing
         * not sleeping == energy decreasing
         * 
         * eventually we will also need to consider 2 additional cases:
         * -case where user inputs sleep item but was awake at some point while they were supposed to be sleeping (aka insomnia or restlessness)
         * -case where user sleeps/naps during the day when they would normally be awake.
         * currently neither of these cases are considered.  
         */

        if (this.isAsleepAtTime(timeToCheck)) {
            if (this._prevDaySleepItem.timeIsIn(timeToCheck)) {
                return this._prevDaySleepItem.getEnergyAtTime(timeToCheck);
            } else if (this._thisDaySleepItem.timeIsIn(timeToCheck)) {
                return this._thisDaySleepItem.getEnergyAtTime(timeToCheck);
            } else if (this._nextDaySleepItem.timeIsIn(timeToCheck)) {
                return this._nextDaySleepItem.getEnergyAtTime(timeToCheck);
            } else {
                console.log('Error with time to check: ' + timeToCheck.format('YYYY-MM-DD hh:mm a'));
            }
        } else if (this.isAwakeAtTime(timeToCheck)) {
            let startEnergy: number, endEnergy: number;
            let startTime: moment.Moment, endTime: moment.Moment;
            if (timeToCheck.isAfter(this.prevDayWakeupTime) && timeToCheck.isBefore(this.prevDayFallAsleepTime)) {

                startTime = moment(this.prevDayWakeupTime);
                endTime = moment(this.prevDayFallAsleepTime);
                startEnergy = this._prevDaySleepItem.energyAtEnd;
                endEnergy = this._thisDaySleepItem.energyAtStart;
            } else if (timeToCheck.isAfter(this.thisDayWakeupTime) && timeToCheck.isBefore(this.thisDayFallAsleepTime)) {
                startTime = moment(this.thisDayWakeupTime);
                endTime = moment(this.thisDayFallAsleepTime);
                startEnergy = this._thisDaySleepItem.energyAtEnd;
                endEnergy = this._nextDaySleepItem.energyAtStart;
            } else if (timeToCheck.isAfter(this.nextDayWakeupTime) && timeToCheck.isBefore(this.nextDayFallAsleepTime)) {
                startTime = moment(this.nextDayWakeupTime);
                endTime = moment(this.nextDayFallAsleepTime);
                startEnergy = this._nextDaySleepItem.energyAtEnd;
                endEnergy = 0;
            } else {
                return 0;
            }
            return this._calculateEnergy(startTime, endTime, startEnergy, endEnergy, timeToCheck);
        } else {
            console.log('Error with time to check: ' + timeToCheck.format('YYYY-MM-DD hh:mm a'));
        }

        return 0;
    }

    private _calculateEnergy(startTime: moment.Moment, endTime: moment.Moment, startEnergy: number, endEnergy: number, timeToCheck: moment.Moment): number {
        // console.log(startEnergy +": energy at start - " + startTime.format('YYYY-MM-DD hh:mm a'))
        // console.log(endEnergy + ": energy at end - " + endTime.format('YYYY-MM-DD hh:mm a'));
        const diffHours = moment(timeToCheck).diff(startTime, 'milliseconds') / (1000 * 60 * 60);
        const totalHours = moment(endTime).diff(startTime, 'milliseconds') / (1000 * 60 * 60);
        const energyRateOfChange = (endEnergy - startEnergy) / totalHours;
        const currentEnergy = startEnergy + (diffHours * energyRateOfChange);
        // console.log("Returning calculated energy: " + currentEnergy);
        return currentEnergy;
    }

    private _buildSleepController(prevDaySleepItem: DaybookSleepInputDataItem, thisDaySleepItem: DaybookSleepInputDataItem, nextDaySleepItem: DaybookSleepInputDataItem) {
        let prevDaySleepEntry: SleepEntryItem, thisDaySleepEntry: SleepEntryItem, nextDaySleepEntry: SleepEntryItem;
        if (thisDaySleepItem.endSleepTimeISO || thisDaySleepItem.startSleepTimeISO) {
            let startTime: moment.Moment, endTime: moment.Moment;
            if (thisDaySleepItem.endSleepTimeISO) {
                endTime = moment(thisDaySleepItem.endSleepTimeISO);
            } else {
                endTime = moment(thisDaySleepItem.startSleepTimeISO).add(this.ratioAsleepHoursPerDay, 'hours');
            }
            if (thisDaySleepItem.startSleepTimeISO) {
                startTime = moment(thisDaySleepItem.startSleepTimeISO);
            } else {
                startTime = moment(endTime).subtract(this.ratioAsleepHoursPerDay, 'hours');
            }
            thisDaySleepEntry = new SleepEntryItem(startTime, endTime, thisDaySleepItem);
        }
        if (prevDaySleepItem.endSleepTimeISO || prevDaySleepItem.startSleepTimeISO) {
            let startTime: moment.Moment, endTime: moment.Moment;
            if (prevDaySleepItem.endSleepTimeISO) {
                endTime = moment(prevDaySleepItem.endSleepTimeISO);
            } else {
                endTime = moment(prevDaySleepItem.startSleepTimeISO).add(this.ratioAsleepHoursPerDay, 'hours');
            }
            if (prevDaySleepItem.startSleepTimeISO) {
                startTime = moment(prevDaySleepItem.startSleepTimeISO);
            } else {
                startTime = moment(endTime).subtract(this.ratioAsleepHoursPerDay, 'hours');
            }
            prevDaySleepEntry = new SleepEntryItem(startTime, endTime, prevDaySleepItem);
        }
        if (nextDaySleepItem.endSleepTimeISO || nextDaySleepItem.startSleepTimeISO) {
            let startTime: moment.Moment, endTime: moment.Moment;
            if (nextDaySleepItem.endSleepTimeISO) {
                endTime = moment(nextDaySleepItem.endSleepTimeISO);
            } else {
                endTime = moment(nextDaySleepItem.startSleepTimeISO).add(this.ratioAsleepHoursPerDay, 'hours');
            }
            if (nextDaySleepItem.startSleepTimeISO) {
                startTime = moment(nextDaySleepItem.startSleepTimeISO);
            } else {
                startTime = moment(endTime).subtract(this.ratioAsleepHoursPerDay, 'hours');
            }
            nextDaySleepEntry = new SleepEntryItem(startTime, endTime, nextDaySleepItem);
        }
        if (!thisDaySleepEntry) {
            if (prevDaySleepEntry) {
                const start = moment(prevDaySleepEntry.startTime).add(24, 'hours');
                const end = moment(prevDaySleepEntry.endTime).add(24, 'hours');
                thisDaySleepEntry = new SleepEntryItem(start, end)
            } else if (nextDaySleepEntry) {
                const start = moment(nextDaySleepEntry.startTime).subtract(24, 'hours');
                const end = moment(nextDaySleepEntry.endTime).subtract(24, 'hours');
                thisDaySleepEntry = new SleepEntryItem(start, end)
            } else {
                thisDaySleepEntry = this._buildDefaultSleepEntry();
            }
        }
        // console.log("This day entry: " + thisDaySleepEntry.startTime.format('YYYY-MM-DD hh:mm a') + " to " + thisDaySleepEntry.endTime.format('YYYY-MM-DD hh:mm a'))
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

    private _calculateRatio(allSleepInputItems: DaybookSleepInputDataItem[]): number {
        const sleepEntryItems: SleepEntryItem[] = [];
        allSleepInputItems.forEach((item) => {
            if (item.startSleepTimeISO && item.endSleepTimeISO) {
                const startTime = moment(item.startSleepTimeISO);
                const endTime = moment(item.endSleepTimeISO);
                const date = moment(endTime).format('YYYY-MM-DD');
                sleepEntryItems.push(new SleepEntryItem(startTime, endTime, item));
            }
        });
        let ratio: number = 2;
        if (sleepEntryItems.length > 0) {
            let ratioVals: number[] = [];
            let sum = 0;
            if (sleepEntryItems.length < 3) {
                const diff = 3 - sleepEntryItems.length;
                for (let i = 0; i < diff; i++) {
                    ratioVals.push(2);
                }
                sleepEntryItems.forEach(item => ratioVals.push(item.getAwakeToAsleepRatio()));
                ratioVals.forEach(item => sum += item);
                ratio = sum / ratioVals.length;
            } else if (sleepEntryItems.length >= 3) {
                sleepEntryItems.forEach(item => ratioVals.push(item.getAwakeToAsleepRatio()));
                ratioVals.forEach(item => sum += item);
                ratio = sum / ratioVals.length;
            }
        }
        return ratio;
    }

    private _buildDefaultSleepEntry(): SleepEntryItem {
        let wakeupTime = moment(this.dateYYYYMMDD).startOf('day').add(7, 'hours').add(30, 'minutes');
        const startTime = moment(wakeupTime).subtract(this.ratioAsleepHoursPerDay, 'hours');
        const defaultEntry = new SleepEntryItem(startTime, wakeupTime);
        return defaultEntry;
    }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
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

    public get wakeupTimeIsSet(): boolean { return this._thisDaySleepItem.endTimeIsSaved; }
    public get fallAsleepTimeIsSet(): boolean { return this._nextDaySleepItem.startTimeIsSaved; }

    public get ratioAwakeHoursPerDay(): number { return (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1); }
    public get ratioAsleepHoursPerDay(): number { return 24 - this.ratioAwakeHoursPerDay; }
    public get awakeToAsleepRatio(): number { return this._awakeToAsleepRatio; }

    public get prevDayWakeupTime(): moment.Moment { return this._prevDaySleepItem.endTime; }
    public get prevDayFallAsleepTime(): moment.Moment { return this._thisDaySleepItem.startTime; }

    public get thisDayWakeupTime(): moment.Moment { return this._thisDaySleepItem.endTime; }
    public get thisDayFallAsleepTime(): moment.Moment { return this._nextDaySleepItem.startTime; }

    public get nextDayWakeupTime(): moment.Moment { return this._nextDaySleepItem.endTime; }
    public get nextDayFallAsleepTime(): moment.Moment { return moment(this._nextDaySleepItem.endTime).add(this.ratioAwakeHoursPerDay, 'hours'); }

    public isAwakeAtTime(timeToCheck: moment.Moment): boolean {
        return !this.isAsleepAtTime(timeToCheck);
    }
    public isAsleepAtTime(timeToCheck: moment.Moment): boolean {
        return this._prevDaySleepItem.timeIsIn(timeToCheck) || this._thisDaySleepItem.timeIsIn(timeToCheck) || this._nextDaySleepItem.timeIsIn(timeToCheck);
    }



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
        console.log("Setting wakeup time: " + wakeupTime.format("YYYY-MM-DD hh:mm a"))
        this._thisDaySleepItem.setEndTime(wakeupTime, this.ratioAsleepHoursPerDay);
        const fallAsleepTime = moment(wakeupTime).add(this.ratioAwakeHoursPerDay, 'hours');

        const updateItems: { entryItem: SleepEntryItem, dateYYYYMMDD: string }[] = [];
        updateItems.push({
            entryItem: this._thisDaySleepItem,
            dateYYYYMMDD: this.dateYYYYMMDD,
        });
        if (this.dayIsToday) {
            if (!this._nextDaySleepItem.startTimeIsSaved) {
                this._nextDaySleepItem.setStartTime(fallAsleepTime, this.ratioAsleepHoursPerDay);
                const tomorrowItem = {
                    entryItem: this._nextDaySleepItem,
                    dateYYYYMMDD: this.nextDateYYYYMMDD,
                };
                updateItems.push(tomorrowItem);
            }


        }
        console.log("Setting fallasleep time as: " + fallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        console.log("THIS SLEEP ITEM : " + this._thisDaySleepItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._thisDaySleepItem.endTime.format('YYYY-MM-DD hh:mm a'))
        this._sleepEntryUpdated$.next(updateItems);
    }

    public setFallAsleepTime(fallAsleepTime: moment.Moment) {
        console.log("Setting fallAsleepTime: " + fallAsleepTime.format("YYYY-MM-DD hh:mm a"))
        this._nextDaySleepItem.setStartTime(fallAsleepTime, this.ratioAsleepHoursPerDay, true);
        this._sleepEntryUpdated$.next([{
            entryItem: this._nextDaySleepItem,
            dateYYYYMMDD: moment(this.dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'),
        }]);
    }



}
