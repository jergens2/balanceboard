export interface DaybookSleepInputDataItem{ 
    startTimeISO: string;
    startTimeUtcOffsetMinutes: number;
    endTimeISO: string;
    endTimeUtcOffsetMinutes: number;
    
    energyAtStartUserInput: number,
    energyAtEndUserInput: number,

    percentAsleep: number,

    embeddedNote: string,
    noteIds: string[],
}