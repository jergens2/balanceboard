import { SleepQuality } from "../../widgets/timelog/timelog-entry-form/form-sections/sleep-section/sleep-quality.enum";

export interface DaybookDayItemSleepProfile{
    previousFallAsleepTimeISO: string,
    previousFallAsleepTimeUtcOffsetMinutes: number,
    wakeupTimeISO: string,
    wakeupTimeUtcOffsetMinutes: number,
    sleepQuality: SleepQuality,
    bedtimeISO: string,
    bedtimeUtcOffsetMinutes: number,
}