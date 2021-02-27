import { DaybookDayItem } from '../../daybook-day-item/daybook-day-item.class';
import { UAPAppConfiguration } from '../../../user-account-profile/api/uap-app-configuraiton.interface';
import * as moment from 'moment';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { DaybookTimelogEntryDataItem } from '../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';

export class SleepCycleDaybookAnalyzer {


    /**
     * This class takes the last 30 available DaybookDayItem, (default request when daybookHttpService loads)
     * and uses the information within to calculate averages.
     * there will be 30 DaybookDayItems but not necessarily any of them will have sleep data.
     *
     *
     *
     * since the public properties of this class are of type moment.Moment, but we're only interested in the time and not the date,
     * we'll just use the default (today's) date where needed.  Then we can just use .hour() and .minute()
     *
     */
    constructor(dayItems: DaybookDayItem[], appConfig: UAPAppConfiguration) {
        this._appConfig = appConfig;
        this._dayItems = dayItems;
        this._analyze();
    }

    private _appConfig: UAPAppConfiguration;
    private _dayItems: DaybookDayItem[];
    private _isValid: boolean;

    private _calculatedEarliestWakeup: moment.Moment;
    private _calculatedLatestWakeup: moment.Moment;
    private _calculatedAverageWakeup: moment.Moment;
    private _calculatedMedianWakeup: moment.Moment;
    private _calculatedEarliestFallAsleep: moment.Moment;
    private _calculatedLatestFallAsleep: moment.Moment;
    private _calculatedAverageFallAsleep: moment.Moment;
    private _calculatedMedianFallAsleep: moment.Moment;
    private _calculatedAverageAwakeMsPerDay: number;
    private _calculatedMedianAwakeMsPerDay: number;


    /** This property determines whether or not there are enough DaybookDayItems to make valid calculations from. */
    public get isValid(): boolean { return this._isValid; }

    public get calculatedEarliestWakeup(): moment.Moment { return this._calculatedEarliestWakeup; }
    public get calculatedLatestWakeup(): moment.Moment { return this._calculatedLatestWakeup; }
    public get calculatedAverageWakeup(): moment.Moment { return this._calculatedAverageWakeup; }
    public get calculatedMedianWakeup(): moment.Moment { return this._calculatedMedianWakeup; }

    public get calculatedEarliestFallAsleep(): moment.Moment { return this._calculatedEarliestFallAsleep; }
    public get calculatedLatestFallAsleep(): moment.Moment { return this._calculatedLatestFallAsleep; }
    public get calculatedAverageFallAsleep(): moment.Moment { return this._calculatedAverageFallAsleep; }
    public get calculatedMedianFallAsleep(): moment.Moment { return this._calculatedMedianFallAsleep; }

    public get calculatedAverageAwakeMsPerDay(): number { return this._calculatedAverageAwakeMsPerDay; }
    public get calculatedMedianAwakeMsPerDay(): number { return this._calculatedMedianAwakeMsPerDay; }
    public get calculatedAverageAsleepMsPerDay(): number { return this._msPerDay - this.calculatedAverageAwakeMsPerDay; }
    public get calculatedMedianAsleepMsPerDay(): number { return this._msPerDay - this.calculatedMedianAwakeMsPerDay; }

    private get _defaultFallAsleepTime(): moment.Moment {
        return moment().startOf('day').hour(this._appConfig.defaultFallAsleepHour).minute(this._appConfig.defaultFallAsleepMinute);
    }
    private get _defaultWakeupTime(): moment.Moment {
        return moment().startOf('day').hour(this._appConfig.defaultWakeupHour).minute(this._appConfig.defaultWakeupMinute);
    }

    private get _msPerDay(): number { return 1000 * 60 * 60 * 24; }

    private get _defaultAwakeMsPerDay(): number {
        return Math.abs(moment(this._defaultFallAsleepTime).diff(this._defaultWakeupTime, 'milliseconds'));
    }
    private get _defaultAsleepMsPerDay(): number { return this._msPerDay - this._defaultAwakeMsPerDay; }


    private _analyze() {
        const validItems: DaybookDayItem[] = this._getValidItems();
        this._calculateSleepMilliseconds(validItems);
        this._calculateWakeupTimes(validItems);
        this._calculateFallAsleepTimes(validItems);
    }

