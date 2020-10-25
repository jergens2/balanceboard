import * as moment from 'moment';
import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { UAPAppConfiguration } from '../../../user-account-profile/api/uap-app-configuraiton.interface';
import { TimeSchedule } from '../../../../shared/time-utilities/time-schedule.class';
import { DaybookTimeScheduleActiveItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-active-item.class';
import { DaybookTimeScheduleSleepItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-sleep-item.class';
import { DaybookSleepInputDataItem } from '../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';

export class SleepCycleScheduleItemsBuilder {

    private _relevantItems: DaybookDayItem[] = [];
    private _appConfig: UAPAppConfiguration;
    private _activeDateYYYYMMDD: string;

    private _previousFallAsleepTime: moment.Moment;
    private _previousWakeupTime: moment.Moment;
    private _nextFallAsleepTime: moment.Moment;
    private _nextWakeupTime: moment.Moment;

    private _yesterdayItems: DaybookTimeScheduleSleepItem[] = [];
    private _todayItems: DaybookTimeScheduleSleepItem[] = [];
    private _tomorrowItems: DaybookTimeScheduleSleepItem[] = [];

    public get previousWakeupTime(): moment.Moment { return this._previousWakeupTime; }
    public get nextFallAsleepTime(): moment.Moment { return this._nextFallAsleepTime; }

    public get todayYYYYMMDD(): string { return moment().format('YYYY-MM-DD'); }
    public get tomorrowYYYYMMDD(): string { return moment(this.todayYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }
    public get dayAfterTomorrowYYYYMMDD(): string { return moment(this.todayYYYYMMDD).add(2, 'days').format('YYYY-MM-DD'); }
    public get yesterdayYYYYMMDD(): string { return moment(this.todayYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get dayBeforeYesterdayYYYYMMDD(): string { return moment(this.todayYYYYMMDD).subtract(2, 'days').format('YYYY-MM-DD'); }

    public get activeDayIsToday(): boolean { return this._activeDateYYYYMMDD === this.todayYYYYMMDD; }
    public get activeDayIsTomorrow(): boolean { return this._activeDateYYYYMMDD === this.tomorrowYYYYMMDD; }
    public get activeDayIsDayAfterTomorrow(): boolean { return this._activeDateYYYYMMDD === this.dayAfterTomorrowYYYYMMDD; }
    public get activeDayIsYesterday(): boolean { return this._activeDateYYYYMMDD === this.yesterdayYYYYMMDD; }
    public get activeDayIsDayBeforeYesterday(): boolean { return this._activeDateYYYYMMDD === this.dayBeforeYesterdayYYYYMMDD; }

    /**
     *      This class is a subclass exclusively for class SleepCycleBuilder.
     */
    constructor(dateYYYYMMDD: string, relevantItems: DaybookDayItem[], appConfig: UAPAppConfiguration,
        prevFallAsleepTime: moment.Moment, prevWakeupTime: moment.Moment,
        nextFallAsleepTime: moment.Moment, nextWakeupTime: moment.Moment) {
        this._relevantItems = relevantItems;
        this._appConfig = appConfig;
        this._activeDateYYYYMMDD = dateYYYYMMDD;
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
        this._buildTodayRelatedItems();
    }

    public get72HourSleepDataItems(dateYYYYMMDD: string): DaybookTimeScheduleSleepItem[] {
        let sleepItems: DaybookTimeScheduleSleepItem[] = [
            ...this._sleepTimeRangesForDate(moment(dateYYYYMMDD).subtract(24, 'hours').format('YYYY-MM-DD')),
            ...this._sleepTimeRangesForDate(dateYYYYMMDD),
            ...this._sleepTimeRangesForDate(moment(dateYYYYMMDD).add(24, 'hours').format('YYYY-MM-DD')),
        ];
        sleepItems = this._mergeSleepItems(sleepItems);
        // console.log("Returning sleep items: ")
        // sleepItems.forEach((item) => { console.log("  " + item.toString()) })
        return sleepItems;
    }

    public getDayStartTime(dateYYYYMMDD: string): moment.Moment {
        const todayYYYYMMDD: string = moment(this._activeDateYYYYMMDD).format('YYYY-MM-DD');
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
        const todayYYYYMMDD: string = moment(this._activeDateYYYYMMDD).format('YYYY-MM-DD');
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
        // console.log("PRE MERGE: " )
        // sleepItems.forEach(item => console.log("   "+ item.toString()))
        for (let i = 1; i < sleepItems.length; i++) {
            const prevItem = sleepItems[i - 1];
            const thisItem = sleepItems[i];
            if (prevItem.schedItemEndTime.isSame(thisItem.schedItemStartTime)) {
                prevItem.mergeItemAfter(thisItem);
                sleepItems.splice(i, 1);
                i--;
            }
        }
        // console.log("MERGED ITEMS:")
        // sleepItems.forEach(item => console.log("   "+ item.toString()))
        return sleepItems;
    }

    private _buildTodayRelatedItems() {
        this._yesterdayItems = this._buildYesterdayItems();
        this._todayItems = this._buildTodayItems();
        this._tomorrowItems = this._buildTomorrowItems();
    }

    private _buildYesterdayItems(): DaybookTimeScheduleSleepItem[] {
        const startMidnight = moment(this.yesterdayYYYYMMDD).startOf('day');
        const endMidnight = moment(this.yesterdayYYYYMMDD).startOf('day').add(24, 'hours');
        const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === this.yesterdayYYYYMMDD);
        let items: DaybookTimeScheduleSleepItem[] = [];
        if (foundItem) {
            if (foundItem.hasSleepItems) {
                items = foundItem.sleepInputItems.map((sleepItem) => {
                    return new DaybookTimeScheduleSleepItem(moment(sleepItem.startSleepTimeISO),
                        moment(sleepItem.endSleepTimeISO), sleepItem);
                });
            } else {
                if (this.activeDayIsToday) {
                    if (this._defaultWakeupTime(this.yesterdayYYYYMMDD).isAfter(startMidnight)) {
                        items.push(new DaybookTimeScheduleSleepItem(startMidnight, this._defaultWakeupTime(this.yesterdayYYYYMMDD), null))
                    }
                    if (this._previousFallAsleepTime.isBefore(endMidnight)) {
                        items.push(new DaybookTimeScheduleSleepItem(this._previousFallAsleepTime, endMidnight, null))
                    }
                }
            }
        }
        if (items.length === 0) {
            items = this._getDefaultSleepItemsTemplate(this.yesterdayYYYYMMDD);
        }
        // console.log("YESTERDAY ITEMS: ")
        // items.forEach(item => console.log("  " + item.toString()))
        return items;
    }
    private _buildTodayItems(): DaybookTimeScheduleSleepItem[] {
        const startOfThisDay = moment().startOf('day');
        const endOfThisDay = moment(startOfThisDay).add(24, 'hours');
        let sleepItems: DaybookTimeScheduleSleepItem[] = [];
        if (this.activeDayIsToday) {
            if (this._previousFallAsleepTime.isAfter(startOfThisDay)) {
                sleepItems.push(new DaybookTimeScheduleSleepItem(this._previousFallAsleepTime, this._previousWakeupTime, null));
            } else {
                sleepItems.push(new DaybookTimeScheduleSleepItem(startOfThisDay, this._previousWakeupTime, null));
            }
            if (this._nextFallAsleepTime.isBefore(endOfThisDay)) {
                if (this._nextWakeupTime.isAfter(endOfThisDay)) {
                    sleepItems.push(new DaybookTimeScheduleSleepItem(this._nextFallAsleepTime, endOfThisDay, null));
                } else {
                    // console.log("Unusual circumstance: ",
                    //     this._nextFallAsleepTime.format('YYYY-MM-DD hh:mm a') + " - " + this._nextWakeupTime.format('YYYY-MM-DD hh:mm a'));
                    sleepItems.push(new DaybookTimeScheduleSleepItem(this._nextFallAsleepTime, this._nextWakeupTime, null))
                }
            }
        } else {
            const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === this.todayYYYYMMDD);
            if (foundItem) {
                if (foundItem.hasSleepItems) {
                    sleepItems = foundItem.sleepInputItems.map((sleepItem) => {
                        return new DaybookTimeScheduleSleepItem(moment(sleepItem.startSleepTimeISO),
                            moment(sleepItem.endSleepTimeISO), sleepItem);
                    });
                }
            }
        }
        if (sleepItems.length === 0) {
            sleepItems = this._getDefaultSleepItemsTemplate(this.todayYYYYMMDD);
        }
        // console.log("TODAY ITEMS " )
        // sleepItems.forEach(item => console.log("  " + item.toString()))
        return sleepItems;
    }
    private _buildTomorrowItems(): DaybookTimeScheduleSleepItem[] {
        const startOfThisDay = moment(this.tomorrowYYYYMMDD).startOf('day');
        const endOfThisDay = moment(startOfThisDay).add(24, 'hours');
        let sleepItems: DaybookTimeScheduleSleepItem[] = [];
        if (this.activeDayIsToday) {
            if (this.nextFallAsleepTime.isAfter(startOfThisDay)) {
                sleepItems.push(new DaybookTimeScheduleSleepItem(this.nextFallAsleepTime, this._nextWakeupTime, null));
            } else {
                sleepItems.push(new DaybookTimeScheduleSleepItem(startOfThisDay, this._nextWakeupTime, null));
            }
            if (this._defaultFallAsleepTime(this.tomorrowYYYYMMDD).isBefore(endOfThisDay)) {
                sleepItems.push(new DaybookTimeScheduleSleepItem(this._defaultFallAsleepTime(this.tomorrowYYYYMMDD),
                    endOfThisDay, null));
            }
        } else if (this.activeDayIsTomorrow) {
            if (this._previousFallAsleepTime.isAfter(startOfThisDay)) {
                sleepItems.push(new DaybookTimeScheduleSleepItem(this._previousFallAsleepTime, this.previousWakeupTime, null));
            } else {
                if (this.previousWakeupTime.isAfter(startOfThisDay)) {
                    sleepItems.push(new DaybookTimeScheduleSleepItem(startOfThisDay, this.previousWakeupTime, null));
                }
            }
            if (this.nextFallAsleepTime.isBefore(endOfThisDay)) {
                if (this._nextWakeupTime.isBefore(endOfThisDay)) {
                    sleepItems.push(new DaybookTimeScheduleSleepItem(this.nextFallAsleepTime, this._nextWakeupTime, null));
                } else {
                    sleepItems.push(new DaybookTimeScheduleSleepItem(this.nextFallAsleepTime, endOfThisDay, null));
                }
            }
        } else {
            const foundItem = this._relevantItems.find(item => item.dateYYYYMMDD === this.tomorrowYYYYMMDD);
            if (foundItem) {
                if (foundItem.hasSleepItems) {
                    sleepItems = foundItem.sleepInputItems.map((sleepItem) => {
                        return new DaybookTimeScheduleSleepItem(moment(sleepItem.startSleepTimeISO),
                            moment(sleepItem.endSleepTimeISO), sleepItem);
                    });
                }
            }
        }
        if (sleepItems.length === 0) {
            sleepItems = this._getDefaultSleepItemsTemplate(this.tomorrowYYYYMMDD);
        }
        // console.log("TOMORRWO ITEMS ")
        // sleepItems.forEach(item => console.log("  " + item.toString()))
        return sleepItems;
    }

    /**
     * Gives sleep time ranges for a 24 hour period only.
     * 
     * see sleep-time-ranges.png
     */
    private _sleepTimeRangesForDate(dateYYYYMMDD: string): DaybookTimeScheduleSleepItem[] {
        const isToday: boolean = dateYYYYMMDD === this.todayYYYYMMDD;
        const isTomorrow: boolean = dateYYYYMMDD === this.tomorrowYYYYMMDD;
        const isYesterday: boolean = dateYYYYMMDD === this.yesterdayYYYYMMDD;
        let items: DaybookTimeScheduleSleepItem[] = [];
        if (isToday) {
            items = this._todayItems;
        } else if (isTomorrow) {
            items = this._tomorrowItems;
        } else if (isYesterday) {
            items = this._yesterdayItems;
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
        return items;
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
            const sleepItems = this.get72HourSleepDataItems(dateYYYYMMDD);
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
            const sleepItems = this.get72HourSleepDataItems(dateYYYYMMDD);
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
