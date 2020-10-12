import { DaybookTimeSchedule } from './daybook-time-schedule.class';
import { SleepCycleScheduleItemsBuilder } from '../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { DaybookTimeScheduleSleepItem } from './daybook-time-schedule-sleep-item.class';
import { DaybookTimeScheduleActiveItem } from './daybook-time-schedule-active-item.class';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';
import * as moment from 'moment';
import { DaybookTimeScheduleAvailableItem } from './daybook-time-schedule-available-item.class';
import { DaybookDayItemController } from '../../daybook-day-item/daybook-day-item-controller';
import { DTSTimeLimiterSetter } from './dts-time-limiter-setter.class';



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
     * The remainder is AVAILABLE.  Of the AVAILABLE items, split them across the appropriate splitter delineators.
     *
     * @param dateYYYYMMDD
     * @param startTime
     * @param endTime
     * @param sleepCycle
     * @param daybookController
     */
    public buildDaybookSchedule(dateYYYYMMDD: string, startTime: moment.Moment, endTime: moment.Moment,
        sleepCycle: SleepCycleScheduleItemsBuilder, daybookController: DaybookDayItemController,
        drawnItem?: DaybookTimeScheduleActiveItem): DaybookTimeSchedule {
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._startTime = startTime;
        this._endTime = endTime;
        this._sleepCycleBuilder = sleepCycle;
        this._daybookController = daybookController;
        const sleepItems: DaybookTimeScheduleSleepItem[] = sleepCycle.get72HourSleepDataItems(dateYYYYMMDD);
        const activeItems: DaybookTimeScheduleActiveItem[] = daybookController.timelogEntryItems.map(item => {
            return new DaybookTimeScheduleActiveItem(item.startTime, item.endTime, item.toDataEntryItem());
        });
        if (drawnItem) {
            activeItems.push(drawnItem);
        }
        // console.log("***   SLEEP ITEMS ARE:")
        // sleepItems.forEach(si => console.log("   " + si.toString()))
        // console.log("***   ACTIVE TLE ITEMS ARE:")
        // activeItems.forEach(si => console.log("   " + si.toString()))
        const availableItems: DaybookTimeScheduleAvailableItem[] = this._populateAvailableScheduleItems(
            this._sortAndValidateScheduleItems([...sleepItems, ...activeItems]));
        // console.log("***   AVBAILABLE ITEMS ARE:")
        // availableItems.forEach(si => console.log("   " + si.toString()))
        const combinedScheduleItems = this._sortAndValidateScheduleItems([...sleepItems, ...activeItems, ...availableItems]);
        for (let i = 0; i < combinedScheduleItems.length; i++) {
            if (i > 0) {
                combinedScheduleItems[i].setItemIndex(i, combinedScheduleItems[i - 1]);
            } else {
                combinedScheduleItems[i].setItemIndex(i);
            }
        }
        const limiterSetter: DTSTimeLimiterSetter = new DTSTimeLimiterSetter(combinedScheduleItems);
        const finalizedItems = limiterSetter.finalizedItems;

        return new DaybookTimeSchedule(dateYYYYMMDD, startTime, endTime, finalizedItems, sleepCycle);
    }



    /**
     * @param timeScheduleItems an array containing all SLEEP items and TIMELOG ENTRY items,
     * representing all time ranges which are NOT AVAILABLE
     *
     * returns the completed full array containing time ranges that ARE available and time ranges that ARE NOT available.
     */
    private _populateAvailableScheduleItems(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleAvailableItem[] {
        let existingItemTimes = [
            ...timeScheduleItems.map(item => item.schedItemStartTime),
            ...timeScheduleItems.map(item => item.schedItemEndTime),
        ];
        const removedDuplicates: moment.Moment[] = [];
        existingItemTimes.forEach(existingItem => {
            if (!removedDuplicates.find(d => d.isSame(existingItem))) {
                removedDuplicates.push(existingItem);
            }
        });
        existingItemTimes = removedDuplicates;
        const splitDelineators: TimelogDelineator[] = this._getSplitterDelineators(existingItemTimes);

        let currentTime: moment.Moment = moment(this._startTime);
        let allItems: DaybookTimeScheduleAvailableItem[] = [];
        if (timeScheduleItems.length === 0) {
            allItems = this._splitThisAvailableItem(this._startTime, this._endTime, splitDelineators);
        } else {
            for (let i = 0; i < timeScheduleItems.length; i++) {
                if (currentTime.isBefore(timeScheduleItems[i].schedItemStartTime)) {
                    allItems = [
                        ...allItems,
                        ...this._splitThisAvailableItem(currentTime, timeScheduleItems[i].schedItemStartTime, splitDelineators)
                    ];
                }
                currentTime = moment(timeScheduleItems[i].schedItemEndTime);
            }
            if (currentTime.isBefore(this._endTime)) {
                allItems = [...allItems, ...this._splitThisAvailableItem(currentTime, this._endTime, splitDelineators)];
            }
        }
        // console.log("ALL AVAILABLE ITEMS: ")
        // allItems.forEach(item => console.log(item.startDelineator, item.endDelineator))
        return allItems;
    }
    private _splitThisAvailableItem(startTime: moment.Moment, endTime: moment.Moment,
        delineators: TimelogDelineator[]): DaybookTimeScheduleAvailableItem[] {
        const relevantDelineators: TimelogDelineator[] = delineators.filter(item => {
            const isInRange = item.time.isSameOrAfter(startTime) && item.time.isSameOrBefore(endTime);
            return isInRange;
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
    }


    private _sortAndValidateScheduleItems(timeScheduleItems: DaybookTimeScheduleItem[]): DaybookTimeScheduleItem[] {
        timeScheduleItems = timeScheduleItems.sort((item1, item2) => {
            if (item1.schedItemStartTime.isBefore(item2.schedItemStartTime)) {
                return -1;
            } else if (item1.schedItemStartTime.isAfter(item2.schedItemStartTime)) {
                return 1;
            } else {
                return 0;
            }
        });
        let overlappingItems = false;
        if (timeScheduleItems.length > 1) {
            for (let i = 1; i < timeScheduleItems.length; i++) {
                if (timeScheduleItems[i].schedItemStartTime.isBefore(timeScheduleItems[i - 1].schedItemEndTime)) {
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



    /** This method exists to get the set of all times with which to split any AVAILABLE timespaces. */
    private _getSplitterDelineators(scheduleItemTimes: moment.Moment[]): TimelogDelineator[] {
        const typeStructure = TimelogDelineatorType.DAY_STRUCTURE;
        const structureDelineators: TimelogDelineator[] = [
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').subtract(24, 'hours'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(3), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(6), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(9), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(12), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(15), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(18), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').hour(21), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').add(24, 'hours'), typeStructure),
            new TimelogDelineator(moment(this._dateYYYYMMDD).startOf('day').add(48, 'hours'), typeStructure),
        ];

        const nowDelineator: TimelogDelineator = new TimelogDelineator(moment().startOf('minute'), TimelogDelineatorType.NOW);
        const savedDelineators: TimelogDelineator[] = this._daybookController.savedDelineatorTimes.map(item => {
            return new TimelogDelineator(item, TimelogDelineatorType.SAVED_DELINEATOR);
        });

        let allSplitters: TimelogDelineator[] = [];

        if (!scheduleItemTimes.find(item => item.isSame(nowDelineator.time))) {
            allSplitters.push(nowDelineator);
        }
        savedDelineators.forEach(savedDel => {
            if (!scheduleItemTimes.find(item => item.isSame(savedDel.time))) {
                if (!allSplitters.find(splitter => splitter.time.isSame(savedDel.time))) {
                    allSplitters.push(savedDel);
                }
            }
        });
        structureDelineators.forEach(structure => {
            if (!scheduleItemTimes.find(item => item.isSame(structure.time))) {
                if (!allSplitters.find(splitter => splitter.time.isSame(structure.time))) {
                    const cutoffMin = 60;
                    let isOutOfRange: boolean = true;
                    const rangeTimes = [...scheduleItemTimes, ...allSplitters.map(item => item.time)].sort((d1, d2) => {
                        if (d1.isBefore(d2)) { return -1; }
                        else if (d1.isAfter(d2)) { return 1; }
                        else { return 0; }
                    });
                    for (let i = 0; i < rangeTimes.length; i++) {
                        const start = moment(rangeTimes[i]).subtract(cutoffMin, 'minutes');
                        const end = moment(rangeTimes[i]).add(cutoffMin, 'minutes');
                        if (structure.time.isSameOrAfter(start) && structure.time.isSameOrBefore(end)) {
                            isOutOfRange = false;
                            i = rangeTimes.length + 1;
                        }
                    }
                    if (isOutOfRange) {
                        allSplitters.push(structure);
                    }
                }
            }
        });
        allSplitters = allSplitters.sort((d1, d2) => {
            if (d1.time.isBefore(d2.time)) {
                return -1;
            } else if (d1.time.isAfter(d2.time)) {
                return 1;
            } else {
                return 0;
            }
        });
        // console.log("ALL SPLITTERS:  ")
        // allSplitters.forEach(item => 
        //     console.log("   SPLITTER: " + item.time.format('YYYY-MM-DD hh:mm a') + " (" + item.delineatorType + ")"));
        return allSplitters;
    }

}
