import { TimelogEntryActivity } from "./timelog-entry-activity.interface";

export interface DaybookTimelogEntryDataItem{
    startTimeISO: string;
    endTimeISO: string;
    utcOffset: number;

    note: string;
    timelogEntryActivities: TimelogEntryActivity;
    
}