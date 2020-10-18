import * as moment from 'moment';
import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { UAPAppConfiguration } from '../../../user-account-profile/api/uap-app-configuraiton.interface';
import { TimeSchedule } from '../../../../shared/time-utilities/time-schedule.class';
import { DaybookTimeScheduleActiveItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-active-item.class';
import { DaybookTimeScheduleSleepItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-sleep-item.class';

export class SleepCycleScheduleItemsBuilder {

    private _relevantItems: DaybookDayItem[] = [];
    private _appConfig: UAPAppConfiguration;
    private _dateYYYYMMDD: string;

    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;

    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }

    /**
     *      This class is a subclass exclusively for class SleepCycleBuilder.
     */
    constructor(dateYYYYMMDD: string, relevantItems: DaybookDayItem[], appConfig: UAPAppConfiguration,
        prevFallAsleepTime: moment.Moment, prevWakeupTime: moment.Moment,
        nextFallAsleepTime: moment.Moment, nextWakeupTime: moment.Moment) {
        this._relevantItems = relevantItems;
        this._appConfig = appConfig;
        this._dateYYYYMMDD = dateYYYYMMDD;
        // this._setDefaults();
        this._previousFallAsleepTime = moment(prevFallAsleepTime);
        this._previousWakeupTime = moment(prevWakeupTime);
        this._nextFallAsleepTime = moment(nextFallAsleepTime);
        this._nextWakeupTime = moment(nextWakeupTime);
        // console.log("  ss  TIME VALUES SET: ")
        // console.log("  ss  PREV FALL ASLEEP: " , this._previousFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  ss  PREV WAKE: " , this._previousWakeupTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  ss  NEXT FALL ASLEEP: " , this._nextFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  ss  NEXT WAKE: " , this._nextWakeupTime.format('YYYY-MM-DD hh:mm a'))
    }

    public get72HourSleepDataItems(dateYYYYMMDD: string, splitAtMidnight = false): DaybookTimeScheduleSleepItem[] {
        let sleepItems: DaybookTimeScheduleSleepItem[] = [
            ...this._sleepTimeRangesForDate(moment(dateYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD')),
            ...this._sleepTimeRangesForDate(dateYYYYMMDD),
            ...this._sleepTimeRangesForDate(moment(dateYYYYMMDD).add(24, 'hours').format('YYYY-MM-DD')),
        ];
        if (splitAtMidnight === false) {
            sleepItems = this._mergeSleepItems(sleepItems);
        }
        // console.log("Returning sleep items: ")
        // sleepItems.forEach((item) => { console.log("  " + item.toString()) })
        return sleepItems;
    }

    // public getDisplayStartTime(dateYYYYMMDD: string): moment.Moment {
    //     return TimeUtilities.roundDownToFloor(moment(this.getDayStartTime(dateYYYYMMDD)).subtract(15, 'minutes'), 30);
    // }
    // public getDisplayEndTime(dateYYYYMMDD: string): moment.Moment {
    //     return TimeUtilities.roundUpToCeiling(moment(this.getDayEndTime(dateYYYYMMDD)).add(15, 'minutes'), 30);
    // }

    public getDayStartTime(dateYYYYMMDD: string): moment.Moment {
        const todayYYYYMMDD: string = moment(this._dateYYYYMMDD).format('YYYY-MM-DD');
        const isToday: boolean = dateYYYYMMDD === todayYYYYMMDD;
        const isTomorrow: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).add(24, 'hours').format('YYYY-MM-DD');
        const isYesterday: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD');
        if (isToday) {
            return this._previousWakeupTime;
        } else if (isTomorrow) {
            return this._nextWakeupTime;
        } else {
            return this._findDayStartTime(dateYYYYMMDD);
        }
    }
    public getDayEndTime(dateYYYYMMDD: string): moment.Moment {
        const todayYYYYMMDD: string = moment(this._dateYYYYMMDD).format('YYYY-MM-DD');
        const isToday: boolean = dateYYYYMMDD === todayYYYYMMDD;
        const isTomorrow: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).add(24, 'hours').format('YYYY-MM-DD');
        const isYesterday: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD');
        if (isToday) {
            return this._nextFallAsleepTime;
        } else if (isYesterday) {
            return this._previousFallAsleepTime;
        } else {
            return this._findDayEndTime(dateYYYYMMDD);
        }
    }


    private _mergeSleepItems(sleepItems: DaybookTimeScheduleSleepItem[]): DaybookTimeScheduleSleepItem[] {
        for (let i = 0; i < sleepItems.length; i++) {
            if (i < sleepItems.length - 1) {
                if (sleepItems[i].schedItemEndTime.isSame(sleepItems[i + 1].schedItemStartTime)) {
                    sleepItems[i].mergeItemAfter(sleepItems[i + 1]);
                    sleepItems.splice(i + 1, 1);
                    i--;
                }
            }
        }
        return sleepItems;
    }


    /**
     * Gives sleep time ranges for a 24 hour period only.
     */
    private _sleepTimeRangesForDate(dateYYYYMMDD: string): DaybookTimeScheduleSleepItem[] {
        const todayYYYYMMDD: string = moment(this._dateYYYYMMDD).format('YYYY-MM-DD');
        const isToday: boolean = dateYYYYMMDD === todayYYYYMMDD;
        const isTomorrow: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).add(24, 'hours').format('YYYY-MM-DD');
        const isYesterday: boolean = dateYYYYMMDD === moment(todayYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD');
        let items: DaybookTimeScheduleSleepItem[] = [];
        if (isToday) {
            items = this._getTodaySleepTimeRanges();
        } else if (isTomorrow) {
            items = this._getTomorrowSleepTimeRanges();
        } else if (isYesterday) {
            items = this._getYesterdaySleepTimeRanges();
        } else {
            const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
            if (foundItem) {
                if (foundItem.hasSleepItems) {
                    items = foundItem.sleepInputItems.map((sleepItem) => {
                        return new DaybookTimeScheduleSleepItem(moment(sleepItem.startSleepTimeISO),
                            moment(sleepItem.endSleepTimeISO), sleepItem);
                    });

                } else {
                    items = this._getDefaultSleepItemsTemplate(dateYYYYMMDD);
                }
            } else {
                items = this._getDefaultSleepItemsTemplate(dateYYYYMMDD);
            }

        }
        // console.log("** ITEMS FOR DATE:  " + dateYYYYMMDD)
        // items.forEach((item) => { console.log("  " + item.toString()) });
        return items
    }
    private _getYesterdaySleepTimeRanges(): DaybookTimeScheduleSleepItem[] {
        const yesterdate = moment(this._dateYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD');
        const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === yesterdate);
        if (foundItem) {
            // console.log("foundItem.sleepInputItems:")
            // foundItem.sleepInputItems.forEach(item => { console.log(item)})
            const items = foundItem.sleepInputItems.map((sleepItem) => {
                return new DaybookTimeScheduleSleepItem(moment(sleepItem.startSleepTimeISO), moment(sleepItem.endSleepTimeISO), sleepItem);
            });
            // console.log("Returning YESTERDAY ITEMS: " )
            // items.forEach(item => console.log("  " + item.toString()))
            return items;
        } else {
            console.log("Error finding yesterday sleep items");
            return [];
        }

    }
    private _getTodaySleepTimeRanges(): DaybookTimeScheduleSleepItem[] {
        const startOfThisDay = moment(this._dateYYYYMMDD).startOf('day');
        const endOfThisDay = moment(startOfThisDay).add(24, 'hours');
        const sleepTimes: DaybookTimeScheduleSleepItem[] = [];
        if (this._previousFallAsleepTime.isAfter(startOfThisDay)) {
            sleepTimes.push(new DaybookTimeScheduleSleepItem(this._previousFallAsleepTime, this._previousWakeupTime, null));
        } else {
            sleepTimes.push(new DaybookTimeScheduleSleepItem(startOfThisDay, this._previousWakeupTime, null));
        }
        if (this._nextFallAsleepTime.isBefore(endOfThisDay)) {
            if (this._nextWakeupTime.isAfter(endOfThisDay)) {
                sleepTimes.push(new DaybookTimeScheduleSleepItem(this._nextFallAsleepTime, endOfThisDay, null));
            } else {
                console.log("Unusual circumstance: ", this._nextFallAsleepTime.format('YYYY-MM-DD hh:mm a') + " - " + this._nextWakeupTime.format('YYYY-MM-DD hh:mm a'));
                sleepTimes.push(new DaybookTimeScheduleSleepItem(this._nextFallAsleepTime, this._nextWakeupTime, null))
            }
        }
        // console.log("TODAY ITEMS " )
        // sleepTimes.forEach(item => console.log("  " + item.toString()))
        return sleepTimes;
    }
    private _getTomorrowSleepTimeRanges(): DaybookTimeScheduleSleepItem[] {
        const startOfThisDay = moment(this._dateYYYYMMDD).add(24, 'hours').startOf('day');
        const endOfThisDay = moment(startOfThisDay).add(24, 'hours');
        const sleepTimes: DaybookTimeScheduleSleepItem[] = [];
        if (this._nextFallAsleepTime.isAfter(startOfThisDay)) {
            sleepTimes.push(new DaybookTimeScheduleSleepItem(this._nextFallAsleepTime, this._nextWakeupTime, null));
        } else {
            sleepTimes.push(new DaybookTimeScheduleSleepItem(startOfThisDay, this._nextWakeupTime, null));
        }
        const tomorrowFallAsleepTime = moment(this._nextFallAsleepTime).add(24, 'hours');
        if (tomorrowFallAsleepTime.isBefore(endOfThisDay)) {
            sleepTimes.push(new DaybookTimeScheduleSleepItem(tomorrowFallAsleepTime, endOfThisDay, null));
        }
        // console.log("TOMORRWO ITEMS " )
        // sleepTimes.forEach(item => console.log("  " + item.toString()))
        return sleepTimes;


    }

    private _getDefaultSleepItemsTemplate(dateYYYYMMDD: string): DaybookTimeScheduleSleepItem[] {
        const dateStartTime = moment(dateYYYYMMDD).startOf('day');
        const dateEndTime = moment(dateStartTime).add(24, 'hours');
        const defaultWakeupTime = this._defaultWakeupTime(dateYYYYMMDD);
        const defaultSleepTime = this._defaultFallAsleepTime(dateYYYYMMDD);
        const items: DaybookTimeScheduleSleepItem[] = [];
        if (defaultWakeupTime.isAfter(dateStartTime) && defaultWakeupTime.isBefore(dateEndTime)) {
            items.push(new DaybookTimeScheduleSleepItem(dateStartTime, defaultWakeupTime, null));

        } else if (defaultWakeupTime.isBefore(dateStartTime)) {
            const sleepEndTime = moment(defaultWakeupTime).add(1, 'days');
            const defaultFallAsleepTime = moment(this._defaultFallAsleepTime(dateYYYYMMDD));
            let sleepStartTime = moment(defaultFallAsleepTime);
            if (defaultFallAsleepTime.isBefore(dateEndTime)) {
                items.push(new DaybookTimeScheduleSleepItem(defaultFallAsleepTime, sleepEndTime, null));
            } else {
                console.log("Error or rare situation (wake up before start of day and go to sleep after end of day) - no sleep time within 24 hrs");
            }
        }
        if (defaultSleepTime.isBefore(dateEndTime)) {
            items.push(new DaybookTimeScheduleSleepItem(defaultSleepTime, dateEndTime, null));
        }
        return items;
    }

    private _defaultWakeupTime(dateYYYYMMDD: string): moment.Moment {
        const startOfDay = moment(dateYYYYMMDD).startOf('day');
        // console.log("App config hours, minutes: ", this._appConfig.defaultWakeupHour, this._appConfig.defaultWakeupMinute)
        return moment(startOfDay).add(this._appConfig.defaultWakeupHour, 'hours').add(this._appConfig.defaultWakeupMinute, 'minutes');
    }

    private _defaultFallAsleepTime(dateYYYYMMDD: string): moment.Moment {
        const startOfDay = moment(dateYYYYMMDD).startOf('day');
        // console.log("App config hours, minutes: ", this._appConfig.defaultFallAsleepHour, this._appConfig.defaultFallAsleepMinute)
        return moment(startOfDay).add(this._appConfig.defaultFallAsleepHour, 'hours').add(this._appConfig.defaultFallAsleepMinute, 'minutes');
    }

    private _findDayStartTime(dateYYYYMMDD: string): moment.Moment {
        const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        if (foundItem) {
            const sleepItems = this.get72HourSleepDataItems(dateYYYYMMDD, false);
            const awakeItems = this._get72HAwakeItemsFromSleepItems(sleepItems, dateYYYYMMDD);
            const largest = this._findLargestWakeItem(awakeItems, dateYYYYMMDD);
            return largest.schedItemStartTime;
        } else {
            return this._defaultWakeupTime(dateYYYYMMDD);
        }
    }
    private _findDayEndTime(dateYYYYMMDD: string): moment.Moment {
        const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        if (foundItem) {
            const sleepItems = this.get72HourSleepDataItems(dateYYYYMMDD, false);
            const awakeItems = this._get72HAwakeItemsFromSleepItems(sleepItems, dateYYYYMMDD);
            const largest = this._findLargestWakeItem(awakeItems, dateYYYYMMDD);
            return largest.schedItemEndTime;
        } else {
            return this._defaultFallAsleepTime(dateYYYYMMDD);
        }
    }


    private _get72HAwakeItemsFromSleepItems(sleepItems: DaybookTimeScheduleSleepItem[], dateYYYYMMDD: string): DaybookTimeScheduleActiveItem[] {
        const startTime = moment(dateYYYYMMDD).startOf('day').subtract(24, 'hours');
        const endTime = moment(dateYYYYMMDD).startOf('day').add(48, 'hours');
        const schedule: TimeSchedule = new TimeSchedule(startTime, endTime);
        const wakeItems = schedule.getInverseItems(sleepItems);
        // console.log("Wake items: " )
        // wakeItems.forEach(item => console.log("  " + item.toString()))
        const startOfThisDay: moment.Moment = moment(dateYYYYMMDD).startOf('day');
        const endOfThisDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(24, 'hours');

        const thisDaywakeItems = wakeItems.filter((wakeItem) => {
            const crossesStart = wakeItem.schedItemStartTime.isBefore(startOfThisDay) && wakeItem.schedItemEndTime.isAfter(startOfThisDay);
            const crossesEnd = wakeItem.schedItemStartTime.isBefore(endOfThisDay) && wakeItem.schedItemEndTime.isAfter(endOfThisDay);
            const isInside = wakeItem.schedItemStartTime.isSameOrAfter(startOfThisDay) && wakeItem.schedItemEndTime.isSameOrBefore(endOfThisDay);
            const encapsulates = wakeItem.schedItemStartTime.isSameOrBefore(startOfThisDay) && wakeItem.schedItemEndTime.isSameOrAfter(endOfThisDay);
            return crossesStart || crossesEnd || isInside || encapsulates;
        });
        thisDaywakeItems.forEach((item) => { console.log("   " + item.toString()) })
        return thisDaywakeItems.map(item => new DaybookTimeScheduleActiveItem(item.schedItemStartTime, item.schedItemEndTime, null));
    }

    private _findLargestWakeItem(thisDayWakeItems: DaybookTimeScheduleActiveItem[], dateYYYYMMDD: string): DaybookTimeScheduleActiveItem {
        const startOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        const endOfThisDay: moment.Moment = moment(dateYYYYMMDD);
        const getMilliseconds = function (wakeItem: DaybookTimeScheduleActiveItem): number {
            const crossesStart = wakeItem.schedItemStartTime.isBefore(startOfThisDay) && wakeItem.schedItemEndTime.isSameOrBefore(endOfThisDay);
            const crossesEnd = wakeItem.schedItemStartTime.isSameOrAfter(startOfThisDay) && wakeItem.schedItemEndTime.isAfter(endOfThisDay);
            const isInside = wakeItem.schedItemStartTime.isSameOrAfter(startOfThisDay) && wakeItem.schedItemEndTime.isSameOrBefore(endOfThisDay);
            const encapsulates = wakeItem.schedItemStartTime.isSameOrBefore(startOfThisDay) && wakeItem.schedItemEndTime.isSameOrAfter(endOfThisDay);
            let startTime: moment.Moment;
            let endTime: moment.Moment;
            if (crossesStart) {
                startTime = moment(startOfThisDay);
                endTime = moment(wakeItem.schedItemEndTime);
            } else if (isInside) {
                startTime = moment(wakeItem.schedItemStartTime);
                endTime = moment(wakeItem.schedItemEndTime)
            } else if (crossesEnd) {
                startTime = moment(wakeItem.schedItemStartTime);
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
}
