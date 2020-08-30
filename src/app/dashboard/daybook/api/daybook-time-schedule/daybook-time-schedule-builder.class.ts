import { DaybookTimeSchedule } from './daybook-time-schedule.class';
import { SleepCycleScheduleItemsBuilder } from '../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';
import { DaybookDayItemController } from '../daybook-day-item-controller';
import { DaybookTimeScheduleSleepItem } from './daybook-time-schedule-sleep-item.class';
import { DaybookTimeScheduleActiveItem } from './daybook-time-schedule-active-item.class';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-delineator.class';
import * as moment from 'moment';
import { DaybookTimeScheduleAvailableItem } from './daybook-time-schedule-available-item.class';



export class DaybookTimeScheduleBuilder {
    /**
     * The purpose of this class is to export all code related to the construction of the DaybookTimeSchedule,
     * so that the DaybookTimeSchedule class can be focused on the actual behavior and properties.
     */
    constructor() {
    }

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
        console.log("***   SLEEP ITEMS ARE:")
        sleepItems.forEach(si => console.log("   " + si.toString()))
        console.log("***   ACTIVE TLE ITEMS ARE:")
        activeItems.forEach(si => console.log("   " + si.toString()))
        const availableItems: DaybookTimeScheduleAvailableItem[] = this._populateAvailableScheduleItems([...sleepItems, ...activeItems]);
        console.log("***   AVBAILABLE ITEMS ARE:")
        availableItems.forEach(si => console.log("   " + si.toString()))
        const scheduleItems = this._sortAndValidateScheduleItems([...sleepItems, ...activeItems, ...availableItems]);

