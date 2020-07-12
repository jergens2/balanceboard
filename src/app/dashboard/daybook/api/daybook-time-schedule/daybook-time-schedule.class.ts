import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-delineator.class';
import { TimeSchedule } from '../../../../shared/time-utilities/time-schedule.class';
import { DaybookSleepCycle } from '../../sleep-manager/sleep-cycle/daybook-sleep-cycle.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { TimeRangeRelationship } from '../../../../shared/time-utilities/time-range-relationship.enum';
import { TimelogEntryBuilder } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { TimelogEntryItem } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

export class DaybookTimeSchedule extends TimeSchedule {


    private _dateYYYYMMDD: string;
    private _timeScheduleItems: DaybookTimeScheduleItem[] = [];
    private _activeDayController: DaybookController;
    private _displayDelineators: TimelogDelineator[] = [];

    private _drawDelineators: { start: TimelogDelineator, end: TimelogDelineator };
    private _sleepCycle: DaybookSleepCycle;

    private get _statusAvailable(): DaybookTimeScheduleStatus { return DaybookTimeScheduleStatus.AVAILABLE; }
    private get _statusSleep(): DaybookTimeScheduleStatus { return DaybookTimeScheduleStatus.SLEEP; }
    private get _statusActive(): DaybookTimeScheduleStatus { return DaybookTimeScheduleStatus.ACTIVE; }

    constructor(dateYYYYMMDD: string, sleepCycle: DaybookSleepCycle, activeDayController: DaybookController) {
        super(sleepCycle.getDisplayStartTime(dateYYYYMMDD), sleepCycle.getDisplayEndTime(dateYYYYMMDD));
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._sleepCycle = sleepCycle;
        this._activeDayController = activeDayController;
        this._rebuild();

        // console.log("DAY BOOK SCHEDULE BUILT.  Wake up time and fall asleep time: ");
        // console.log("  " + this.wakeupTime.format('YYYY-MM-DD hh:mm a'));
        // console.log("  " + this.fallAsleepTime.format('YYYY-MM-DD hh:mm a'));
    }

    public get timeScheduleItems(): DaybookTimeScheduleItem[] { return this._timeScheduleItems; }
    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get wakeupTime(): moment.Moment { return this._sleepCycle.wakeupTime; }
    public get fallAsleepTime(): moment.Moment { return this._sleepCycle.fallAsleepTime; }
    public get displayDelineators(): TimelogDelineator[] { return this._displayDelineators; }