    private _calculateSleepMilliseconds(daybookDayItems: DaybookDayItem[]) {
        const sleepMsPerDay: number[] = daybookDayItems.map(item => this._calculateSleepMsForDay(item));
        let totalSumMs: number = 0;
        sleepMsPerDay.forEach(s => totalSumMs += s);
        const medianIndexMs: number = sleepMsPerDay.length % 2 === 0 ? sleepMsPerDay.length / 2 : Math.floor(sleepMsPerDay.length / 2);
        this._calculatedAverageAwakeMsPerDay = this._msPerDay - totalSumMs / sleepMsPerDay.length;
        this._calculatedMedianAwakeMsPerDay = this._msPerDay - sleepMsPerDay[medianIndexMs];
    }
    private _calculateWakeupTimes(daybookDayItems: DaybookDayItem[]) {
        let wakeupTimes: moment.Moment[] = [];
        for (let i = 0; i < daybookDayItems.length; i++) {
            const daySleepItems: TimeScheduleItem[] = daybookDayItems[i].sleepInputItems
                .map(si => new TimeScheduleItem(si.startSleepTimeISO, si.endSleepTimeISO));
            if (daySleepItems.length > 0) {
                wakeupTimes.push(daySleepItems[0].schedItemEndTime);
            } else {
                wakeupTimes.push(this._defaultWakeupTime);
            }
        }
        wakeupTimes = wakeupTimes.map(time => moment().startOf('day').hour(time.hour()).minute(time.minute()))
            .sort((t1, t2) => {
                if (t1.isBefore(t2)) { return -1; }
                else if (t1.isAfter(t2)) { return 1; }
                else { return 0; }
            });
        const midday = moment().startOf('day').add(12, 'hours');
        const wakeupMsFromMidDays: number[] = wakeupTimes.map(wut => midday.diff(wut, 'milliseconds'));
        const medianIndexWakeup: number = wakeupTimes.length % 2 === 0 ? wakeupTimes.length / 2 : Math.floor(wakeupTimes.length / 2);
        let sumWakeupMsFromMidDay = 0;
        wakeupMsFromMidDays.forEach(ms => sumWakeupMsFromMidDay += ms);
        const averageWakeupMsFromMidday = sumWakeupMsFromMidDay / wakeupMsFromMidDays.length;
        const isAfterMidday = averageWakeupMsFromMidday > 0;
        const absWakeupMs: number = Math.abs(averageWakeupMsFromMidday);
        let averageWakeupTime: moment.Moment = moment(midday).subtract(absWakeupMs, 'milliseconds');
        if (isAfterMidday) {
            averageWakeupTime = moment(midday).add(absWakeupMs, 'milliseconds');
        }
        this._calculatedEarliestWakeup = wakeupTimes[0];
        this._calculatedLatestWakeup = wakeupTimes[wakeupTimes.length - 1];
        this._calculatedAverageWakeup = averageWakeupTime;
        this._calculatedMedianWakeup = wakeupTimes[medianIndexWakeup];
    }


