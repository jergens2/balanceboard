import { TimelogEntryActivity } from './timelog-entry-activity.interface';

export interface DaybookTimelogEntryDataItem {
    startTimeISO: string;
    startTimeUtcOffsetMinutes: number;
    endTimeISO: string;
    endTimeUtcOffsetMinutes: number;
    timelogEntryActivities: TimelogEntryActivity[];
    isConfirmed: boolean;
    note: string;
}
