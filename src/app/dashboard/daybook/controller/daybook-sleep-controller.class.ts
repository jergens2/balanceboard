import { TimeSpanItem } from '../api/data-items/time-span-item.interface';
import * as moment from 'moment';
import defaultWakeupTime from './default-wakeup-time';
import { Observable, Subject } from 'rxjs';
import { RoundToNearestMinute } from '../../../shared/utilities/time-utilities/round-to-nearest-minute.class';

export class DaybookSleepController {


    private _dateYYYYMMDD: string;
    private _awakeToAsleepRatio: number;
    private _wakeupTimeIsSet = false;
    private _sleepSchedule: { startTime: moment.Moment, endTime: moment.Moment, isAsleep: boolean }[];

    private _prevDayDBval: TimeSpanItem[];
    private _thisDayDBval: TimeSpanItem[];
    private _nextDayDBval: TimeSpanItem[];

    private _sleepTimesUpdated$: Subject<TimeSpanItem[]> = new Subject();

    constructor(prevDayTimeSpanItems: TimeSpanItem[], thisDayTimeSpanItems: TimeSpanItem[], nextDayTimeSpanItems: TimeSpanItem[],
        dateYYYYMMDD: string, sleepRatio: number) {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._awakeToAsleepRatio = sleepRatio;
        this._prevDayDBval = prevDayTimeSpanItems;
        this._thisDayDBval = thisDayTimeSpanItems;
        this._nextDayDBval = nextDayTimeSpanItems;
        this._buildSleepController(prevDayTimeSpanItems, thisDayTimeSpanItems, nextDayTimeSpanItems);
    }

