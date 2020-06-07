import * as moment from 'moment';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimeScheduleStatus } from '../api/controllers/daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from '../api/controllers/daybook-time-schedule-item.class';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';

export class DaybookSleepCycle {

    /**
     * The purpose of this class is to be able to try and determine a sleep pattern based on previous sleep items.
     */
    constructor(relevantItems: DaybookDayItem[]) {
        this._relevantItems = relevantItems;
    }

    private _relevantItems: DaybookDayItem[] = [];



    public getDayStartTime(dateYYYYMMDD: string): moment.Moment {
        const thisDayWakeItems = this._getThisDayWakeItems(dateYYYYMMDD);
        if (thisDayWakeItems.length === 0) {
            console.log('Error: wtf');
        } else if (thisDayWakeItems.length === 1) {
            return thisDayWakeItems[0].startTime;
        } else if (thisDayWakeItems.length > 1) {
            return this._findLargestWakeItem(thisDayWakeItems, dateYYYYMMDD).startTime;
        }
        return null;
    }
    public getDayEndTime(dateYYYYMMDD: string): moment.Moment {
        const thisDayWakeItems = this._getThisDayWakeItems(dateYYYYMMDD);
        if (thisDayWakeItems.length === 0) {
            console.log('Error: wtf');
        } else if (thisDayWakeItems.length === 1) {
            return thisDayWakeItems[0].endTime;
        } else if (thisDayWakeItems.length > 1) {
            return this._findLargestWakeItem(thisDayWakeItems, dateYYYYMMDD).endTime;
        }
        return null;
    }


    public getFutureSleepDataItems(): DaybookSleepInputDataItem[] { 
        return []
    }

    


    private _calculateSleepAverage(): number {
        let ratios: number[] = [];
        const defaultRatio = 0.33;
        const relevantItems = this._relevantItems;
        if (relevantItems.length === 0) {
            return defaultRatio;
        } else if (relevantItems.length < 3) {
            ratios = [defaultRatio, ...relevantItems.map(item => this._getSleepRatio(item))];
        } else if (relevantItems.length >= 3) {
            ratios = relevantItems.map(item => this._getSleepRatio(item));
        }
        let sum: number = 0;
        ratios.forEach((ratio) => {
            sum += ratio;
        });
        return (sum / ratios.length) * 100;
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

    private _getThisDayWakeItems(dateYYYYMMDD: string): DaybookTimeScheduleItem[] {
        const startOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        const endOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        let sleepItems: DaybookSleepInputDataItem[] = [];
        this._relevantItems.forEach((item) => {
            sleepItems = [...sleepItems, ...item.sleepInputItems];
        });
        const timeItems: DaybookTimeScheduleItem[] = sleepItems.map(item => {
            return new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.SLEEP, moment(item.startSleepTimeISO), moment(item.endSleepTimeISO), null, item)
        });
        const sleepCycle = this._getSleepCycle(timeItems);
        const wakeItems = sleepCycle.filter(item => item.status !== DaybookTimeScheduleStatus.SLEEP);
        const thisDaywakeItems = wakeItems.filter((wakeItem) => {
            const crossesStart = wakeItem.startTime.isBefore(startOfThisDay) && wakeItem.endTime.isSameOrBefore(endOfThisDay);
            const crossesEnd = wakeItem.startTime.isSameOrAfter(startOfThisDay) && wakeItem.endTime.isAfter(endOfThisDay);
            const isInside = wakeItem.startTime.isSameOrAfter(startOfThisDay) && wakeItem.endTime.isSameOrBefore(endOfThisDay);
            const encapsulates = wakeItem.startTime.isSameOrBefore(startOfThisDay) && wakeItem.endTime.isSameOrAfter(endOfThisDay);
            return crossesStart || crossesEnd || isInside || encapsulates;
        });
        return thisDaywakeItems;
    }


    /**
     * It is assumed that all items coming in are broken at midnight for each day,
     * in other words, there shouldn't be any items that cross midnight.
     * 
     * This method will return an array of blocks that are either SLEEP or ACTIVE, and those blocks may cross midnight.
     */
    private _getSleepCycle(items: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        let mergedItems: DaybookTimeScheduleItem[] = [];
        let currentItem = Object.assign({}, items[0]);

        if (currentItem.status !== DaybookTimeScheduleStatus.SLEEP) {
            currentItem.status = DaybookTimeScheduleStatus.ACTIVE;
        }
        for (let i = 1; i < items.length; i++) {
            if (items[i].status === currentItem.status) {
                currentItem.endTime = items[i].endTime;
            } else {
                mergedItems.push(currentItem);
                const newStatus = items[i].status === DaybookTimeScheduleStatus.SLEEP ? DaybookTimeScheduleStatus.SLEEP : DaybookTimeScheduleStatus.ACTIVE;
                const newItem = new DaybookTimeScheduleItem(newStatus, items[i].startTime, items[i].endTime, null, null);
                currentItem = newItem;
            }
        }
        mergedItems.push(currentItem);
        return mergedItems;
    }

}