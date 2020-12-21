import * as moment from 'moment';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';
import { DaybookTimeScheduleStatus } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';


export class TimelogDisplayGridItem extends DaybookTimeScheduleItem {


    constructor(startTime: moment.Moment, endTime: moment.Moment, displayPercent: number,
        itemIndex: number, status: DaybookTimeScheduleStatus, currentTime: moment.Moment, timelogEntry?: TimelogEntryItem) {
        super(startTime, endTime);
        this._itemIndex = itemIndex;
        this._itemIndexes = [this._itemIndex];
        this._scheduleStatus = status;
        this._displayPercent = displayPercent;
        if (timelogEntry) {
            this._timelogEntries = [timelogEntry];
        }
        if (currentTime.isSameOrAfter(this.schedItemStartTime) && currentTime.isBefore(this.schedItemEndTime)) {
            this._showNowLine = true;
        }
    }

    private _timelogEntries: TimelogEntryItem[] = [];
    private _itemIndexes: number[] = [];
    private _isMerged: boolean = false;

    private _showNowLine: boolean = false;

    private readonly verySmallPercent = 2.5;
    private readonly smallPercent = 6;
    private readonly largePercent = 15;

    public isCurrentlyOpen: boolean = false;

    public get isVerySmallItem(): boolean { return this.displayPercent < this.verySmallPercent; }
    public get isSmallItem(): boolean { return this.displayPercent >= this.verySmallPercent && this.displayPercent < this.smallPercent; }
    public get isNormalItem(): boolean { return this.displayPercent >= this.smallPercent && this.displayPercent < this.largePercent; }
    public get isLargeItem(): boolean { return this.displayPercent >= this.largePercent; }

    public get isMerged(): boolean { return this._isMerged; }
    public get timelogEntries(): TimelogEntryItem[] { return this._timelogEntries; }
    public get itemIndexes(): number[] { return this._itemIndexes; }

    public get showNowLine(): boolean { return this._showNowLine; }

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

        const firstStartTime: moment.Moment = this.schedItemStartTime.isBefore(otherItem.schedItemStartTime)
            ? this.schedItemStartTime : otherItem.schedItemStartTime;
        const lastEndTime: moment.Moment = this.schedItemEndTime.isAfter(otherItem.schedItemEndTime)
            ? this.schedItemEndTime : otherItem.schedItemEndTime;
        this.changeSchedItemStartTime(firstStartTime);
        this.changeSchedItemEndTime(lastEndTime);
        this._isMerged = true;
    }

    public setAsActiveItem() {
        console.log("SETTING THIS ITEM AS ACTIVE, " + this.itemIndex)
    }

    public toString(): string {
        return this.itemIndex + "\t" + this.scheduleStatus + '  ' + this.displayPercent.toFixed(0) + ' % '
            + '\n\t ' + this.schedItemStartTime.format('YYYY-MM-DD hh:mm a') + ' to ' + this.schedItemEndTime.format('YYYY-MM-DD hh:mm a');
    }
}
