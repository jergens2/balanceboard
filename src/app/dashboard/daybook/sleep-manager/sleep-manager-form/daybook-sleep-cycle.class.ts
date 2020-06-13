import * as moment from 'moment';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookTimeScheduleStatus } from '../../api/controllers/daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from '../../api/controllers/daybook-time-schedule-item.class';
import { DaybookSleepInputDataItem } from '../../api/data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeSchedule } from '../../api/controllers/daybook-time-schedule.class';

export class DaybookSleepCycle {

    private _relevantItems: DaybookDayItem[] = [];
    /**
     * The purpose of this class is to be able to try and determine a sleep pattern based on previous sleep items.
     */
    constructor(relevantItems: DaybookDayItem[]) {
        this._relevantItems = relevantItems;
    }

    // public get yesterdayStartTime(): moment.Moment { 
    //     const yesterDate: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
    //     // const yesterdayItem: DaybookDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === yesterDate);
    //     // let yesterdayStartTime: moment.Moment;
    //     // if(yesterdayItem){
    //     //     yesterdayStartTime = this._dayItemWakeupTime(yesterdayItem);
    //     // }else{
    //     //     yesterdayStartTime = this._defaultWakeupTime(yesterDate);
    //     // }
    //     // console.log("yesterday startt time: " + yesterdayStartTime.format("YYYY-MM-DD hh:mm a"))
    //     // return yesterdayStartTime;
    // }