    public getItemsInRange(startTime: moment.Moment, endTime: moment.Moment): DaybookTimeScheduleItem[] {
        const checkRange = new TimeScheduleItem(startTime.toISOString(), endTime.toISOString());
        let inRangeItems: DaybookTimeScheduleItem[] = [];
        if (startTime.isSameOrAfter(this.startTime) && endTime.isSameOrBefore(this.endTime)) {
            inRangeItems = Object.assign([], this.timeScheduleItems.filter(item => {
                const relationship = item.getRelationshipTo(checkRange);
                return relationship === TimeRangeRelationship.OVERLAPS
            }));
            for (let i = 0; i < inRangeItems.length; i++) {
                if (inRangeItems[i].startTime.isBefore(this.startTime)) {
                    inRangeItems[i].changeStartTime(this.startTime);
                }
                if (inRangeItems[i].endTime.isAfter(this.endTime)) {
                    inRangeItems[i].changeEndTime(this.endTime);
                }
            }
        } else {
            console.log("Error:  times provided are outside of range.")
        }
        // console.log("IN RANGE ITEMS");
        // inRangeItems.forEach((item => console.log("  " + item.toString())))
        return inRangeItems;
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


    public onCreateNewTimelogEntry(drawStartDel: TimelogDelineator, drawEndDel: TimelogDelineator) {
        // console.log("creating TLE from drawing")
        this._drawDelineators = {
            start: drawStartDel,
            end: drawEndDel,
        }
        this._rebuild();
    }



    private _rebuild() {
        this._updateTimelogDelineators();
        const sleepItems: DaybookTimeScheduleItem[] = this._sleepCycle.get72HourSleepDataItems(this.dateYYYYMMDD);
        const timelogEntryItems = this._activeDayController.timelogEntryItems;
        let drawItems: DaybookTimeScheduleItem[] = [];
        if (this._drawDelineators) {
            const startTime = this._drawDelineators.start.time;
            const endTime = this._drawDelineators.end.time;
            const drawNewTLE = new TimelogEntryItem(startTime, endTime);
            const newSchedItem = new DaybookTimeScheduleItem(startTime, endTime, this._statusActive, drawNewTLE.toDataEntryItem());
            drawItems = [newSchedItem];
            this._drawDelineators = null;
        }
        let timeScheduleItems: DaybookTimeScheduleItem[] = [
            ...timelogEntryItems.map(item => {
                return new DaybookTimeScheduleItem(item.startTime, item.endTime, this._statusActive, item.toDataEntryItem());
            }),
            ...drawItems,
            ...sleepItems,
        ];
        timeScheduleItems = this._sortAndValidateScheduleItems(timeScheduleItems);
        const splitItemsByDelineatorType = [
            TimelogDelineatorType.SAVED_DELINEATOR,
            TimelogDelineatorType.NOW,
        ];
        const midnightDelineators: moment.Moment[] = [
            moment(this.dateYYYYMMDD).startOf('day'),
            moment(this.dateYYYYMMDD).startOf('day').add(24, 'hours'),
        ];
        const delineators: moment.Moment[] = [...this._displayDelineators
            .filter(item => splitItemsByDelineatorType.indexOf(item.delineatorType) > -1)
            .map(item => item.time),
        ...midnightDelineators,
        ];
        timeScheduleItems = this._populateAvailableScheduleItems(timeScheduleItems, delineators);
        timeScheduleItems = this._sortAndValidateScheduleItems(timeScheduleItems);
        timeScheduleItems = this._splitAvailableStatusItems(timeScheduleItems);
        this._timeScheduleItems = timeScheduleItems;

        // console.log("Schedule rebuilt: ")
        // this._timeScheduleItems.forEach(item => console.log("  " + item.toString()))
    }



    private _splitAvailableStatusItems(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        let splitItems: DaybookTimeScheduleItem[] = [];
        for (let i = 0; i < timeScheduleItems.length; i++) {
            if (timeScheduleItems[i].status === DaybookTimeScheduleStatus.AVAILABLE) {
                const relevantDelineators = this._displayDelineators.filter((item) => {
                    const overlaps: boolean = timeScheduleItems[i].getRelationshipToTime(item.time) === TimeRangeRelationship.OVERLAPS;
                    const validType: boolean = ([
                        TimelogDelineatorType.NOW, TimelogDelineatorType.DAY_STRUCTURE, TimelogDelineatorType.SAVED_DELINEATOR,
                    ].indexOf(item.delineatorType)) > -1;
                    return overlaps && validType;
                });
                if (relevantDelineators.length > 0) {
                    // console.log("RELEVANT ITEMS: ")
                    // relevantDelineators.forEach((item) => console.log("  " + item.toString()))
                    let currentTime = moment(timeScheduleItems[i].startTime);
                    for (let j = 0; j < relevantDelineators.length; j++) {
                        const schedItem = new TimeScheduleItem(currentTime.toISOString(), relevantDelineators[j].time.toISOString());
                        let status = timeScheduleItems[i].status;
                        if (relevantDelineators[j].delineatorType === TimelogDelineatorType.DRAWING_TLE_START) {
                            status = DaybookTimeScheduleStatus.ACTIVE;
                        }
                        const newGridItem = new DaybookTimeScheduleItem(schedItem.startTime, schedItem.endTime, status);
                        splitItems.push(newGridItem);
                        currentTime = moment(relevantDelineators[j].time);
                    }
                    const schedItem = new TimeScheduleItem(currentTime.toISOString(), timeScheduleItems[i].endTime.toISOString());
                    const newGridItem = new DaybookTimeScheduleItem(schedItem.startTime, schedItem.endTime, DaybookTimeScheduleStatus.AVAILABLE);
                    splitItems.push(newGridItem);
                } else {
                    splitItems.push(timeScheduleItems[i]);
                }
            } else {
                splitItems.push(timeScheduleItems[i]);
            }
        }
        return splitItems;
    }



    /**
     * 
     * @param timeScheduleItems an array containing all SLEEP items and TIMELOG ENTRY items, representing all time ranges which are NOT available
     * @param delineators an array of just the times to split at.  Should include delineators of type NOW and of type SAVED_DELINEATOR
     * 
     * Provide this method with these 2 arrays to return the completed full array containing time ranges that ARE available and time ranges that ARE NOT available.
     */
    private _populateAvailableScheduleItems(timeScheduleItems: DaybookTimeScheduleItem[], delineators: moment.Moment[]): DaybookTimeScheduleItem[] {
        const buildAvailableItems = function (startTime: moment.Moment, endTime: moment.Moment, delineators: moment.Moment[]): DaybookTimeScheduleItem[] {
            const _statusAvailable = DaybookTimeScheduleStatus.AVAILABLE;
            const relevantDelineators = delineators.filter(item => item.isAfter(startTime) && item.isBefore(endTime)).sort((d1, d2) => {
                if (d1.isBefore(d2)) { return -1; }
                else if (d1.isAfter(d2)) { return 1; }
                else { return 0; }
            });
            if (relevantDelineators.length === 0) {
                return [new DaybookTimeScheduleItem(startTime, endTime, _statusAvailable)];
            } else if (relevantDelineators.length === 1) {
                return [
                    new DaybookTimeScheduleItem(startTime, relevantDelineators[0], _statusAvailable),
                    new DaybookTimeScheduleItem(relevantDelineators[0], endTime, _statusAvailable),
                ];
            } else if (relevantDelineators.length > 1) {
                let currentTime = moment(startTime);
                let availableItems: DaybookTimeScheduleItem[] = [];
                for (let i = 0; i < relevantDelineators.length; i++) {
                    availableItems.push(new DaybookTimeScheduleItem(currentTime, relevantDelineators[i], _statusAvailable));
                    currentTime = moment(relevantDelineators[i]);
                }
                availableItems.push(new DaybookTimeScheduleItem(currentTime, endTime, _statusAvailable));
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
                    allItems = [...allItems, ...buildAvailableItems(currentTime, timeScheduleItems[i].startTime, delineators)];
                }
                currentTime = moment(timeScheduleItems[i].endTime);
                allItems.push(timeScheduleItems[i]);
            }
            if (currentTime.isBefore(this.endTime)) {
                allItems = [...allItems, ...buildAvailableItems(currentTime, this.endTime, delineators)];
            }
        }
        return allItems;
    }