    private _calculateFallAsleepTimes(daybookDayItems: DaybookDayItem[]) {
        let fallAsleepTimes: moment.Moment[] = [];
        for (let i = 0; i < daybookDayItems.length; i++) {
            const daySleepItems: TimeScheduleItem[] = daybookDayItems[i].sleepInputItems
                .map(si => new TimeScheduleItem(si.startSleepTimeISO, si.endSleepTimeISO));
            if (daySleepItems.length > 0) {
                fallAsleepTimes.push(daySleepItems[0].schedItemStartTime);
            } else {
                fallAsleepTimes.push(this._defaultFallAsleepTime);
            }
        }
        fallAsleepTimes = fallAsleepTimes.map(time => moment().startOf('day').hour(time.hour()).minute(time.minute()))
            .sort((t1, t2) => {
                if (t1.isBefore(t2)) { return -1; }
                else if (t1.isAfter(t2)) { return 1; }
                else { return 0; }
            });
        const medianIndexSleep: number = fallAsleepTimes.length % 2 === 0 ?
            fallAsleepTimes.length / 2 : Math.floor(fallAsleepTimes.length / 2);
        const midday = moment().startOf('day').add(12, 'hours');
        const sleepMsFromMiddays: number[] = fallAsleepTimes.map(fat => midday.diff(fat, 'milliseconds'));
        let sumSleepMsFromMidday = 0;
        sleepMsFromMiddays.forEach(ms => sumSleepMsFromMidday += ms);
        const avgSleepMsFromMidday = sumSleepMsFromMidday / sleepMsFromMiddays.length;
        const isAfterMidday = avgSleepMsFromMidday > 0;
        const absSleepMs: number = Math.abs(avgSleepMsFromMidday);
        let averageSleepTime: moment.Moment = moment(midday).subtract(absSleepMs, 'milliseconds');
        if (isAfterMidday) {
            averageSleepTime = moment(midday).add(absSleepMs, 'milliseconds');
        }
        this._calculatedEarliestFallAsleep = fallAsleepTimes[0];
        this._calculatedLatestFallAsleep = fallAsleepTimes[fallAsleepTimes.length - 1];
        this._calculatedAverageFallAsleep = averageSleepTime;
        this._calculatedMedianFallAsleep = fallAsleepTimes[medianIndexSleep];
    }
    private _calculateSleepMsForDay(item: DaybookDayItem): number {
        let totalSumForDay = 0;
        item.sleepInputItems.map(sleepInputItem => {
            const start = moment(sleepInputItem.startSleepTimeISO);
            const end = moment(sleepInputItem.endSleepTimeISO);
            const totalMs = end.diff(start, 'milliseconds') * sleepInputItem.percentAsleep;
            return totalMs;
        }).forEach(itemSum => totalSumForDay += itemSum);
        return totalSumForDay;
    }
    private _getValidItems(): DaybookDayItem[] {
        const tenDaysAgoYYYYMMDD: string = moment().subtract(10, 'days').format('YYYY-MM-DD');
        const thirtyDaysAgoYYYYMMDD: string = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const hasTenDays: boolean = this._dayItems
            .filter(item => (item.dateYYYYMMDD >= tenDaysAgoYYYYMMDD) && item.hasSleepItems).length === 10;
        const hasThirtyDays: boolean = this._dayItems
            .filter(item => (item.dateYYYYMMDD >= thirtyDaysAgoYYYYMMDD) && item.hasSleepItems).length === 30;

        let validItems: DaybookDayItem[] = [];
        if (hasThirtyDays) {
            validItems = this._dayItems;
        } else if (hasTenDays) {
            validItems = this._dayItems.filter(item => item.dateYYYYMMDD >= tenDaysAgoYYYYMMDD);
        } else {
            validItems = [this._newDefaultItem(), this._newDefaultItem()];
        }
        validItems = validItems.sort((d1, d2) => {
            if (d1.dateYYYYMMDD > d2.dateYYYYMMDD) { return 1; }
            else if (d1.dateYYYYMMDD < d2.dateYYYYMMDD) { return -1; }
            else { return 0; }
        });
        if (validItems.length >= 7) {
            this._isValid = true;
        } else {
            this._isValid = false;
        }
        return validItems;
    }
    /**
     * Builds a new DaybookDayItem and inserts default sleep times.
     */
    private _newDefaultItem(): DaybookDayItem {
        const item = new DaybookDayItem(moment().format('YYYY-MM-DD'));
        const startOfDay = moment(item.startOfThisDay);
        const wakeupTime = moment(this._defaultWakeupTime);
        const sleepTime = moment(this._defaultFallAsleepTime);
        const endOfDay = moment(item.endOfThisDay);
        if (endOfDay.isSameOrAfter(sleepTime) && sleepTime.isSameOrAfter(wakeupTime) && wakeupTime.isSameOrAfter(startOfDay)) {
            item.sleepInputItems = [
                {
                    startSleepTimeISO: startOfDay.toISOString(), startSleepTimeUtcOffsetMinutes: startOfDay.utcOffset(),
                    endSleepTimeISO: wakeupTime.toISOString(), endSleepTimeUtcOffsetMinutes: wakeupTime.utcOffset(),
                    percentAsleep: 100, embeddedNote: '', activities: [], energyAtEnd: 100,
                },
                {
                    startSleepTimeISO: sleepTime.toISOString(), startSleepTimeUtcOffsetMinutes: sleepTime.utcOffset(),
                    endSleepTimeISO: endOfDay.toISOString(), endSleepTimeUtcOffsetMinutes: endOfDay.utcOffset(),
                    percentAsleep: 100, embeddedNote: '', activities: [], energyAtEnd: 100,
                },
            ];
        } else {
            console.log('Error with default times.')
        }
        return item;
    }

}
