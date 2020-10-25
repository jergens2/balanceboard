import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { UAPAppConfiguration } from '../../../user-account-profile/api/uap-app-configuraiton.interface';
import { SleepCycleScheduleItemsBuilder } from './sleep-cycle-schedule-items-builder.class';
import { DaybookSleepInputDataItem } from '../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import * as moment from 'moment';
import { DaybookTimeScheduleSleepItem } from '../../display-manager/daybook-time-schedule/daybook-time-schedule-sleep-item.class';
import { SleepCycleData } from './sleep-cycle-data.class';


export class SleepCycleBuilder {

    /**
     * This class exists for the SleepManager to use
     */
    constructor(data: SleepCycleData, appConfig: UAPAppConfiguration) {
        this._sleepCycleData = data;
        this._appConfig = appConfig;
    }

    private _sleepCycleData: SleepCycleData;
    private _appConfig: UAPAppConfiguration;

    public get todayYYYYMMDD(): string { return moment().format('YYYY-MM-DD'); }
    public get tomorrowYYYYMMDD(): string { return moment(this.todayYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }
    public get dayAfterTomorrowYYYYMMDD(): string { return moment(this.todayYYYYMMDD).add(2, 'days').format('YYYY-MM-DD'); }
    public get yesterdayYYYYMMDD(): string { return moment(this.todayYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get dayBeforeYesterdayYYYYMMDD(): string { return moment(this.todayYYYYMMDD).subtract(2, 'days').format('YYYY-MM-DD'); }

    public buildSleepCycleForDate(dateYYYYMMDD: string,
        dayItems: DaybookDayItem[]): SleepCycleScheduleItemsBuilder {
        const previousFallAsleepTime: moment.Moment = this._findPreviousFallAsleepTime(dateYYYYMMDD, dayItems);
        const previousWakeupTime: moment.Moment = this._findPreviousWakeupTime(dateYYYYMMDD, dayItems);
        const nextFallAsleepTime: moment.Moment = this._findNextFallAsleepTime(dateYYYYMMDD, dayItems);
        const nextWakeupTime: moment.Moment = this._findNextWakeupTime(dateYYYYMMDD, dayItems);
        // console.log("  x  TIME VALUES SET: ")
        // console.log("  x  PREV FALL ASLEEP: ", previousFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  x  PREV WAKE: ", previousWakeupTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  x  NEXT FALL ASLEEP: ", nextFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        // console.log("  x  NEXT WAKE: ", nextWakeupTime.format('YYYY-MM-DD hh:mm a'))
        const newSleepCycle = new SleepCycleScheduleItemsBuilder(dateYYYYMMDD, dayItems, this._appConfig,
            moment(previousFallAsleepTime), moment(previousWakeupTime), moment(nextFallAsleepTime), moment(nextWakeupTime));
        return newSleepCycle;
    }

    public findPreviousFallAsleepTimeForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        return this._findPreviousFallAsleepTime(dateYYYYMMDD, dayItems);
    }
    public findPreviousWakeupTimeForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        return this._findPreviousWakeupTime(dateYYYYMMDD, dayItems);
    }
    public findNextFallAsleepTimeForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        return this._findNextFallAsleepTime(dateYYYYMMDD, dayItems);
    }
    public findNextWakeupTimeForDate(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        return this._findNextWakeupTime(dateYYYYMMDD, dayItems);
    }

