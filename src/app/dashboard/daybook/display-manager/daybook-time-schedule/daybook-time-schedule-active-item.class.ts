import { DaybookTimeScheduleItem } from './daybook-time-schedule-item.class';
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from './daybook-time-schedule-status.enum';
import { DaybookTimelogEntryDataItem } from '../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryBuilder } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { TimelogEntryItem } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../widgets/timelog/timelog-large-frame/timelog-body/timelog-delineator.class';

export class DaybookTimeScheduleActiveItem extends DaybookTimeScheduleItem {
    constructor(startTime: moment.Moment, endTime: moment.Moment, timelogEntry: DaybookTimelogEntryDataItem) {
        super(startTime, endTime);
        this._scheduleStatus = DaybookTimeScheduleStatus.ACTIVE;
        this._buildTimelogEntry(timelogEntry);


    }


    private _buildTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem) {
        
        const builder = new TimelogEntryBuilder();
        if(timelogEntry){
            this._timelogEntry = builder.buildFromDataItem(timelogEntry);
            
        }else{
            this._timelogEntry = builder.buildNew(this.schedItemStartTime, this.schedItemEndTime);
        }   
        this._startDelineator = new TimelogDelineator(this._timelogEntry.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
            this._endDelineator = new TimelogDelineator(this._timelogEntry.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
    }

}
