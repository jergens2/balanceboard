import { DaybookTimeScheduleItem } from "./daybook-time-schedule-item.class";
import * as moment from 'moment';
import { DaybookTimeScheduleStatus } from "./daybook-time-schedule-status.enum";
import { SleepEntryItem } from "../../widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class";
import { DaybookSleepInputDataItem } from "../data-items/daybook-sleep-input-data-item.interface";

export class DaybookTimeScheduleSleepItem extends DaybookTimeScheduleItem{
    constructor(startTime: moment.Moment, endTime: moment.Moment, sleepEntry: DaybookSleepInputDataItem){
        super(startTime, endTime);
        this._status = DaybookTimeScheduleStatus.SLEEP;
        if(sleepEntry){
            this._buildSleepEntry(sleepEntry);
        }else{
            console.log("No sleep entry provided.  TO DO:  BUild a default one.")
        }   
        
    }

    private _sleepEntry: SleepEntryItem;
    public get sleepEntry(): SleepEntryItem { return this._sleepEntry; }

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

    private _buildSleepEntry(sleepEntry: DaybookSleepInputDataItem) {
        if(sleepEntry){
            const startTime = moment(sleepEntry.startSleepTimeISO);
            const endTime = moment(sleepEntry.endSleepTimeISO);
            this._sleepEntry = new SleepEntryItem(startTime, endTime, sleepEntry);
        }
    }
}