    private _findPreviousFallAsleepTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dateYYYYMMDD === this.todayYYYYMMDD) {
            return moment(this._sleepCycleData.previousFallAsleepTime);
        } else if (dateYYYYMMDD === this.tomorrowYYYYMMDD) {
            return moment(this._sleepCycleData.nextFallAsleepTime);
        }
        const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
        const thisDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        const prevDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        if (thisDayItem && prevDayItem) {
            if (thisDayItem.hasSleepItems && prevDayItem.hasSleepItems) {
                const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
                const schedItems = this._getSleepInputItems(dayItems);
                const startTimes = schedItems.map(item => item.schedItemStartTime)
                    .filter(time => time.isBefore(midDay))
                    .sort((item1, item2) => {
                        const item1Diff = moment(midDay).diff(item1, 'milliseconds');
                        const item2Diff = moment(midDay).diff(item2, 'milliseconds');
                        if (item1Diff > 0 && item1Diff < item2Diff) {
                            return -1;
                        } else if (item2Diff > 0 && item2Diff < item1Diff) {
                            return 1;
                        } else { return 0; }
                    });
                const foundTime = startTimes[0];
                // console.log("FOUND PREVIOUS FALL ASLEEP TIME for DATE: " + dateYYYYMMDD + " \n\t\t" + foundTime.format('YYYY-MM-DD hh:mm a'))
                return foundTime;
            }
        }
        const addHours = this._appConfig.defaultFallAsleepHour;
        const addMins = this._appConfig.defaultFallAsleepMinute;
        const fallAsleepTime = moment(dateYYYYMMDD).startOf('day').subtract(24, 'hours').add(addHours, 'hours').add(addMins, 'minutes');
        return fallAsleepTime;

    }
    private _findPreviousWakeupTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dateYYYYMMDD === this.todayYYYYMMDD) {
            return moment(this._sleepCycleData.previousWakeupTime);
        } else if (dateYYYYMMDD === this.tomorrowYYYYMMDD) {
            return moment(this._sleepCycleData.nextWakeupTime);
        }
        const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
        const thisDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        const prevDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
        if (thisDayItem && prevDayItem) {
            if (thisDayItem.hasSleepItems && prevDayItem.hasSleepItems) {
                const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
                const schedItems = this._getSleepInputItems(dayItems);
                const endTimes = schedItems.map(item => item.schedItemEndTime)
                    .filter(time => time.isBefore(midDay))
                    .sort((item1, item2) => {
                        const item1Diff = moment(midDay).diff(item1, 'milliseconds');
                        const item2Diff = moment(midDay).diff(item2, 'milliseconds');
                        if (item1Diff > 0 && item1Diff < item2Diff) {
                            return -1;
                        } else if (item2Diff > 0 && item2Diff < item1Diff) {
                            return 1;
                        } else { return 0; }
                    });
                const foundTime = endTimes[0];
                // console.log("FOUND PREVIOUS WAKEUP TIME for DATE: " + dateYYYYMMDD + " \n\t\t" + foundTime.format('YYYY-MM-DD hh:mm a'))
                return foundTime;
            }
        }
        const addHours = this._appConfig.defaultWakeupHour;
        const addMins = this._appConfig.defaultWakeupMinute;
        const wakeupTime = moment(dateYYYYMMDD).startOf('day').add(addHours, 'hours').add(addMins, 'minutes');
        return wakeupTime;
    }
    private _findNextFallAsleepTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dateYYYYMMDD === this.yesterdayYYYYMMDD) {
            return moment(this._sleepCycleData.previousFallAsleepTime);
        } else if (dateYYYYMMDD === this.todayYYYYMMDD) {
            return moment(this._sleepCycleData.nextFallAsleepTime);
        }
        const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        const thisDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        const nextDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD);
        if (thisDayItem && nextDayItem) {
            if (thisDayItem.hasSleepItems && nextDayItem.hasSleepItems) {
                const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
                const schedItems = this._getSleepInputItems(dayItems);
                const startTimes = schedItems.map(item => item.schedItemStartTime)
                    .filter(time => time.isAfter(midDay))
                    .sort((item1, item2) => {
                        const item1Diff = moment(item1).diff(midDay, 'milliseconds');
                        const item2Diff = moment(item2).diff(midDay, 'milliseconds');
                        if (item1Diff > 0 && item1Diff < item2Diff) {
                            return -1;
                        } else if (item2Diff > 0 && item2Diff < item1Diff) {
                            return 1;
                        } else { return 0; }
                    });
                const foundTime = startTimes[0];
                return foundTime;
            }
        }
        const addHours = this._appConfig.defaultFallAsleepHour;
        const addMins = this._appConfig.defaultFallAsleepMinute;
        const fallAsleepTime = moment(dateYYYYMMDD).startOf('day').add(addHours, 'hours').add(addMins, 'minutes');
        return fallAsleepTime;
    }
    private _findNextWakeupTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dateYYYYMMDD === this.yesterdayYYYYMMDD) {
            return moment(this._sleepCycleData.previousWakeupTime);
        } else if (dateYYYYMMDD === this.todayYYYYMMDD) {
            return moment(this._sleepCycleData.nextWakeupTime);
        }
        const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        const thisDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD);
        const nextDayItem: DaybookDayItem = dayItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD);
        if (thisDayItem && nextDayItem) {
            if (thisDayItem.hasSleepItems && nextDayItem.hasSleepItems) {
                const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
                const schedItems = this._getSleepInputItems(dayItems);
                const endTimes = schedItems.map(item => item.schedItemEndTime)
                    .filter(time => time.isAfter(midDay))
                    .sort((item1, item2) => {
                        const item1Diff = moment(item1).diff(midDay, 'milliseconds');
                        const item2Diff = moment(item2).diff(midDay, 'milliseconds');
                        if (item1Diff > 0 && item1Diff < item2Diff) {
                            return -1;
                        } else if (item2Diff > 0 && item2Diff < item1Diff) {
                            return 1;
                        } else { return 0; }
                    });
                const foundTime = endTimes[0];
                return foundTime;
            }
        }
        const addHours = this._appConfig.defaultWakeupHour;
        const addMins = this._appConfig.defaultWakeupMinute;
        const wakeupTime = moment(dateYYYYMMDD).startOf('day').add(24, 'hours').add(addHours, 'hours').add(addMins, 'minutes');
        return wakeupTime;
    }

    private _getSleepInputItems(dayItems: DaybookDayItem[]) {
        let sleepItems: DaybookSleepInputDataItem[] = [];
        dayItems.forEach((dayItem) => { sleepItems = [...sleepItems, ...dayItem.sleepInputItems] });
        const schedItems = sleepItems.map(item => {
            return new DaybookTimeScheduleSleepItem(moment(item.startSleepTimeISO), moment(item.endSleepTimeISO), item);
        }).sort((item1, item2) => {
            if (item1.schedItemStartTime.isBefore(item2.schedItemStartTime)) { return -1; }
            else if (item1.schedItemStartTime.isAfter(item2.schedItemStartTime)) { return 1; }
            else { return 0; }
        });
        if (schedItems.length > 0) {
            for (let i = 1; i < schedItems.length; i++) {
                if (schedItems[i].schedItemStartTime.isSame(schedItems[i - 1].schedItemEndTime)) {
                    schedItems[i - 1].changeSchedItemEndTime(schedItems[i].schedItemEndTime);
                    schedItems.splice(i, 1);
                    i--;
                }
            }
        }
        // console.log("* SCHED ITEMS ARE:")
        // schedItems.forEach(item => console.log("   "+ item.toString()))
        return schedItems;
    }


}
