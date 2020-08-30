import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimelogEntryDataItem } from '../data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryBuilder } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { TimelogEntryItem } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-delineator.class';

export class DaybookTimeScheduleActiveItem extends DaybookTimeScheduleItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment, timelogEntry: DaybookTimelogEntryDataItem) {
        super(startTime, endTime);
        this._scheduleStatus = DaybookTimeScheduleStatus.ACTIVE;
        if (timelogEntry) {
            this._buildTimelogEntry(timelogEntry);
        } else {
            console.log('NO TIMELOG ENTRY PROVIDED.  TO DO:  BUILD ONE')
        }

    }


    private _buildTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem) {
        const builder = new TimelogEntryBuilder();
        this._timelogEntry = builder.buildFromDataItem(timelogEntry);
        this._startDelineator = new TimelogDelineator(this._timelogEntry.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
        this._endDelineator = new TimelogDelineator(this._timelogEntry.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
    }

}
