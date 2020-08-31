import { DaybookTimeSchedule } from './daybook-time-schedule.class';
import { SleepCycleScheduleItemsBuilder } from '../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { DaybookDayItemController } from '../daybook-day-item-controller';
import { DaybookTimeScheduleSleepItem } from './daybook-time-schedule-sleep-item.class';
import { DaybookTimeScheduleActiveItem } from './daybook-time-schedule-active-item.class';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';
import * as moment from 'moment';
import { DaybookTimeScheduleAvailableItem } from './daybook-time-schedule-available-item.class';



export class DaybookTimeScheduleBuilder {
    /**
     * The purpose of this class is to export all code related to the construction of the DaybookTimeSchedule,
     * so that the DaybookTimeSchedule class can be focused on the actual behavior and properties.
     */
    constructor() { }

    private _dateYYYYMMDD: string;
    private _sleepCycleBuilder: SleepCycleScheduleItemsBuilder;
    private _daybookController: DaybookDayItemController;
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;


    /**
     * The construction of the time schedule, which is fundamentally just an array of DaybookTimeScheduleItems,
     * the items are either SLEEP or ACTIVE or AVAILABLE.
     *
     * Take existing SLEEP items (from sleep manager / sleep cycle),
     * Take timelog ACTIVE items (timelog entries from daybook controller),
     * The remainder is AVAILABLE.  Of the AVAILABLE items, split them across the appropriate delineators.
     *
     * @param dateYYYYMMDD
     * @param startTime
     * @param endTime
     * @param sleepCycle
     * @param daybookController
     */
    public buildDaybookSchedule(dateYYYYMMDD: string, startTime: moment.Moment, endTime: moment.Moment,
        sleepCycle: SleepCycleScheduleItemsBuilder, daybookController: DaybookDayItemController): DaybookTimeSchedule {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._startTime = startTime;
        this._endTime = endTime;
        this._sleepCycleBuilder = sleepCycle;
        this._daybookController = daybookController;
        const sleepItems: DaybookTimeScheduleSleepItem[] = sleepCycle.get72HourSleepDataItems(dateYYYYMMDD);
        const activeItems: DaybookTimeScheduleActiveItem[] = daybookController.timelogEntryItems.map(item => {
            return new DaybookTimeScheduleActiveItem(item.startTime, item.endTime, item.toDataEntryItem());
        });
        // console.log("***   SLEEP ITEMS ARE:")
        // sleepItems.forEach(si => console.log("   " + si.toString()))
        // console.log("***   ACTIVE TLE ITEMS ARE:")
        // activeItems.forEach(si => console.log("   " + si.toString()))
        const availableItems: DaybookTimeScheduleAvailableItem[] = this._populateAvailableScheduleItems(
            this._sortAndValidateScheduleItems([...sleepItems, ...activeItems]));
        // console.log("***   AVBAILABLE ITEMS ARE:")
        // availableItems.forEach(si => console.log("   " + si.toString()))
        const scheduleItems = this._sortAndValidateScheduleItems([...sleepItems, ...activeItems, ...availableItems]);
        for (let i = 0; i < scheduleItems.length; i++) {
            if (i > 0) {
                scheduleItems[i].setItemIndex(i, scheduleItems[i - 1]);
            } else {
                scheduleItems[i].setItemIndex(i);
            }
        }
        return new DaybookTimeSchedule(dateYYYYMMDD, startTime, endTime, scheduleItems, sleepCycle);
    }



