import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { UAPAppConfiguration } from '../../../user-account-profile/api/uap-app-configuraiton.interface';
import { SleepCycleScheduleItemsBuilder } from './sleep-cycle-schedule-items-builder.class';
import { DaybookSleepInputDataItem } from '../../api/data-items/daybook-sleep-input-data-item.interface';
import * as moment from 'moment';
import { DaybookTimeScheduleSleepItem } from '../../api/daybook-time-schedule/daybook-time-schedule-sleep-item.class';


export class SleepCycleBuilder {

    /**
     * This class exists for the SleepManager to use
     */
    constructor() { }

    private _appConfig: UAPAppConfiguration;

    public buildSleepCycleForDate(dateYYYYMMDD: string,
        dayItems: DaybookDayItem[], appConfig: UAPAppConfiguration): SleepCycleScheduleItemsBuilder {
        this._appConfig = appConfig;
        const previousFallAsleepTime: moment.Moment = this._findPreviousFallAsleepTime(dateYYYYMMDD, dayItems);
        const previousWakeupTime: moment.Moment = this._findPreviousWakeupTime(dateYYYYMMDD, dayItems);
        const nextFallAsleepTime: moment.Moment = this._findNextFallAsleepTime(dateYYYYMMDD, dayItems);
        const nextWakeupTime: moment.Moment = this._findNextWakeupTime(dateYYYYMMDD, dayItems);
        const newSleepCycle = new SleepCycleScheduleItemsBuilder(dateYYYYMMDD, dayItems, appConfig,
            moment(previousFallAsleepTime), moment(previousWakeupTime), moment(nextFallAsleepTime), moment(nextWakeupTime));
        return newSleepCycle;
    }

    private _findPreviousFallAsleepTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dayItems[0].hasSleepItems && dayItems[1].hasSleepItems) {
            const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
            const schedItems = this._getSchedItems(dayItems);
            const startTimes = schedItems.map(item => item.startTime)
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
        } else {
            const addHours = this._appConfig.defaultFallAsleepHour;
            const addMins = this._appConfig.defaultFallAsleepMinute;
            const fallAsleepTime = moment(dateYYYYMMDD).startOf('day').subtract(24, 'hours').add(addHours, 'hours').add(addMins, 'minutes');
            return fallAsleepTime;
        }
    }
    private _findPreviousWakeupTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dayItems[0].hasSleepItems && dayItems[1].hasSleepItems) {
            const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
            const schedItems = this._getSchedItems(dayItems);
            const endTimes = schedItems.map(item => item.endTime)
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
        } else {
            const addHours = this._appConfig.defaultWakeupHour;
            const addMins = this._appConfig.defaultWakeupMinute;
            const wakeupTime = moment(dateYYYYMMDD).startOf('day').add(addHours, 'hours').add(addMins, 'minutes');
            return wakeupTime;
        }
    }
    private _findNextFallAsleepTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dayItems[1].hasSleepItems && dayItems[2].hasSleepItems) {
            const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
            const schedItems = this._getSchedItems(dayItems);
            const startTimes = schedItems.map(item => item.startTime)
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
            // console.log("FOUND NEXT FALL ASLEEP TIME for DATE: " + dateYYYYMMDD + " \n\t\t" + foundTime.format('YYYY-MM-DD hh:mm a'))
            return foundTime;
        } else {
            const addHours = this._appConfig.defaultFallAsleepHour;
            const addMins = this._appConfig.defaultFallAsleepMinute;
            const fallAsleepTime = moment(dateYYYYMMDD).startOf('day').add(addHours, 'hours').add(addMins, 'minutes');
            return fallAsleepTime;
        }
    }
    private _findNextWakeupTime(dateYYYYMMDD: string, dayItems: DaybookDayItem[]): moment.Moment {
        if (dayItems[1].hasSleepItems && dayItems[2].hasSleepItems) {
            const midDay: moment.Moment = moment(dateYYYYMMDD).startOf('day').add(12, 'hours');
            const schedItems = this._getSchedItems(dayItems);
            const endTimes = schedItems.map(item => item.endTime)
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
            // console.log("FOUND NEXT WAKEUP TIME for DATE: " + dateYYYYMMDD + " \n\t\t" + foundTime.format('YYYY-MM-DD hh:mm a'))
            return foundTime;
        } else {
            const addHours = this._appConfig.defaultWakeupHour;
            const addMins = this._appConfig.defaultWakeupMinute;
            const wakeupTime = moment(dateYYYYMMDD).startOf('day').add(24, 'hours').add(addHours, 'hours').add(addMins, 'minutes');
            return wakeupTime;
        }
    }

    private _getSchedItems(dayItems: DaybookDayItem[]) {
        let sleepItems: DaybookSleepInputDataItem[] = [];
        dayItems.forEach((dayItem) => { sleepItems = [...sleepItems, ...dayItem.sleepInputItems] });
        const schedItems = sleepItems.map(item => {
            return new DaybookTimeScheduleSleepItem(moment(item.startSleepTimeISO), moment(item.endSleepTimeISO), item);
        }).sort((item1, item2) => {
            if (item1.startTime.isBefore(item2.startTime)) { return -1; }
            else if (item1.startTime.isAfter(item2.startTime)) { return 1; }
            else { return 0; }
        });
        if (schedItems.length > 0) {
            for (let i = 1; i < schedItems.length; i++) {
                if (schedItems[i].startTime.isSame(schedItems[i - 1].endTime)) {
                    schedItems[i - 1].changeEndTime(schedItems[i].endTime);
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
