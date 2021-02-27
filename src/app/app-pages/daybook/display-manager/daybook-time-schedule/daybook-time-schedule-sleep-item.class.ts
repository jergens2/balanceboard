import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { SleepEntryItem } from '../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { DaybookSleepInputDataItem } from '../../daybook-day-item/data-items/daybook-sleep-input-data-item.interface';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';

export class DaybookTimeScheduleSleepItem extends DaybookTimeScheduleItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment, sleepEntry: DaybookSleepInputDataItem) {
        super(startTime, endTime);
        this._scheduleStatus = DaybookTimeScheduleStatus.SLEEP;
        this._buildSleepEntry(sleepEntry);
    }

    /** adds an item that immediately follows this one and updates the information. */
    public mergeItemAfter(addItem: DaybookTimeScheduleSleepItem) {
        this.changeSchedItemEndTime(addItem.schedItemEndTime);
        this._actualEndTime = moment(addItem.schedItemEndTime);
        this._sleepEntry.changeEndTime(addItem.schedItemEndTime);
    }
    /** adds an item that immediately precedes this one and updates the information. */
    // public mergeItemBefore(addItem: DaybookTimeScheduleSleepItem) {
    //     // this.changeSchedItemEndTime(addItem.schedItemEndTime);
    //     this._actualStartTime = moment(addItem.schedItemStartTime);
    //     this._sleepEntry.changeStartTime(addItem.schedItemStartTime);
    // }



    private _buildSleepEntry(sleepEntry: DaybookSleepInputDataItem) {
        let startTime: moment.Moment = moment(this.schedItemStartTime);
        let endTime: moment.Moment = moment(this.schedItemEndTime);
        if (sleepEntry) {
            startTime = moment(sleepEntry.startSleepTimeISO);
            endTime = moment(sleepEntry.endSleepTimeISO);
        }
        this._sleepEntry = new SleepEntryItem(startTime, endTime, sleepEntry);
        this._startDelineator = new TimelogDelineator(this._sleepEntry.startTime, TimelogDelineatorType.FALLASLEEP_TIME);
        this._endDelineator = new TimelogDelineator(this._sleepEntry.startTime, TimelogDelineatorType.WAKEUP_TIME);
    }
}
