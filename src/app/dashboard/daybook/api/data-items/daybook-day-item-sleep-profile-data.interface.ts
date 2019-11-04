import { SleepQuality } from "../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum";

export interface DaybookDayItemSleepProfileData{

    sleepQuality: SleepQuality,

    previousFallAsleepTimeISO: string,
    previousFallAsleepTimeUtcOffsetMinutes: number,

    wakeupTimeISO: string,
    wakeupTimeUtcOffsetMinutes: number,

    bedtimeISO: string,
    bedtimeUtcOffsetMinutes: number,

    fallAsleepTimeISO: string,
    fallAsleepTimeUtcOffsetMinutes: number,

    estimatedSleepDurationMinutes: number,

}