    /**
     * @param timeScheduleItems an array containing all SLEEP items and TIMELOG ENTRY items,
     * representing all time ranges which are NOT AVAILABLE
     *
     * returns the completed full array containing time ranges that ARE available and time ranges that ARE NOT available.
     */
    private _populateAvailableScheduleItems(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleAvailableItem[] {
        const splitThisAvailableItem = function (startTime: moment.Moment, endTime: moment.Moment,
            delineators: TimelogDelineator[]): DaybookTimeScheduleAvailableItem[] {
            const relevantDelineators: TimelogDelineator[] = delineators.filter(item => {
                const isInRange = item.time.isSameOrAfter(startTime) && item.time.isSameOrBefore(endTime);
                if (isInRange) {
                    if (item.delineatorType === TimelogDelineatorType.DAY_STRUCTURE) {
                        const thresholdStart = moment(startTime).add(60, 'minutes');
                        const thresholdEnd = moment(endTime).subtract(60, 'minutes');
                        if (item.time.isSameOrAfter(thresholdStart) && item.time.isSameOrBefore(thresholdEnd)) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
                return false;
            });
            const startDelineator = new TimelogDelineator(startTime, TimelogDelineatorType.AVAILABLE_ITEM_START);
            const endDelineator = new TimelogDelineator(endTime, TimelogDelineatorType.AVALABLE_ITEM_END);
            if (relevantDelineators.length === 0) {
                return [new DaybookTimeScheduleAvailableItem(startDelineator, endDelineator)];
            } else if (relevantDelineators.length === 1) {
                return [
                    new DaybookTimeScheduleAvailableItem(startDelineator, relevantDelineators[0]),
                    new DaybookTimeScheduleAvailableItem(relevantDelineators[0], endDelineator),
                ];
            } else if (relevantDelineators.length > 1) {
                let currentItem: TimelogDelineator = startDelineator;
                const splitAvailableItems: DaybookTimeScheduleAvailableItem[] = [];
                for (let i = 0; i < relevantDelineators.length; i++) {
                    splitAvailableItems.push(new DaybookTimeScheduleAvailableItem(currentItem, relevantDelineators[i]));
                    currentItem = relevantDelineators[i];
                }
                splitAvailableItems.push(new DaybookTimeScheduleAvailableItem(currentItem, endDelineator));
                return splitAvailableItems;
            }
        };
        const splitDelineators: TimelogDelineator[] = this._getSplitDelineators();
        // console.log("SPLIT DELINEATORS")
        // splitDelineators.forEach(item => console.log("  " + item.toString()))
        let currentTime: moment.Moment = moment(this._startTime);
        let allItems: DaybookTimeScheduleAvailableItem[] = [];
        if (timeScheduleItems.length === 0) {
            allItems = splitThisAvailableItem(this._startTime, this._endTime, splitDelineators);
        } else {
            for (let i = 0; i < timeScheduleItems.length; i++) {
                if (currentTime.isBefore(timeScheduleItems[i].startTime)) {
                    allItems = [...allItems, ...splitThisAvailableItem(currentTime, timeScheduleItems[i].startTime, splitDelineators)];
                }
                currentTime = moment(timeScheduleItems[i].endTime);
            }
            if (currentTime.isBefore(this._endTime)) {
                allItems = [...allItems, ...splitThisAvailableItem(currentTime, this._endTime, splitDelineators)];
            }
        }
        // console.log("ALL AVAILABLE ITEMS: ")
        // allItems.forEach(item => console.log(item.startDelineator, item.endDelineator))
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
        let overlappingItems = false;
        if (timeScheduleItems.length > 1) {
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (timeScheduleItems[i].startTime.isBefore(timeScheduleItems[i - 1].endTime)) {
                    overlappingItems = true;
                    console.log('Error: Overlapping items!');
                    console.log('  * ' + timeScheduleItems[i - 1].toString());
                    console.log('  * ' + timeScheduleItems[i].toString());
                    // timeScheduleItems.forEach((item) => console.log("  " + item.toString()))
                }
            }
        }
        return timeScheduleItems;
    }
    private _getSplitDelineators(): TimelogDelineator[] {
        const typeStructure = TimelogDelineatorType.DAY_STRUCTURE;
        const typeMidnight = TimelogDelineatorType.DAY_STRUCTURE_MIDNIGHT;
        const structureDelineators: TimelogDelineator[] = [
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(3).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(6).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(9).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(12).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(15).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(18).startOf('hour'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(21).startOf('hour'), typeStructure),
        ];
        const midnightDelineators: TimelogDelineator[] = [
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').subtract(24, 'hours'), typeMidnight),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day'), typeMidnight),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'), typeMidnight),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').add(48, 'hours'), typeMidnight),
        ];
        const nowDelineator: TimelogDelineator = new TimelogDelineator(moment().startOf('minute'), TimelogDelineatorType.NOW);
        const savedDelineators: TimelogDelineator[] = this._daybookController.savedDelineatorTimes.map(item => {
            return new TimelogDelineator(item, TimelogDelineatorType.SAVED_DELINEATOR);
        });
        return [nowDelineator, ...structureDelineators, ...midnightDelineators, ...savedDelineators].sort((d1, d2) => {
            if (d1.time.isBefore(d2.time)) {
                return -1;
            } else if (d1.time.isAfter(d2.time)) {
                return 1;
            } else {
                return 0;
            }
        }).filter(item => {
            if (item.delineatorType === TimelogDelineatorType.DAY_STRUCTURE) {
                const thresholdStart = moment(nowDelineator.time).subtract(59, 'minutes');
                const thresholdEnd = moment(nowDelineator.time).add(59, 'minutes');
                if (item.time.isSameOrAfter(thresholdStart) && item.time.isSameOrBefore(thresholdEnd)) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        });
    }

}
