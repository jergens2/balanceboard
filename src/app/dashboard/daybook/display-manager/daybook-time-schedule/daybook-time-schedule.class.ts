import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import { TimelogDelineator } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';
import { TimeSchedule } from '../../../../shared/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { TimeRangeRelationship } from '../../../../shared/time-utilities/time-range-relationship.enum';
import { SleepCycleScheduleItemsBuilder } from '../../sleep-manager/sleep-cycle/sleep-cycle-schedule-items-builder.class';

export class DaybookTimeSchedule extends TimeSchedule {


    private _dateYYYYMMDD: string;
    private _timeScheduleItems: DaybookTimeScheduleItem[] = [];
    private _sleepCycle: SleepCycleScheduleItemsBuilder;

    /**
     * This class manages the schedule items for the Daybook / Timelog.
     * From this class, the DaybookDisplayManager is able to create the rest of the required pieces for 
     * displaying the daybook component.
     *
     * The schedule is a 72 hour period from the start of prev day to end of next day, 
     *
     * @param dateYYYYMMDD reference date
     * @param startTime beginning of the schedule.  required for super()
     * @param endTime end of the schedule.  required for super()
     */

    constructor(dateYYYYMMDD: string, startTime: moment.Moment, endTime: moment.Moment,
        items: DaybookTimeScheduleItem[], sleepCycle: SleepCycleScheduleItemsBuilder) {
        super(startTime, endTime);
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._timeScheduleItems = items;
        this._sleepCycle = sleepCycle;
        // console.log("Time schedule constructed:")
        // this._timeScheduleItems.forEach(item => console.log("\t" + item.toString()))
    }

    public get timeScheduleItems(): DaybookTimeScheduleItem[] { return this._timeScheduleItems; }
    public get dateYYYYMMDD(): string { return this._dateYYYYMMDD; }
    public get startOfThisDay(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day'); }
    public get endOfThisDay(): moment.Moment { return moment(this.startOfThisDay).add(24, 'hours'); }
    public get sleepCycle(): SleepCycleScheduleItemsBuilder { return this._sleepCycle; }



    /**
     *  Grab a subset / slice of the range of items.
     *  the schedule items 
     * 
     */
    public getItemsInRange(startTime: moment.Moment, endTime: moment.Moment): DaybookTimeScheduleItem[] {
        const checkRange = new TimeScheduleItem(startTime.toISOString(), endTime.toISOString());
        let inRangeItems: DaybookTimeScheduleItem[] = [];
        // console.log("getting items.  from: " + startTime.format('YYYY-MM-DD hh:mm a') + " to: " + endTime.format('YYYY-MM-DD hh:mm a')
        //     + " -- time sched items are")
        // this.timeScheduleItems.forEach(item => console.log(item.toString()))
        if (startTime.isSameOrAfter(this.startTime) && endTime.isSameOrBefore(this.endTime)) {
            this.timeScheduleItems.forEach(item => {
                const newItem = item.clone();
                inRangeItems.push(newItem);
            });
            inRangeItems = inRangeItems.filter(item => {
                const relationship = item.getRelationshipTo(checkRange);
                return relationship === TimeRangeRelationship.OVERLAPS;
            });
            for (let i = 0; i < inRangeItems.length; i++) {
                if (inRangeItems[i].schedItemStartTime.isBefore(startTime)) {
                    inRangeItems[i].changeSchedItemStartTime(startTime);
                }
                if (inRangeItems[i].schedItemEndTime.isAfter(endTime)) {
                    inRangeItems[i].changeSchedItemEndTime(endTime);
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
        const foundItem = this._timeScheduleItems.find(item => timeToCheck.isSameOrAfter(item.schedItemStartTime) && timeToCheck.isBefore(item.schedItemEndTime))
        if (foundItem) {
            return foundItem.scheduleStatus;
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
            if (startTime.isSameOrAfter(item.schedItemStartTime) && endTime.isSameOrBefore(item.schedItemEndTime)) {
                isRangeAvailable = true;
            } else if (startTime.isSameOrAfter(item.schedItemStartTime) && endTime.isAfter(item.schedItemEndTime)) {
                const duration = moment(item.schedItemEndTime).diff(moment(startTime), 'milliseconds');
                isRangeAvailable = (duration > (0.5 * totalMS));
            } else if (startTime.isBefore(item.schedItemStartTime) && endTime.isAfter(item.schedItemEndTime)) {
                const duration = moment(endTime).diff(moment(item.schedItemStartTime), 'milliseconds');
                isRangeAvailable = (duration > (0.5 * totalMS));
            } else {

            }
        });
        return isRangeAvailable;
    }
    public getAvailableScheduleItems(): DaybookTimeScheduleItem[] {
        return this._timeScheduleItems.filter(item => item.scheduleStatus === DaybookTimeScheduleStatus.AVAILABLE);
    }

    public onCreateNewTimelogEntry(drawStartDel: TimelogDelineator, drawEndDel: TimelogDelineator) {
        console.log("onCreateNewTimelogEntry() METHOD DISABLED")
    }


}
