import * as moment from 'moment';
import { DaybookTimelogEntryDataItem } from '../data-items/daybook-timelog-entry-data-item.interface';
import { DaybookSleepInputDataItem } from '../data-items/daybook-sleep-input-data-item.interface';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator } from '../../widgets/timelog/timelog-delineator.class';

export class DaybookTimeSchedule {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _timeScheduleItems: DaybookTimeScheduleItem[] = [];

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }


    constructor(startTime: moment.Moment, endTime: moment.Moment,
        timelogEntries: DaybookTimelogEntryDataItem[], sleepEntries: DaybookSleepInputDataItem[], delineators: moment.Moment[]) {
            console.log("Constructing schedule")
        this._startTime = moment(startTime);
        this._endTime = moment(endTime);
        this._buildSchedule(timelogEntries, sleepEntries, delineators);
    }



    public getStatusAtTime(timeToCheck: moment.Moment): DaybookTimeScheduleStatus {
        const foundItem = this._findItemAtTime(timeToCheck);
        if (foundItem) {
            return foundItem.status;
        }
        return null;
    }
    public isAvailableAtTime(timeToCheck: moment.Moment): boolean {
        return this.getStatusAtTime(timeToCheck) === DaybookTimeScheduleStatus.AVAILABLE;
    }
    public isRangeAvailable(startTime, endTime): boolean {
        const itemAtStart = this._findItemAtTime(startTime);
        const itemAtEnd = this._findItemAtTime(endTime);
        if (itemAtStart && itemAtEnd) {
            if (this._timeScheduleItems.indexOf(itemAtStart) === this._timeScheduleItems.indexOf(itemAtEnd)) {
                return itemAtStart.status === DaybookTimeScheduleStatus.AVAILABLE;
            }
        }
        return false;
    }
    public getAvailableScheduleItems(): DaybookTimeScheduleItem[] {
        return this._timeScheduleItems.filter(item => item.status === DaybookTimeScheduleStatus.AVAILABLE);
    }

    private _findItemAtTime(timeToCheck: moment.Moment): DaybookTimeScheduleItem {
        return this._timeScheduleItems.find(item => timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime))
    }


    private _buildSchedule(timelogEntries: DaybookTimelogEntryDataItem[], sleepEntries: DaybookSleepInputDataItem[], delineators: moment.Moment[]) {
        let timeScheduleItems: DaybookTimeScheduleItem[] = [
            ...timelogEntries.map(item => {
                const startTime = moment(item.startTimeISO);
                const endTime = moment(item.endTimeISO);
                return new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.ACTIVE, startTime, endTime, item, null);
            }),
            ...sleepEntries.map(item => {
                const startTime = moment(item.startSleepTimeISO);
                const endTime = moment(item.endSleepTimeISO);
                return new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.SLEEP, startTime, endTime, null, item);
            }),
        ];
        
        timeScheduleItems = this._populateAvailableSpots(timeScheduleItems, delineators);
        this._timeScheduleItems = timeScheduleItems;

        this._logToConsole();
    }

    private _populateAvailableSpots(timeScheduleItems: DaybookTimeScheduleItem[], delineators: moment.Moment[]): DaybookTimeScheduleItem[] {
        timeScheduleItems = this._sortAndValidate(timeScheduleItems);

        const newItems: DaybookTimeScheduleItem[] = [];
        let currentTime: moment.Moment = moment(this.startTime);

        if (timeScheduleItems.length > 0) {
            if (currentTime.isBefore(timeScheduleItems[0].startTime)) {
                newItems.push(new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, currentTime, timeScheduleItems[0].startTime));
                currentTime = moment(timeScheduleItems[0].endTime);
            }
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (currentTime.isBefore(timeScheduleItems[i].startTime)) {
                    newItems.push(new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, currentTime, timeScheduleItems[i].startTime))
                }
                currentTime = moment(timeScheduleItems[i].endTime);
            }
            if (currentTime.isBefore(this.endTime)) {
                newItems.push(new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, currentTime, this.endTime));
            }
        } else {
            timeScheduleItems = [
                new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, this.startTime, this.endTime),
            ];
        }

        delineators.forEach(delineator => {
            for (let i = 0; i < newItems.length; i++) {
                if (delineator.isSameOrAfter(newItems[i].startTime) && delineator.isBefore(newItems[i].endTime)) {
                    const firstItem = new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, newItems[i].startTime, delineator);
                    const secondItem = new DaybookTimeScheduleItem(DaybookTimeScheduleStatus.AVAILABLE, delineator, newItems[i].endTime);
                    newItems.splice(i, 1, ...[firstItem, secondItem]);
                    i++;
                }
            }
        });
        timeScheduleItems = timeScheduleItems.concat(newItems);
        timeScheduleItems = this._sortAndValidate(timeScheduleItems);
        return timeScheduleItems;
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
        let overlappingItems: boolean = false;
        if (timeScheduleItems.length > 1) {
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (timeScheduleItems[i].startTime.isBefore(timeScheduleItems[i - 1].endTime)) {
                    overlappingItems = true;
                    console.log("Error: Overlapping items!")
                }
            }
        }
        return timeScheduleItems;
    }

    private _logToConsole(){
        console.log("time schedule: ")
        this._timeScheduleItems.forEach((item)=>{
            console.log("  " + item.startTime.format('YYYY-MM-DD hh:mm a') + " to " + item.endTime.format('YYYY-MM-DD hh:mm a') + " -- " + item.status)
        })
    }
}