import { TimelogEntryActivity } from "./timelog-entry-activity.interface";
import { DayStructureSleepCycle } from "./day-structure-sleep-cycle.enum";

export interface DaybookTimelogEntryDataItem{
    startTimeISO: string;
    endTimeISO: string;
    utcOffsetMinutes: number;
    timelogEntryActivities: TimelogEntryActivity[];
    sleepCycle: DayStructureSleepCycle,
    isConfirmed: boolean;

    note: string;    
}