    private get prevDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).format('YYYY-MM-DD'); }
    private get nextDateYYYYMMDD(): string { return moment(this._dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }


    private get startOfPrevDay(): moment.Moment { return moment(this.prevDateYYYYMMDD).startOf('day'); }
    private get startOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day'); }
    private get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    private get endOfThisDay(): moment.Moment { return moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    private get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    private get endOfNextDay(): moment.Moment { return moment(this.nextDateYYYYMMDD).startOf('day').add(1, 'days'); };

    private get controllerStartTime(): moment.Moment { return this.startOfPrevDay; }
    private get controllerEndTime(): moment.Moment { return this.endOfNextDay; }

    public get wakeupTimeIsSet(): boolean { return this._wakeupTimeIsSet; }

    public get ratioAwakeHoursPerDay(): number { return (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1); }
    public get ratioAsleepHoursPerDay(): number { return 24 - this.ratioAwakeHoursPerDay; }

    public get prevDayFallAsleepTime(): moment.Moment {
        let foundItem: { startTime: moment.Moment, endTime: moment.Moment, isAsleep: boolean };
        if (this.isAsleepAtTime(this.endOfPrevDay)) {
            // when fell asleep before or at midnight
            foundItem = this._sleepSchedule
                .filter(item => item.startTime.isSameOrAfter(this.startOfPrevDay) && item.endTime.isSameOrBefore(this.endOfPrevDay))
                .sort((item1, item2) => {
                    if (item1.endTime.isAfter(item2.endTime)) { return -1; }
                    if (item1.endTime.isBefore(item2.endTime)) { return 1; }
                    return 0;
                })
                .find(item => item.isAsleep === false);
            return foundItem.endTime;
        } else {
            // when fall asleep after midnight.
            foundItem = this._sleepSchedule.filter(item => item.startTime.isSameOrAfter(this.endOfPrevDay))
                .find(item => item.isAsleep === true);
            return foundItem.startTime;
        }
    }

    public get firstWakeupTime(): moment.Moment {
        let startTime = this.startOfThisDay;
        if (this.isAwakeAtTime(this.startOfThisDay)) {
            startTime = this.prevDayFallAsleepTime;
        }
        const foundItem = this._sleepSchedule
            .filter(item => item.startTime.isAfter(startTime) && item.endTime.isSameOrBefore(this.endOfThisDay))
            .find(item => item.isAsleep === false);
        return foundItem.startTime;
    }
    public get bedTime(): moment.Moment {
        const foundItem = this._sleepSchedule
            .filter(item => item.startTime.isSameOrAfter(this.firstWakeupTime) && item.endTime.isSameOrBefore(this.endOfNextDay))
            .find(item => item.isAsleep === true);
        return foundItem.startTime;
    }

    public isAwakeAtTime(timeToCheck: moment.Moment): boolean {
        return !this.isAsleepAtTime(timeToCheck);
    }
    public isAsleepAtTime(timeToCheck: moment.Moment): boolean {
        const foundItem = this._sleepSchedule.find((item) => {
            return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isSameOrBefore(item.endTime);
        });
        if (foundItem) {
            return foundItem.isAsleep;
        } else {
            console.log('Error:  no found item');
            return;
        }
    }

    public get sleepSchedule(): { startTime: moment.Moment, endTime: moment.Moment, isAsleep: boolean }[] {
        return this._sleepSchedule;
    }

    public get sleepTimesUpdated$(): Observable<TimeSpanItem[]> {
        return this._sleepTimesUpdated$.asObservable();
    }

    public setWakeupTimeForDay(wakeupTime: moment.Moment) {
        const fallAsleepTime = RoundToNearestMinute.roundToNearestMinute(moment(wakeupTime).add(this.ratioAwakeHoursPerDay, 'hours'), 15, 'UP');

        console.log("Setting wakeup time and bedtime: ");
        console.log("Wakeuptime: " + wakeupTime.format('YYYY-MM-DD hh:mm a'));
        console.log("Fall Asleep Time: " + fallAsleepTime.format('YYYY-MM-DD hh:mm a'));

        const thisDayTimeSpanItems: TimeSpanItem[] = [];
        let startTime = this.startOfThisDay;
        // console.log("Previous day fall asleep time: " + this.prevDayFallAsleepTime.format('YYYY-MM-DD hh:mm a'))
        if (this.prevDayFallAsleepTime.isAfter(this.startOfThisDay)) {
            startTime = this.prevDayFallAsleepTime;
        }
        thisDayTimeSpanItems.push({
            startTimeISO: startTime.toISOString(),
            startTimeUtcOffset: startTime.utcOffset(),
            endTimeISO: wakeupTime.toISOString(),
            endTimeUtcOffset: wakeupTime.utcOffset(),
        });

        if (fallAsleepTime.isBefore(this.endOfThisDay)) {
            thisDayTimeSpanItems.push({
                startTimeISO: fallAsleepTime.toISOString(),
                startTimeUtcOffset: fallAsleepTime.utcOffset(),
                endTimeISO: this.endOfThisDay.toISOString(),
                endTimeUtcOffset: this.endOfThisDay.utcOffset(),
            });
        }
        console.log("Updating sleep times for thisDay: ", thisDayTimeSpanItems)
        this._sleepTimesUpdated$.next(thisDayTimeSpanItems);
    }

    private _buildSleepController(prevDayTimeSpanItems: TimeSpanItem[], thisDayTimeSpanItems: TimeSpanItem[], nextDayTimeSpanItems: TimeSpanItem[]) {

        if (prevDayTimeSpanItems.length === 0 && thisDayTimeSpanItems.length === 0 && nextDayTimeSpanItems.length === 0) {
            thisDayTimeSpanItems = this._buildDefaultTimeSpanItems();
            prevDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, -1);
            nextDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, 1);
        } else if (thisDayTimeSpanItems.length > 0) {
            this._wakeupTimeIsSet = true;
            if (prevDayTimeSpanItems.length === 0) {
                prevDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, -1);
            }
            if (nextDayTimeSpanItems.length === 0) {
                nextDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, 1);
            }
        } else if (prevDayTimeSpanItems.length > 0) {
            thisDayTimeSpanItems = this._copyTimeSpanItemsFromDate(prevDayTimeSpanItems, 1);
            if (nextDayTimeSpanItems.length === 0) {
                nextDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, 1);
            }
        } else if (nextDayTimeSpanItems.length > 0) {
            thisDayTimeSpanItems = this._copyTimeSpanItemsFromDate(nextDayTimeSpanItems, -1);
            prevDayTimeSpanItems = this._copyTimeSpanItemsFromDate(thisDayTimeSpanItems, -1);
        } else {
            console.log("errror");
        }
        const allTimeSpanItems = prevDayTimeSpanItems.concat(thisDayTimeSpanItems).concat(nextDayTimeSpanItems);

        console.log("Sleep times is: ", allTimeSpanItems);
        let fullSleepSchedule: { startTime: moment.Moment, endTime: moment.Moment, isAsleep: boolean }[] = allTimeSpanItems.map((item) => {
            return {
                startTime: moment(item.startTimeISO),
                endTime: moment(item.endTimeISO),
                isAsleep: true,
            };
        });
        if (fullSleepSchedule.length > 0) {
            let currentTime: moment.Moment = moment(this.controllerStartTime);
            const filledSchedule: { startTime: moment.Moment, endTime: moment.Moment, isAsleep: boolean }[] = [];
            fullSleepSchedule.forEach((item) => {
                if (currentTime.isBefore(item.startTime)) {
                    const endOfDay: moment.Moment = moment(currentTime).startOf('day').add(24, 'hours');
                    if (item.startTime.isAfter(endOfDay)) {
                        const preMidnightItem = {
                            startTime: currentTime,
                            endTime: endOfDay,
                            isAsleep: false,
                        };
                        filledSchedule.push(preMidnightItem);
                        currentTime = endOfDay;
                    }
                    const gapItem = {
                        startTime: currentTime,
                        endTime: item.startTime,
                        isAsleep: false,
                    };
                    filledSchedule.push(gapItem);
                }
                filledSchedule.push(item);
                currentTime = moment(item.endTime);
            });
            if (currentTime.isBefore(this.controllerEndTime)) {
                const gapItem = {
                    startTime: currentTime,
                    endTime: this.controllerEndTime,
                    isAsleep: false,
                };
                filledSchedule.push(gapItem);
            }
            fullSleepSchedule = filledSchedule;
        } else {
            console.log('Error: no sleep times');
        }



        console.log("Setting sleepsechedule: ", fullSleepSchedule)
        this._sleepSchedule = fullSleepSchedule;
    }

    private _copyTimeSpanItemsFromDate(thisDayTimeSpanItems: TimeSpanItem[], daysDifference: number): TimeSpanItem[] {
        return thisDayTimeSpanItems.map((item: TimeSpanItem) => {
            return {
                startTimeISO: moment(item.startTimeISO).add(daysDifference, 'days').toISOString(),
                startTimeUtcOffset: moment(item.startTimeISO).add(daysDifference, 'days').utcOffset(),
                endTimeISO: moment(item.endTimeISO).add(daysDifference, 'days').toISOString(),
                endTimeUtcOffset: moment(item.endTimeISO).add(daysDifference, 'days').utcOffset(),
            };
        });
    }

    private _buildDefaultTimeSpanItems(): TimeSpanItem[] {
        const startOfDay: moment.Moment = moment(this.thisDateYYYYMMDD).startOf('day');
        const wakeupTime: moment.Moment = moment(startOfDay).hour(defaultWakeupTime.hour()).minute(defaultWakeupTime.minute());

        const awakeHoursPerDay: number = (this._awakeToAsleepRatio * 24) / (this._awakeToAsleepRatio + 1);
        // const asleepHoursPerDay: number = 24 - awakeHoursPerDay;
        const fallAsleepTime = moment(wakeupTime).add(awakeHoursPerDay, 'hours');

        let sleepTimes: TimeSpanItem[] = [];
        let startTime: moment.Moment = moment(startOfDay);
        let endTime: moment.Moment = moment(wakeupTime);
        if (fallAsleepTime.isAfter(moment(startOfDay).add(24, 'hours'))) {
            startTime = moment(fallAsleepTime).subtract(24, 'hours');
            endTime = moment(wakeupTime);
            const sleepTime: TimeSpanItem = {
                startTimeISO: startTime.toISOString(),
                startTimeUtcOffset: startTime.utcOffset(),
                endTimeISO: endTime.toISOString(),
                endTimeUtcOffset: endTime.utcOffset(),
            };
            sleepTimes = [sleepTime];
        } else {
            const startSleep: TimeSpanItem = {
                startTimeISO: startTime.toISOString(),
                startTimeUtcOffset: startTime.utcOffset(),
                endTimeISO: endTime.toISOString(),
                endTimeUtcOffset: endTime.utcOffset(),
            };

            const endSleepStart: moment.Moment = moment(fallAsleepTime);
            const endSleepEnd: moment.Moment = moment(startOfDay).add(24, 'hours');
            const endSleep: TimeSpanItem = {
                startTimeISO: endSleepStart.toISOString(),
                startTimeUtcOffset: endSleepStart.utcOffset(),
                endTimeISO: endSleepEnd.toISOString(),
                endTimeUtcOffset: endSleepEnd.utcOffset(),
            }
            sleepTimes = [startSleep, endSleep];
        }
        return sleepTimes;
    }

    private _logTimeSpanItems() {
        this._sleepSchedule.forEach((item) => {
            console.log(item.startTime.format("YYYY-MM-DD hh:mm a") + "  to  " + item.endTime.format('YYYY-MM-DD hh:mm a') + "  -  is asleep?  " + item.isAsleep)
        })
    }
}
