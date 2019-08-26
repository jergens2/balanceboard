import { TimelogEntryActivity } from "./timelog-entry-activity.interface";

export interface DaybookTimelogEntryDataItem{
    startTimeISO: string;
    endTimeISO: string;
    utcOffsetMinutes: number;
    timelogEntryActivities: TimelogEntryActivity[];
    isConfirmed: boolean;
    note: string;    
}