    private _sortAndValidateScheduleItems(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
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
                console.log('Danger: no item should ever cross midnight: ' + timeScheduleItems[i].toString());
                // timeScheduleItems.forEach(item => console.log("  " + item.toString()))
            }
        }
        let overlappingItems: boolean = false;
        if (timeScheduleItems.length > 1) {
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (timeScheduleItems[i].startTime.isBefore(timeScheduleItems[i - 1].endTime)) {
                    overlappingItems = true;
                    console.log("Error: Overlapping items!")
                    console.log("  * " + timeScheduleItems[i - 1].toString())
                    console.log("  * " + timeScheduleItems[i].toString())
                    // timeScheduleItems.forEach((item) => console.log("  " + item.toString()))
                }
            }
        }
        return timeScheduleItems;
    }

    private _updateTimelogDelineators() {
        let nowLineCrossesTLE: boolean = false;
        const nowTime = moment().startOf('minute');
        const timelogDelineators: TimelogDelineator[] = [];
        const frameStartDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.FRAME_START);
        const fameEndDelineator = new TimelogDelineator(this.endTime, TimelogDelineatorType.FRAME_END);
        const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
        const fallAsleepDelineator = new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME);
        timelogDelineators.push(frameStartDelineator);
        timelogDelineators.push(wakeupDelineator);
        timelogDelineators.push(fallAsleepDelineator);
        timelogDelineators.push(fameEndDelineator);
        if (this._drawDelineators) {
            timelogDelineators.push(this._drawDelineators.start);
            timelogDelineators.push(this._drawDelineators.end);
        }
        this._activeDayController.savedTimeDelineators.forEach((timeDelineation) => {
            timelogDelineators.push(new TimelogDelineator(timeDelineation, TimelogDelineatorType.SAVED_DELINEATOR));
        });
        this._activeDayController.timelogEntryItems.forEach((timelogEntryItem) => {
            const timeDelineatorStart = new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
            const timeDelineatorEnd = new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
            timeDelineatorStart.nextDelineator = timeDelineatorEnd;
            timeDelineatorStart.timelogEntryStart = timelogEntryItem;
            timeDelineatorEnd.previousDelineator = timeDelineatorStart;
            timeDelineatorEnd.timelogEntryEnd = timelogEntryItem;
            timelogDelineators.push(timeDelineatorStart);
            timelogDelineators.push(timeDelineatorEnd);
            if (nowTime.isSameOrAfter(timelogEntryItem.startTime) && nowTime.isBefore(timelogEntryItem.endTime)) {
                nowLineCrossesTLE = true;
            }
        });
        if (this._activeDayController.isToday) {
            const nowDelineator = new TimelogDelineator(nowTime, TimelogDelineatorType.NOW)
            if (nowLineCrossesTLE) { nowDelineator.setNowLineCrossesTLE(); }
            timelogDelineators.push(nowDelineator);
        }
        const structureItems = this._addDayStructureDelineators(timelogDelineators);
        const sortedDelineators = this._sortDelineators(structureItems);
        this._displayDelineators = sortedDelineators;
    }

    private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
        let sortedDelineators = timelogDelineators
            .filter((delineator) => { return delineator.time.isSameOrAfter(this.startTime) && delineator.time.isSameOrBefore(this.endTime); })
            .sort((td1, td2) => {
                if (td1.time.isBefore(td2.time)) { return -1; }
                else if (td1.time.isAfter(td2.time)) { return 1; }
                else { return 0; }
            });
        const priority = [
            TimelogDelineatorType.FRAME_START,
            TimelogDelineatorType.FRAME_END,
            TimelogDelineatorType.DRAWING_TLE_START,
            TimelogDelineatorType.DRAWING_TLE_END,
            TimelogDelineatorType.WAKEUP_TIME,
            TimelogDelineatorType.FALLASLEEP_TIME,
            TimelogDelineatorType.TIMELOG_ENTRY_START,
            TimelogDelineatorType.TIMELOG_ENTRY_END,
            TimelogDelineatorType.NOW,
            TimelogDelineatorType.SAVED_DELINEATOR,
            TimelogDelineatorType.DAY_STRUCTURE,
        ];
        if (sortedDelineators.length > 0) {
            for (let i = 1; i < sortedDelineators.length; i++) {
                if (sortedDelineators[i].time.isSame(sortedDelineators[i - 1].time)) {
                    const thisPriorityIndex = priority.indexOf(sortedDelineators[i].delineatorType);
                    const prevPriorityIndex = priority.indexOf(sortedDelineators[i - 1].delineatorType);
                    // lower priority index is higher priority
                    if (thisPriorityIndex < prevPriorityIndex) {
                        sortedDelineators.splice(i - 1, 1);
                        i--;
                    } else if (thisPriorityIndex > prevPriorityIndex) {
                        sortedDelineators.splice(i, 1);
                        i--;
                    } else {
                        console.log("** Warning: duplicate DelineatorTypes");
                        console.log(sortedDelineators[i].toString() + " , " + sortedDelineators[i - 1].toString())
                    }
                }
            }
        }
        // Remove any DAY_STRUCTURE delineators if they are within an hour of any other.
        for (let i = 0; i < sortedDelineators.length; i++) {
            const thresholdMs = 1000 * 60 * 60 * 1; // 2 hours ;
            const sd = sortedDelineators[i];
            if (sd.delineatorType === TimelogDelineatorType.DAY_STRUCTURE) {
                let remove: boolean = false;
                if (i > 0) {
                    const diff = moment(sd.time).diff(sortedDelineators[i - 1].time, 'milliseconds');
                    if (diff < thresholdMs) {
                        // console.log("Removing DAY_STRUCTURE delineator " + sd.time.format('YYYY-MM-DD hh:mm a')
                        //     + " because prev delineator is within an hour");
                        remove = true;
                    }
                    if (sortedDelineators[i - 1].delineatorType === TimelogDelineatorType.DRAWING_TLE_END ||
                        sortedDelineators[i - 1].delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_START) {
                        remove = true;
                    }
                }
                if (!remove) {
                    if (i < sortedDelineators.length - 1) {
                        const diff = moment(sortedDelineators[i + 1].time).diff(sd.time, 'milliseconds');
                        if (diff < thresholdMs) {
                            // console.log("Removing DAY_STRUCTURE delineator " + sd.time.format('YYYY-MM-DD hh:mm a')
                            //     + "because next delineator is within an hour");
                            remove = true;
                        }
                    }
                }
                if (remove) {
                    sortedDelineators.splice(i, 1);
                    i--;
                }
            }
        }
        return sortedDelineators;
    }
    private _addDayStructureDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
        const structureType = TimelogDelineatorType.DAY_STRUCTURE;
        const structureDelineators = [
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(0).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(3).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(6).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(9).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(12).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(15).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(18).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(21).startOf('hour'), structureType),
            new TimelogDelineator(moment(this._activeDayController.dateYYYYMMDD).hour(24).startOf('hour'), structureType),
        ];
        return [...timelogDelineators, ...structureDelineators];
    }
}