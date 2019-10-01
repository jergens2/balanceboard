import { SleepQuality } from "../../daybook-entry-form-mobile/daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum";

export interface DaybookDayItemSleepProfile{

    sleepQuality: SleepQuality,

    wakeupTimeISO: string,
    wakeupTimeUtcOffsetMinutes: number,

    bedtimeISO: string,
    bedtimeUtcOffsetMinutes: number,

    fallAsleepTimeISO: string,
    fallAsleepTimeUtcOffsetMinutes: number,
}