    public getYesterdayStartTime(previousFallAsleepTime): moment.Moment {
        const yesterDate: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
        const yesterdayItem: DaybookDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === yesterDate);
        const startOfYesterday = moment().startOf('day').subtract(24, 'hours');
        let startTime: moment.Moment;
        if (yesterdayItem) {
            const startOfDay = moment(yesterDate).startOf('day');
            const endTime = moment(yesterDate).startOf('day').add(24, 'hours');
            const schedule = new DaybookTimeSchedule(yesterDate, startOfDay, endTime, yesterdayItem.timelogEntryDataItems, yesterdayItem.sleepInputItems, []);
            const yesterdayItems = schedule.timeScheduleItems;
            const sleepCycle = this._buildSleepCycle(yesterdayItems);
            const wakeItems = this._getThisDayWakeItems(yesterDate, sleepCycle);
            const largestWakeItem = this._findLargestWakeItem(wakeItems, yesterDate);
            startTime = moment(largestWakeItem.startTime);
        } else {
            const averageSleepMs = this.averageSleepDurationMs;
            const endTime = moment(previousFallAsleepTime);
            const msPerDay = 1000 * 60 * 60 * 24;
            const awakeMsPerDay = msPerDay - averageSleepMs;
            startTime =  moment(endTime).subtract(awakeMsPerDay);
        }
        // console.log("YEsterday start time is: " + startTime.format('YYYY-MM-DD hh:mm a'))
        return startTime;
    }
    public get yesterdayItems(): DaybookSleepInputDataItem[] {
        const yesterDate: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
        // const yesterdayItem: DaybookDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === yesterDate);
        return this.getItemsForDate(yesterDate).map((item) => { return item.exportToSleepDataItem() });
    }

    public get averageSleepDurationMs(): number {
        const averageRatio = this._calculateSleepAverage();
        const msPerDay = 1000 * 60 * 60 * 24;
        return averageRatio * msPerDay;
    }

    public getDayStartTime(dateYYYYMMDD: string): moment.Moment {
        const thisDayItems = this._getDayCycleAllItems(dateYYYYMMDD);
        const sleepCycle = this._buildSleepCycle(thisDayItems);
        const wakeItems = this._getThisDayWakeItems(dateYYYYMMDD, sleepCycle);
        const largestWakeItem = this._findLargestWakeItem(wakeItems, dateYYYYMMDD);
        // console.log("largest wake item is ", largestWakeItem)
        // console.log("Start of " + dateYYYYMMDD + " is " + largestWakeItem.startTime.format('YYYY-MM-DD hh:mm a')) 
        return largestWakeItem.startTime;
    }
    public getDayEndTime(dateYYYYMMDD: string): moment.Moment {
        const thisDayItems = this._getDayCycleAllItems(dateYYYYMMDD);
        const sleepCycle = this._buildSleepCycle(thisDayItems);
        const wakeItems = this._getThisDayWakeItems(dateYYYYMMDD, sleepCycle);
        const largestWakeItem = this._findLargestWakeItem(wakeItems, dateYYYYMMDD);
        return largestWakeItem.endTime;
    }

    public getSleepDataItems(dateYYYYMMDD: string): DaybookSleepInputDataItem[] {
        // console.log("Getting items for date: ", dateYYYYMMDD)
        const thisDayItems = this._getDayCycleAllItems(dateYYYYMMDD);
        return thisDayItems.filter(item => item.status === DaybookTimeScheduleStatus.SLEEP)
            .map(item => item.exportToSleepDataItem());
    }

    private _buildSleepCycle(items: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        let mergedItems: DaybookTimeScheduleItem[] = [];
        let currentItem = items[0];
        let currentStatus = currentItem.status;
        const statusSleep = DaybookTimeScheduleStatus.SLEEP;
        const statusActive = DaybookTimeScheduleStatus.ACTIVE;
        if (currentStatus !== statusSleep) {
            currentStatus === statusActive;
        }
        for (let i = 1; i < items.length; i++) {
            const itemStatus = items[i].status === statusSleep ? statusSleep : statusActive;
            if (itemStatus === currentStatus) {
                currentItem.endTime = items[i].endTime;
            } else {
                mergedItems.push(currentItem);
                currentItem = items[i];
                currentStatus = currentItem.status
            }
        }
        mergedItems.push(currentItem);

        // console.log("  SLEEP CYCLE: ")
        // mergedItems.forEach(item =>{
        //     console.log("  " + item.toString())
        // })
        return mergedItems;
    }

    private _calculateSleepAverage(): number {
        let ratios: number[] = [];
        const defaultRatio = 0.33;
        const relevantItems = this._relevantItems;
        if (relevantItems.length < 7) {
            // console.log("Returning default ratio: 0.33");
            return defaultRatio;
        } else if (relevantItems.length >= 7) {
            ratios = relevantItems.map(item => this._getSleepRatio(item));
        }
        let sum: number = 0;
        ratios.forEach((ratio) => {
            sum += ratio;
        });
        // console.log("returning ratio: " + (sum / ratios.length))
        return (sum / ratios.length);
    }

    /**
     * returns a number >= 0 and <= 1
     */
    private _getSleepRatio(daybookDayItem: DaybookDayItem): number {
        const sleepItems = daybookDayItem.sleepInputItems;
        const dayMs: number = 1000 * 60 * 60 * 24;
        let sleepMs: number = 0;
        sleepItems.forEach((item) => {
            sleepMs += (moment(item.endSleepTimeISO).diff(item.startSleepTimeISO, 'milliseconds'));
        });
        return sleepMs / dayMs;
    }


    private _findLargestWakeItem(thisDayWakeItems: DaybookTimeScheduleItem[], dateYYYYMMDD: string): DaybookTimeScheduleItem {
        const startOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        const endOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        const getMilliseconds = function (wakeItem: DaybookTimeScheduleItem): number {
            const crossesStart = wakeItem.startTime.isBefore(startOfThisDay) && wakeItem.endTime.isSameOrBefore(endOfThisDay);
            const crossesEnd = wakeItem.startTime.isSameOrAfter(startOfThisDay) && wakeItem.endTime.isAfter(endOfThisDay);
            const isInside = wakeItem.startTime.isSameOrAfter(startOfThisDay) && wakeItem.endTime.isSameOrBefore(endOfThisDay);
            const encapsulates = wakeItem.startTime.isSameOrBefore(startOfThisDay) && wakeItem.endTime.isSameOrAfter(endOfThisDay);
            let startTime: moment.Moment;
            let endTime: moment.Moment;
            if (crossesStart) {
                startTime = moment(startOfThisDay);
                endTime = moment(wakeItem.endTime);
            } else if (isInside) {
                startTime = moment(wakeItem.startTime);
                endTime = moment(wakeItem.endTime)
            } else if (crossesEnd) {
                startTime = moment(wakeItem.startTime);
                endTime = moment(endOfThisDay);
            } else if (encapsulates) {
                console.log('Big badaboom.  Bada big boom.');
            }
            return moment(endTime).diff(startTime, 'milliseconds');
        }
        let largestItem = thisDayWakeItems[0];
        let largestMs = getMilliseconds(largestItem);
        for (let i = 1; i < thisDayWakeItems.length; i++) {
            let currentMs = getMilliseconds(thisDayWakeItems[i]);
            if (currentMs > largestMs) {
                largestItem = thisDayWakeItems[i];
            }
        }
        return largestItem;
    }

    private _getThisDayWakeItems(dateYYYYMMDD: string, cycleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        const startOfThisDay: moment.Moment = moment(dateYYYYMMDD).startOf('day');
        const endOfThisDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(24, 'hours');
        const wakeItems = cycleItems.filter(item => item.status !== DaybookTimeScheduleStatus.SLEEP);
        const thisDaywakeItems = wakeItems.filter((wakeItem) => {
            const crossesStart = wakeItem.startTime.isBefore(startOfThisDay) && wakeItem.endTime.isAfter(startOfThisDay);
            const crossesEnd = wakeItem.startTime.isBefore(endOfThisDay) && wakeItem.endTime.isAfter(endOfThisDay);
            const isInside = wakeItem.startTime.isSameOrAfter(startOfThisDay) && wakeItem.endTime.isSameOrBefore(endOfThisDay);
            const encapsulates = wakeItem.startTime.isSameOrBefore(startOfThisDay) && wakeItem.endTime.isSameOrAfter(endOfThisDay);
            return crossesStart || crossesEnd || isInside || encapsulates;
        });
        console.log("THIS DAY WAKE ITEMS: (" + dateYYYYMMDD + " )")
        thisDaywakeItems.forEach((item) => { console.log("   " + item.toString()) })
        return thisDaywakeItems;
    }



    /**
     * 
     * Will build an array of cycle items spanning prev day to next day
     */
    private _getDayCycleAllItems(dateYYYYMMDD: string): DaybookTimeScheduleItem[] {
        const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
        const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        // console.log("Dates: " , prevDateYYYYMMDD, dateYYYYMMDD, nextDateYYYYMMDD);
        let prevDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        let thisDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        let nextDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD);
        if (prevDayItem && thisDayItem && nextDayItem) {
            const timelogItems = [
                ...prevDayItem.timelogEntryDataItems,
                ...thisDayItem.timelogEntryDataItems,
                ...nextDayItem.timelogEntryDataItems,
            ];
            const sleepItems = [
                ...prevDayItem.sleepInputItems,
                ...thisDayItem.sleepInputItems,
                ...nextDayItem.sleepInputItems,
            ];
            const startTime = moment(prevDateYYYYMMDD).startOf('day');
            const endTime = moment(nextDateYYYYMMDD).startOf('day').add(24, 'hours');
            const schedule = new DaybookTimeSchedule(dateYYYYMMDD, startTime, endTime, timelogItems, sleepItems, []);
            return schedule.timeScheduleItems;
        } else {
            return [
                ...this.getItemsForDate(prevDateYYYYMMDD),
                ...this.getItemsForDate(dateYYYYMMDD),
                ...this.getItemsForDate(nextDateYYYYMMDD),
            ];
        }
    }

    public getItemsForDate(dateYYYYMMDD: string): DaybookTimeScheduleItem[] {
        let thisDayItem = this._relevantItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        if (thisDayItem) {
            const startTime = moment(dateYYYYMMDD).startOf('day');
            const endTime = moment(dateYYYYMMDD).startOf('day').add(24, 'hours');
            const schedule = new DaybookTimeSchedule(dateYYYYMMDD, startTime, endTime, thisDayItem.timelogEntryDataItems, thisDayItem.sleepInputItems, []);
            return schedule.timeScheduleItems;
        } else {
            return this._defaultDayCycleItems(dateYYYYMMDD);
        }
    }

    /**
     * 
     * Creates an array of sleep cycle schedule items for a specific 24 hour period
     * based off of default values.
     */
    private _defaultDayCycleItems(dateYYYYMMDD: string): DaybookTimeScheduleItem[] {
        let items: DaybookTimeScheduleItem[] = [];
        // console.log("*** Building default day cycle items for date: " + dateYYYYMMDD)
        const startOfThisDay = moment(dateYYYYMMDD).startOf('day');
        const endOfThisDay = moment(startOfThisDay).add(24, 'hours');
        const dayWakeupTime = this._defaultWakeupTime(dateYYYYMMDD);
        const daySleepTime = this._defaultFallAsleepTime(dateYYYYMMDD);

        // console.log("   wakeup time: " + dayWakeupTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("   sleep time: " + daySleepTime.format('YYYY-MM-DD hh:mm a'))

        const statusActive = DaybookTimeScheduleStatus.ACTIVE;
        const statusSleep = DaybookTimeScheduleStatus.SLEEP;
        if (dayWakeupTime.isAfter(startOfThisDay) && dayWakeupTime.isBefore(endOfThisDay)) {
            if (daySleepTime.isAfter(dayWakeupTime)) {
                if (daySleepTime.isAfter(endOfThisDay)) {
                    items = [
                        new DaybookTimeScheduleItem(statusActive, startOfThisDay, moment(daySleepTime).subtract(24, 'hours')),
                        new DaybookTimeScheduleItem(statusSleep, moment(daySleepTime).subtract(24, 'hours'), moment(dayWakeupTime)),
                        new DaybookTimeScheduleItem(statusActive, moment(dayWakeupTime), moment(endOfThisDay)),
                    ];
                } else {
                    items = [
                        new DaybookTimeScheduleItem(statusSleep, startOfThisDay, moment(dayWakeupTime)),
                        new DaybookTimeScheduleItem(statusActive, moment(dayWakeupTime), moment(daySleepTime)),
                        new DaybookTimeScheduleItem(statusSleep, moment(daySleepTime), moment(endOfThisDay)),
                    ];
                }
            } else {
                console.log("error with sleep time" + daySleepTime.format('YYYY-MM-DD hh:mm a'))
            }
        } else {
            console.log("error with wakeup time: " + dayWakeupTime.format('YYYY-MM-DD hh:mm a'));
        }
        return items;
    }


    private _defaultWakeupTime(dateYYYYMMDD: string): moment.Moment {
        return moment(dateYYYYMMDD).hour(7).minute(30).startOf('minute');
    }
    private _defaultFallAsleepTime(dateYYYYMMDD: string): moment.Moment {
        return moment(dateYYYYMMDD).hour(22).minute(30).startOf('minute');
    }

    // private _dayItemWakeupTime(item: DaybookDayItem): moment.Moment {
    //     let wakeupTime: moment.Moment;
    //     if (item.hasSleepItems) {
    //         let largest = item.sleepInputItems[0];
    //         let currentMs = moment(largest.endSleepTimeISO).diff(largest.startSleepTimeISO, 'milliseconds');
    //         for (let i = 0; i < item.sleepInputItems.length; i++) {
    //             const thisMs = moment(item.sleepInputItems[i].endSleepTimeISO).diff(item.sleepInputItems[i].startSleepTimeISO, 'milliseconds');
    //             if (thisMs > currentMs && !moment(item.sleepInputItems[i].endSleepTimeISO).isSame(item.endOfThisDay)) {
    //                 largest = item.sleepInputItems[i];
    //                 currentMs = thisMs;
    //             }
    //         }
    //         wakeupTime = moment(largest.endSleepTimeISO);
    //     } else {
    //         wakeupTime = this._defaultWakeupTime(item.dateYYYYMMDD);
    //     }
    //     console.log("Wakeup time is: " + wakeupTime.format('YYYY-MM-DD hh:mm a'))
    //     return wakeupTime
    // }

    // private _dayItemFallAsleepTime(item: DaybookDayItem): moment.Moment {
    //     let fallAsleepTime: moment.Moment;
    //     if (item.hasSleepItems) {
    //         let last = item.sleepInputItems[item.sleepInputItems.length - 1];
    //         if (moment(last.startSleepTimeISO).isBefore(this._dayItemWakeupTime(item))) {
    //             fallAsleepTime = moment(last.startSleepTimeISO).add(24, 'hours');
    //         } else {
    //             fallAsleepTime = moment(last.startSleepTimeISO);
    //         }
    //     } else {
    //         fallAsleepTime = this._defaultFallAsleepTime(item.dateYYYYMMDD);
    //     }
    //     return fallAsleepTime;
    // }


}