import { DaybookTimeScheduleStatus } from "./daybook-time-schedule-status.enum";
import { DaybookTimelogEntryDataItem } from "../data-items/daybook-timelog-entry-data-item.interface";
import { DaybookSleepInputDataItem } from "../data-items/daybook-sleep-input-data-item.interface";
import * as moment from 'moment';
import { TimelogEntryItem } from "../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { SleepEntryItem } from "../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class";
import { TimelogEntryBuilder } from "../../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class";
import { TimeScheduleItem } from "../../../../shared/time-utilities/time-schedule-item.class";

export class DaybookTimeScheduleItem extends TimeScheduleItem {

    private _status: DaybookTimeScheduleStatus;
    private _timelogEntry: TimelogEntryItem;
    private _sleepEntry: SleepEntryItem;

    public get status(): DaybookTimeScheduleStatus { return this._status; }
    public get timelogEntry(): TimelogEntryItem { return this._timelogEntry; }
    public get sleepEntry(): SleepEntryItem { return this._sleepEntry; }

    public set status(status: DaybookTimeScheduleStatus) { this._status = status; }

    constructor(startTime: moment.Moment, endTime: moment.Moment, status: DaybookTimeScheduleStatus, timelogEntry?: DaybookTimelogEntryDataItem, sleepEntry?: DaybookSleepInputDataItem) {
        super(startTime.toISOString(), endTime.toISOString(), startTime.utcOffset(), endTime.utcOffset());
        this._status = status;
        if (status === DaybookTimeScheduleStatus.ACTIVE) {
            if (timelogEntry) {
                this._buildTimelogEntry(timelogEntry);
            } else {
                // console.log("Error: no timelogEntryDataItem provided")
            }
        } else if (status === DaybookTimeScheduleStatus.SLEEP) {
            this._buildSleepEntry(sleepEntry);

        } else if (status === DaybookTimeScheduleStatus.AVAILABLE) {

        }
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

    private _buildTimelogEntry(timelogEntry: DaybookTimelogEntryDataItem) {
        const builder = new TimelogEntryBuilder();
        this._timelogEntry = builder.buildFromDataItem(timelogEntry);
    }

    private _buildSleepEntry(sleepEntry: DaybookSleepInputDataItem) {
        if(sleepEntry){
            const startTime = moment(sleepEntry.startSleepTimeISO);
            const endTime = moment(sleepEntry.endSleepTimeISO);
            this._sleepEntry = new SleepEntryItem(startTime, endTime, sleepEntry);
        }
    }
}