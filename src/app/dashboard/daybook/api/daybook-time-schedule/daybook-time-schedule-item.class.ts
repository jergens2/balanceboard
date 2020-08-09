import { DaybookTimeScheduleStatus } from "./daybook-time-schedule-status.enum";
import { DaybookTimelogEntryDataItem } from "../data-items/daybook-timelog-entry-data-item.interface";
import { DaybookSleepInputDataItem } from "../data-items/daybook-sleep-input-data-item.interface";
import * as moment from 'moment';
import { TimelogEntryItem } from "../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { SleepEntryItem } from "../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class";
import { TimelogEntryBuilder } from "../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class";
import { TimeScheduleItem } from "../../../../shared/time-utilities/time-schedule-item.class";

export class DaybookTimeScheduleItem extends TimeScheduleItem {

    protected _status: DaybookTimeScheduleStatus;
    

    public get status(): DaybookTimeScheduleStatus { return this._status; }
    public set status(status: DaybookTimeScheduleStatus) { this._status = status; }

    constructor(startTime: moment.Moment, endTime: moment.Moment) {
        super(startTime.toISOString(), endTime.toISOString(), startTime.utcOffset(), endTime.utcOffset());
    }

    public toString(): string { 
        let val = "DaybookTimeScheduleItem:  \t" + this.status + "\n"; 
        val += "\t" + this.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.endTime.format("YYYY-MM-DD hh:mm a") + "\n";
        return val;
    }

    
}