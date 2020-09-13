import { TimelogEntryActivity } from "./timelog-entry-activity.interface";

export interface DaybookSleepInputDataItem{ 

    startSleepTimeISO: string;
    startSleepTimeUtcOffsetMinutes: number;
    
    endSleepTimeISO: string;
    endSleepTimeUtcOffsetMinutes: number;
    
    percentAsleep: number;

    embeddedNote: string;

    activities: TimelogEntryActivity[];

    energyAtEnd: number;
}