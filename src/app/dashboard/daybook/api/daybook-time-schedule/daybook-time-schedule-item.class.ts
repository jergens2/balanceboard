import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import * as moment from 'moment';
import { TimeScheduleItem } from '../../../../shared/time-utilities/time-schedule-item.class';
import { TimelogDelineator } from '../../widgets/timelog/timelog-delineator.class';
import { SleepEntryItem } from '../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../data-items/daybook-sleep-input-data-item.interface';
import { TimelogEntryItem } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

export class DaybookTimeScheduleItem extends TimeScheduleItem {

    protected _scheduleStatus: DaybookTimeScheduleStatus;
    protected _itemIndex: number = -1;

    protected _startDelineator: TimelogDelineator;
    protected _endDelineator: TimelogDelineator;

    protected _sleepEntry: SleepEntryItem;
    protected _timelogEntry: TimelogEntryItem;

    protected _displayPercent: number = 0;

    public get sleepEntry(): SleepEntryItem { return this._sleepEntry; }
    public get timelogEntry(): TimelogEntryItem { return this._timelogEntry; }

    public get startDelineator(): TimelogDelineator { return this._startDelineator; }
    public get endDelineator(): TimelogDelineator { return this._endDelineator; }

    public get displayPercent(): number { return this._displayPercent; }

    public get scheduleStatus(): DaybookTimeScheduleStatus { return this._scheduleStatus; }
    public get isSleepItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.SLEEP; }
    public get isActiveItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.ACTIVE; }
    public get isAvailableItem(): boolean { return this.scheduleStatus === DaybookTimeScheduleStatus.AVAILABLE; }
    // public set scheduleStatus(status: DaybookTimeScheduleStatus) { this._scheduleStatus = status; }
    public get itemIndex(): number { return this._itemIndex; }
    public setItemIndex(index: number, previousItem?: DaybookTimeScheduleItem) {
        this._itemIndex = index;
        if (previousItem && this.isAvailableItem) {
            if (!previousItem.isAvailableItem) {
                this._startDelineator = previousItem.endDelineator;
            }
        }
    }
    
    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        super(startTime.toISOString(), endTime.toISOString(), startTime.utcOffset(), endTime.utcOffset());
    }

    public setDisplayPercent(totalViewMs: number) { this._displayPercent = (this.durationMs / totalViewMs) * 100; }

    public toString(): string {
        let val = 'DaybookTimeScheduleItem:  \t' + this.scheduleStatus + '\n';
        val += '\t' + this.startTime.format('YYYY-MM-DD hh:mm a') + ' to ' + this.endTime.format('YYYY-MM-DD hh:mm a') + '\n';
        return val;
    }




    public exportToSleepDataItem(): DaybookSleepInputDataItem {
        if (this._sleepEntry) {
            return this._sleepEntry.exportToDataItem();
        } else {
            return {
                startSleepTimeISO: this.startTime.toISOString(),
                startSleepTimeUtcOffsetMinutes: this.startTime.utcOffset(),
                endSleepTimeISO: this.endTime.toISOString(),
                endSleepTimeUtcOffsetMinutes: this.endTime.utcOffset(),
                percentAsleep: 100,
                embeddedNote: '',
                activities: [],
                energyAtEnd: 100,
            }
        }
    }
}