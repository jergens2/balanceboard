export interface DaybookSleepInputDataItem{ 

    startSleepTimeISO: string;
    startSleepTimeUtcOffsetMinutes: number;
    
    endSleepTimeISO: string;
    endSleepTimeUtcOffsetMinutes: number;
    
    energyAtStartUserInput: number;
    energyAtEndUserInput: number;

    percentAsleep: number;

    embeddedNote: string;
    noteIds: string[];

    customSleepProfile: any; 
}