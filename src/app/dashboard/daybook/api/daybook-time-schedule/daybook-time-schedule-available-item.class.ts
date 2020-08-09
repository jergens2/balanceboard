import { DaybookTimeScheduleItem } from "./daybook-time-schedule-item.class";
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from "./daybook-time-schedule-status.enum";

export class DaybookTimeScheduleAvailableItem extends DaybookTimeScheduleItem{
    constructor(startTime: moment.Moment, endTime: moment.Moment){
        super(startTime, endTime);
        this._status = DaybookTimeScheduleStatus.AVAILABLE;
    }
}