        for (let i = 0; i < scheduleItems.length; i++) {
            if (i > 0) {
                scheduleItems[i].setItemIndex(i, scheduleItems[i - 1]);
            } else {
                scheduleItems[i].setItemIndex(i);
            }
        }
        console.log("SCHEDULE ITEMS BUILT");
        scheduleItems.forEach(item => { console.log("   " + item.toString()) })


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
                const isInRange: boolean = item.time.isAfter(startTime) && item.time.isBefore(endTime);
                const isDayStructure: boolean = item.delineatorType === TimelogDelineatorType.DAY_STRUCTURE;
                if (isInRange) {
                    if (!isDayStructure) {
                        return;
                    } else {
                        // if there is a day structure delineator, and it is within an hour of start or end time, ignore it.
                        const structureItemsThresholdMinutes = 60;
                        const structureItemsStartTime = moment(startTime).add(structureItemsThresholdMinutes, 'minutes');
                        const structureItemsEndTime = moment(endTime).subtract(structureItemsThresholdMinutes, 'minutes');
                        const structureItemIsInRange: boolean = item.time.isSameOrAfter(structureItemsStartTime)
                            && item.time.isSameOrBefore(structureItemsEndTime);
                        return structureItemIsInRange;
                    }
                }
            });
            const startItem = new TimelogDelineator(startTime, TimelogDelineatorType.SCHEDULE_START);
            const endItem = new TimelogDelineator(endTime, TimelogDelineatorType.SCHEDULE_END);
            if (relevantDelineators.length === 0) {
                return [new DaybookTimeScheduleAvailableItem(startItem, endItem)];
            } else if (relevantDelineators.length === 1) {
                return [
                    new DaybookTimeScheduleAvailableItem(startItem, relevantDelineators[0]),
                    new DaybookTimeScheduleAvailableItem(relevantDelineators[0], endItem),
                ];
            } else if (relevantDelineators.length > 1) {
                let currentItem: TimelogDelineator = startItem;
                const splitAvailableItems: DaybookTimeScheduleAvailableItem[] = [];
                for (let i = 0; i < relevantDelineators.length; i++) {
                    splitAvailableItems.push(new DaybookTimeScheduleAvailableItem(currentItem, relevantDelineators[i]));
                    currentItem = relevantDelineators[i];
                }
                splitAvailableItems.push(new DaybookTimeScheduleAvailableItem(currentItem, endItem));
                return splitAvailableItems;
            }
        };
        const splitDelineators: TimelogDelineator[] = this._getSplitDelineators();
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
        const nowDelineator: TimelogDelineator = new TimelogDelineator(moment(), TimelogDelineatorType.NOW);
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
        });
    }















    /**
     * Start by building all conceivable delineators of the schedule.
     *      e.g.
     *      --start time & end time,
     *      --Timelog Entry start and end times,
     *      --Sleep entry start and end times,
     *      --saved delineators,
     *      --day structure (0, 6, 12, 18, 24/midnight)
     *
     */
    // private _updateDelineators() {
    //     let nowLineCrossesTLE: boolean = false;

    //     const nowTime = moment().startOf('minute');
    //     const timelogDelineators: TimelogDelineator[] = [];
    //     this._daybookController.savedDelineatorTimes.forEach((time: moment.Moment) => {
    //         timelogDelineators.push(new TimelogDelineator(time, TimelogDelineatorType.SAVED_DELINEATOR));
    //     });
    //     if (this._daybookController.isToday) {
    //         const nowDelineator = new TimelogDelineator(nowTime, TimelogDelineatorType.NOW);
    //         if (nowLineCrossesTLE) { nowDelineator.setNowLineCrossesTLE(); }
    //         timelogDelineators.push(nowDelineator);
    //     }
    //     // const frameStartDelineator = new TimelogDelineator(this.startTime, TimelogDelineatorType.SCHEDULE_START);
    //     // const fameEndDelineator = new TimelogDelineator(this.endTime, TimelogDelineatorType.SCHEDULE_START);


    //     // const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
    //     // const fallAsleepDelineator = new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME);

    //     // timelogDelineators.push(frameStartDelineator);
    //     // timelogDelineators.push(wakeupDelineator);
    //     // timelogDelineators.push(fallAsleepDelineator);
    //     // timelogDelineators.push(fameEndDelineator);

    //     // console.log("Disabled the DRAW delineators on this class for now.")
    //     // if (this._drawDelineators) {
    //     //     timelogDelineators.push(this._drawDelineators.start);
    //     //     timelogDelineators.push(this._drawDelineators.end);
    //     // }




    //     // this._daybookController.timelogEntryItems.forEach((timelogEntryItem) => {
    //     //     const timeDelineatorStart = new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
    //     //     const timeDelineatorEnd = new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
    //     //     timeDelineatorStart.nextDelineator = timeDelineatorEnd;
    //     //     timeDelineatorStart.timelogEntryStart = timelogEntryItem;
    //     //     timeDelineatorEnd.previousDelineator = timeDelineatorStart;
    //     //     timeDelineatorEnd.timelogEntryEnd = timelogEntryItem;
    //     //     timelogDelineators.push(timeDelineatorStart);
    //     //     timelogDelineators.push(timeDelineatorEnd);
    //     //     if (nowTime.isSameOrAfter(timelogEntryItem.startTime) && nowTime.isBefore(timelogEntryItem.endTime)) {
    //     //         nowLineCrossesTLE = true;
    //     //     }
    //     // });



    //     const structureItems = this._addDayStructureDelineators(timelogDelineators);
    //     const sortedDelineators = this._sortDelineators(structureItems);
    //     this._scheduleDelineators = sortedDelineators;
    // }





    // private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
    //     let sortedDelineators = timelogDelineators.filter((delineator) => {
    //         return delineator.time.isSameOrAfter(this.startTime) && delineator.time.isSameOrBefore(this.endTime);
    //     }).sort((td1, td2) => {
    //         if (td1.time.isBefore(td2.time)) { return -1; }
    //         else if (td1.time.isAfter(td2.time)) { return 1; }
    //         else { return 0; }
    //     });
    //     const priority = [
    //         TimelogDelineatorType.SCHEDULE_START,
    //         TimelogDelineatorType.SCHEDULE_END,
    //         TimelogDelineatorType.DISPLAY_START,
    //         TimelogDelineatorType.DISPLAY_END,
    //         TimelogDelineatorType.DRAWING_TLE_START,
    //         TimelogDelineatorType.DRAWING_TLE_END,
    //         TimelogDelineatorType.WAKEUP_TIME,
    //         TimelogDelineatorType.FALLASLEEP_TIME,
    //         TimelogDelineatorType.TIMELOG_ENTRY_START,
    //         TimelogDelineatorType.TIMELOG_ENTRY_END,
    //         TimelogDelineatorType.NOW,
    //         TimelogDelineatorType.SAVED_DELINEATOR,
    //         TimelogDelineatorType.DAY_STRUCTURE,
    //     ];
    //     if (sortedDelineators.length > 0) {
    //         for (let i = 1; i < sortedDelineators.length; i++) {
    //             if (sortedDelineators[i].time.isSame(sortedDelineators[i - 1].time)) {
    //                 const thisPriorityIndex = priority.indexOf(sortedDelineators[i].delineatorType);
    //                 const prevPriorityIndex = priority.indexOf(sortedDelineators[i - 1].delineatorType);
    //                 // lower priority index is higher priority
    //                 if (thisPriorityIndex < prevPriorityIndex) {
    //                     sortedDelineators.splice(i - 1, 1);
    //                     i--;
    //                 } else if (thisPriorityIndex > prevPriorityIndex) {
    //                     sortedDelineators.splice(i, 1);
    //                     i--;
    //                 } else {
    //                     console.log("** Warning: duplicate DelineatorTypes");
    //                     sortedDelineators.splice(i, 1);
    //                     console.log(sortedDelineators[i].toString() + " , " + sortedDelineators[i - 1].toString())
    //                 }
    //             }
    //         }
    //     }
    //     // Remove any DAY_STRUCTURE delineators if they are within an hour of any other.
    //     for (let i = 0; i < sortedDelineators.length; i++) {
    //         const thresholdMs = 1000 * 60 * 60 * 1; // 2 hours ;
    //         const sd = sortedDelineators[i];
    //         if (sd.delineatorType === TimelogDelineatorType.DAY_STRUCTURE) {
    //             let remove: boolean = false;
    //             if (i > 0) {
    //                 const diff = moment(sd.time).diff(sortedDelineators[i - 1].time, 'milliseconds');
    //                 if (diff < thresholdMs) {
    //                     // console.log("Removing DAY_STRUCTURE delineator " + sd.time.format('YYYY-MM-DD hh:mm a')
    //                     //     + " because prev delineator is within an hour");
    //                     remove = true;
    //                 }
    //                 if (sortedDelineators[i - 1].delineatorType === TimelogDelineatorType.DRAWING_TLE_END ||
    //                     sortedDelineators[i - 1].delineatorType === TimelogDelineatorType.TIMELOG_ENTRY_START) {
    //                     remove = true;
    //                 }
    //             }
    //             if (!remove) {
    //                 if (i < sortedDelineators.length - 1) {
    //                     const diff = moment(sortedDelineators[i + 1].time).diff(sd.time, 'milliseconds');
    //                     if (diff < thresholdMs) {
    //                         // console.log("Removing DAY_STRUCTURE delineator " + sd.time.format('YYYY-MM-DD hh:mm a')
    //                         //     + "because next delineator is within an hour");
    //                         remove = true;
    //                     }
    //                 }
    //             }
    //             if (remove) {
    //                 sortedDelineators.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //     }
    //     return sortedDelineators;
    // }


}
