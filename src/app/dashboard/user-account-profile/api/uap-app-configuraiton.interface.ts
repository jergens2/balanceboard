
/**
 * 
 * For hours, use numbers 0 to 24 or greater than 24.
 * 
 * For example, defaultFallAsleepHour set to 25 would be 1am.
 * 
 */

export interface UAPAppConfiguration{
    defaultWakeupHour: number;
    defaultWakeupMinute: number;
    defaultFallAsleepHour: number;
    defaultFallAsleepMinute: number;
}