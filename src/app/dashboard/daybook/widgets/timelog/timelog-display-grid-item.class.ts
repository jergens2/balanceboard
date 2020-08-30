import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimeScheduleStatus } from '../../api/daybook-time-schedule/daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from '../../api/daybook-time-schedule/daybook-time-schedule-item.class';


export class TimelogDisplayGridItem extends DaybookTimeScheduleItem {


    constructor(startTime: moment.Moment, endTime: moment.Moment, displayPercent: number,
        itemIndex: number, status: DaybookTimeScheduleStatus, timelogEntry?: TimelogEntryItem) {
        super(startTime, endTime);
        this._itemIndex = itemIndex;
        this._itemIndexes = [this._itemIndex];
        this._scheduleStatus = status;
        this._displayPercent = displayPercent;
        if (timelogEntry) {
            this._timelogEntries = [timelogEntry];
        }
    }

    private _timelogEntries: TimelogEntryItem[] = [];
    private _itemIndexes: number[] = [];
    private _isMerged: boolean = false;

    public readonly verySmallPercent = 2.5;
    public readonly smallPercent = 6;
    public readonly largePercent = 15;

    public get isVerySmallItem(): boolean { return this.displayPercent < this.verySmallPercent; }
    public get isSmallItem(): boolean { return this.displayPercent >= this.verySmallPercent && this.displayPercent < this.smallPercent; }
    public get isNormalItem(): boolean { return this.displayPercent >= this.smallPercent && this.displayPercent < this.largePercent; }
    public get isLargeItem(): boolean { return this.displayPercent >= this.largePercent; }

    public get isMerged(): boolean { return this._isMerged; }
    public get timelogEntries(): TimelogEntryItem[] { return this._timelogEntries; }
    public get itemIndexes(): number[] { return this._itemIndexes; }

    /**
     * take the incoming item and merge it into this object.
     */
    public mergeItem(otherItem: TimelogDisplayGridItem) {
        this._displayPercent = this._displayPercent + otherItem.displayPercent;
        this._timelogEntries = [...this._timelogEntries, ...otherItem.timelogEntries].sort((tle1, tle2) => {
            if (tle1.startTime.isBefore(tle2.startTime)) { return -1; }
            else if (tle1.startTime.isAfter(tle2.startTime)) { return 1; }
            return 0;
        });
        this._itemIndexes = [this._itemIndex, otherItem.itemIndex].sort((i1, i2) => {
            if (i1 < i2) { return -1; }
            else if (i1 > i2) { return 1; }
            return 0;
        });

        const firstStartTime: moment.Moment = this.startTime.isBefore(otherItem.startTime) ? this.startTime : otherItem.startTime;
        const lastEndTime: moment.Moment = this.endTime.isAfter(otherItem.endTime) ? this.endTime : otherItem.endTime;
        this.changeStartTime(firstStartTime);
        this.changeEndTime(lastEndTime);
        this._isMerged = true;
    }

    public toString(): string {
        return this.scheduleStatus + '  ' + this.displayPercent.toFixed(0) + ' % '
            + '\n\t ' + this.startTime.format('YYYY-MM-DD hh:mm a') + ' to ' + this.endTime.format('YYYY-MM-DD hh:mm a');
    }
}