import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../data-items/daybook-timelog-entry-data-item.interface';
import { DaybookSleepInputDataItem } from '../data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator } from '../../widgets/timelog/timelog-delineator.class';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../../shared/time-utilities/time-schedule.class';

export class DaybookTimeSchedule extends TimeSchedule{


    private _dateYYYYMMDD: string;
    private _timeScheduleItems: DaybookTimeScheduleItem[] = [];

    public get timeScheduleItems(): DaybookTimeScheduleItem[] { return this._timeScheduleItems; }

    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }


    constructor(dateYYYYMMDD: string, startTime: moment.Moment, endTime: moment.Moment,
        timelogEntries: DaybookTimelogEntryDataItem[], sleepEntries: TimeScheduleItem[], delineators: moment.Moment[]) {
        super(startTime, endTime);
        console.log("Construction of daybook time schedule")
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._buildSchedule(timelogEntries, sleepEntries, delineators);
    }

   




    public getStatusAtTime(timeToCheck: moment.Moment): DaybookTimeScheduleStatus {
        const foundItem = this._timeScheduleItems.find(item => timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime))
        if (foundItem) {
            return foundItem.status;
        }
        return null;
    }
    public isAvailableAtTime(timeToCheck: moment.Moment): boolean {
        return this.getStatusAtTime(timeToCheck) === DaybookTimeScheduleStatus.AVAILABLE;
    }
    public isRangeAvailable(startTime: moment.Moment, endTime: moment.Moment): boolean {
        const availableItems = this.getAvailableScheduleItems();
        const totalMS = moment(endTime).diff(startTime, 'milliseconds');

        let isRangeAvailable: boolean = false;
        availableItems.forEach((item) => {
            if (startTime.isSameOrAfter(item.startTime) && endTime.isSameOrBefore(item.endTime)) {
                isRangeAvailable = true;
            } else if (startTime.isSameOrAfter(item.startTime) && endTime.isAfter(item.endTime)) {
                const duration = moment(item.endTime).diff(moment(startTime), 'milliseconds');
                isRangeAvailable = (duration > (0.5 * totalMS));
            } else if (startTime.isBefore(item.startTime) && endTime.isAfter(item.endTime)) {
                const duration = moment(endTime).diff(moment(item.startTime), 'milliseconds');
                isRangeAvailable = (duration > (0.5 * totalMS));
            } else {

            }
        });
        return isRangeAvailable;
    }
    public getAvailableScheduleItems(): DaybookTimeScheduleItem[] {
        return this._timeScheduleItems.filter(item => item.status === DaybookTimeScheduleStatus.AVAILABLE);
    }

    // private _findItemAtTime(timeToCheck: moment.Moment): DaybookTimeScheduleItem {
    //     return this._timeScheduleItems.find(item => timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime))
    // }





    private _buildSchedule(timelogEntries: DaybookTimelogEntryDataItem[], sleepEntries: TimeScheduleItem[], delineators: moment.Moment[]) {

        const isToday: boolean = moment().format('YYYY-MM-DD') === this.dateYYYYMMDD;

        if (isToday) {
            delineators.push(moment().startOf('minute'));
        }
        // let timeScheduleItems: DaybookTimeScheduleItem[] = [
        //     ...timelogEntries.map(item => {
        //         const startTime = moment(item.startTimeISO);
        //         const endTime = moment(item.endTimeISO);
        //         return new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.ACTIVE, startTime, endTime, item, null);
        //     }),
        //     ...sleepEntries.map(item => {
        //         const startTime = moment(item.startSleepTimeISO);
        //         const endTime = moment(item.endSleepTimeISO);
        //         return new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.SLEEP, startTime, endTime, null, item);
        //     }),

        // ];


        // timeScheduleItems = this._sortAndValidate(timeScheduleItems);
        // timeScheduleItems = this._populateAvailableSpots(timeScheduleItems, delineators);
        // this._timeScheduleItems = timeScheduleItems;
    }


    private _populateAvailableSpots(timeScheduleItems: DaybookTimeScheduleItem[], delineators: moment.Moment[]): DaybookTimeScheduleItem[] {
        const buildAvailableItems = function (startTime: moment.Moment, endTime: moment.Moment, delineators: moment.Moment[]): DaybookTimeScheduleItem[] {
            const relevantDelineators = delineators.filter(item => item.isAfter(startTime) && item.isBefore(endTime)).sort((d1, d2) => {
                if (d1.isBefore(d2)) { return -1; }
                else if (d1.isAfter(d2)) { return 1; }
                else { return 0; }
            });
            if (relevantDelineators.length === 0) {
                return [new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, startTime, endTime)];
            } else if (relevantDelineators.length === 1) {
                return [
                    new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, startTime, relevantDelineators[0]),
                    new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, relevantDelineators[0], endTime),
                ];
            } else if (relevantDelineators.length > 1) {
                let currentTime = moment(startTime);
                let availableItems: DaybookTimeScheduleItem[] = [];
                for (let i = 0; i < relevantDelineators.length; i++) {
                    availableItems.push(new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, currentTime, relevantDelineators[i]));
                    currentTime = moment(relevantDelineators[i]);
                }
                availableItems.push(new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, currentTime, endTime));
                return availableItems;
            }
        }

        let currentTime: moment.Moment = moment(this.startTime);
        let allItems: DaybookTimeScheduleItem[] = [];
        if (timeScheduleItems.length === 0) {
            allItems = buildAvailableItems(this.startTime, this.endTime, delineators);
        } else {
            for (let i = 0; i < timeScheduleItems.length; i++) {
                if (currentTime.isBefore(timeScheduleItems[i].startTime)) {
                    allItems = allItems.concat(buildAvailableItems(currentTime, timeScheduleItems[i].startTime, delineators));
                }
                currentTime = moment(timeScheduleItems[i].endTime);
                allItems.push(timeScheduleItems[i]);
            }
            if (currentTime.isBefore(this.endTime)) {
                allItems = allItems.concat(buildAvailableItems(currentTime, this.endTime, delineators));
            }
        }
        return allItems;
    }

    private _sortAndValidate(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        timeScheduleItems = timeScheduleItems.sort((item1, item2) => {
            if (item1.startTime.isBefore(item2.startTime)) {
                return -1;
            } else if (item1.startTime.isAfter(item2.startTime)) {
                return 1;
            } else {
                return 0;
            }
        });
        for (let i = 0; i < timeScheduleItems.length; i++) {
            const start = timeScheduleItems[i].startTime;
            const end = timeScheduleItems[i].endTime;
            const endOfDay = moment(start).startOf('day').add(24, 'hours');
            if (end.isAfter(endOfDay)) {
                console.log('Danger: no item should ever cross midnight');
            }
        }
        let overlappingItems: boolean = false;
        if (timeScheduleItems.length > 1) {
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (timeScheduleItems[i].startTime.isBefore(timeScheduleItems[i - 1].endTime)) {
                    overlappingItems = true;
                    console.log("Error: Overlapping items!")
                    timeScheduleItems.forEach((item)=> console.log("  " + item.toString()) )
                }
            }


        }

        // for (let i = 0; i < timeScheduleItems.length; i++) {
        //     if (timeScheduleItems[i].startTime.isBefore(this.startTime)) {
        //         if (timeScheduleItems[i].endTime.isSameOrBefore(this.startTime)) {
        //             timeScheduleItems.splice(i, 1);
        //             i--;
        //         } else {
        //             timeScheduleItems[i].startTime = this.startTime;
        //         }
        //     } else if (timeScheduleItems[i].endTime.isAfter(this.endTime)) {
        //         if (timeScheduleItems[i].startTime.isSameOrAfter(this.endTime)) {
        //             timeScheduleItems.splice(i, 1);
        //             i--;
        //         } else {
        //             timeScheduleItems[i].endTime = this.endTime;
        //         }
        //     }
        // }
        return timeScheduleItems;
    }

    private _logToConsole() {
        console.log("time schedule: ")
        this._timeScheduleItems.forEach((item) => {
            console.log("  " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " -- " + item.status)
        });
    }


}