import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import * as moment from 'moment';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';
import { SleepEntryItem } from '../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { TimelogEntryItem } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimeScheduleSleepItem } from './daybook-time-schedule-sleep-item.class';
import { DaybookTimeScheduleActiveItem } from './daybook-time-schedule-active-item.class';
import { DTSItemTimeLimiter } from './dts-item-time-limiter.class';

export class DaybookTimeScheduleItem extends TimeScheduleItem {

    protected _scheduleStatus: DaybookTimeScheduleStatus;
    protected _itemIndex: number = -1;

    protected _startDelineator: TimelogDelineator;
    protected _endDelineator: TimelogDelineator;

    protected _sleepEntry: SleepEntryItem;
    protected _timelogEntry: TimelogEntryItem;

    protected _displayPercent: number = 0;


    protected _timeLimiter: DTSItemTimeLimiter;

    protected _actualStartTime: moment.Moment;
    protected _actualEndTime: moment.Moment;


    public get sleepEntry(): SleepEntryItem { return this._sleepEntry; }
    public get timelogEntry(): TimelogEntryItem { return this._timelogEntry; }

    /** the 'actual' start and end time refer to, for example, that even though the sleep schedule item on the display is 7:00am to 7:30, 
     * the sleep item actually started at 10:30pm previously */
    public get actualStartTime(): moment.Moment { return this._actualStartTime; }
    public get actualEndTime(): moment.Moment { return this._actualEndTime; }
    public get startDelineator(): TimelogDelineator { return this._startDelineator; }
    public get endDelineator(): TimelogDelineator { return this._endDelineator; }
    public set startDelineator(delineator: TimelogDelineator) { this._startDelineator = delineator; }
    public set endDelineator(delineator: TimelogDelineator) { this._endDelineator = delineator; }

    public get timeLimiter(): DTSItemTimeLimiter { return this._timeLimiter; }


    public get displayPercent(): number { return this._displayPercent; }

    public get scheduleStatus(): DaybookTimeScheduleStatus { return this._scheduleStatus; }

    public get isSleepItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.SLEEP; }
    public get isActiveItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.ACTIVE; }
    public get isAvailableItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.AVAILABLE; }
    // public set scheduleStatus(status: DaybookTimeScheduleStatus) { this._scheduleStatus = status; }
    public get itemIndex(): number { return this._itemIndex; }
    public setItemIndex(index: number, previousItem?: DaybookTimeScheduleItem) {
        this._itemIndex = index;
        // if (previousItem && this.isAvailableItem) {
        //     if (!previousItem.isAvailableItem) {
        //         this._startDelineator = previousItem.endDelineator;
        //     }
        // }
    }
    public setTimeLimiter(timeLimiter: DTSItemTimeLimiter) {
        this._timeLimiter = timeLimiter;
        this._actualStartTime = moment(this._timeLimiter.startTime);
        this._actualEndTime = moment(this._timeLimiter.endTime);
    }

    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        super(startTime.toISOString(), endTime.toISOString(), startTime.utcOffset(), endTime.utcOffset());
        this._startDelineator = new TimelogDelineator(startTime, TimelogDelineatorType.DEFAULT);
        this._endDelineator = new TimelogDelineator(endTime, TimelogDelineatorType.DEFAULT);
        this._timeLimiter = new DTSItemTimeLimiter(startTime, endTime);
        this._actualStartTime = moment(startTime);
        this._actualEndTime = moment(endTime);
        this._scheduleStatus = DaybookTimeScheduleStatus.AVAILABLE;
    }

    public setDisplayPercent(totalViewMs: number) { this._displayPercent = (this.durationMs / totalViewMs) * 100; }

    public toString(): string {
        const val = this.itemIndex + "\t" + this.schedItemStartTime.format('YYYY-MM-DD hh:mm a')
            + ' to ' + this.schedItemEndTime.format('YYYY-MM-DD hh:mm a') +
            '\t' + this.scheduleStatus + '\n';
        return val;
    }

    public changeSchedItemStartTime(time: moment.Moment) {
        super.changeSchedItemStartTime(time);
        this._startDelineator.time = moment(time);
    }

    public changeSchedItemEndTime(time: moment.Moment) {
        super.changeSchedItemEndTime(time);
        this._endDelineator.time = moment(time);
    }

    // public changeActualStartTime(time: moment.Moment) { this._actualStartTime = moment(time); }
    // public changeActualEndTime(time: moment.Moment) { this._actualEndTime = moment(time); }

    public clone(): DaybookTimeScheduleItem {
        const clonedItem = new DaybookTimeScheduleItem(this.schedItemStartTime, this.schedItemEndTime);
        clonedItem.startDelineator = new TimelogDelineator(this.startDelineator.time,
            this.startDelineator.delineatorType, this.startDelineator.scheduleIndex);
        clonedItem.endDelineator = new TimelogDelineator(this.endDelineator.time,
            this.endDelineator.delineatorType, this.endDelineator.scheduleIndex);
        clonedItem.setItemIndex(this.itemIndex);
        return clonedItem;
    }


    public exportToSleepDataItem(): DaybookSleepInputDataItem {
        if (this._sleepEntry) {
            return this._sleepEntry.exportToDataItem();
        } else {
            return {
                startSleepTimeISO: this.schedItemStartTime.toISOString(),
                startSleepTimeUtcOffsetMinutes: this.schedItemStartTime.utcOffset(),
                endSleepTimeISO: this.schedItemEndTime.toISOString(),
                endSleepTimeUtcOffsetMinutes: this.schedItemEndTime.utcOffset(),
                percentAsleep: 100,
                embeddedNote: '',
                activities: [],
                energyAtEnd: 100,
            };
        }
    }
}
