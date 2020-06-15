
/**
 * 
 * For hours, zero is used as a reference point.
 * Numbers below zero will be hours subtracted from midnight of the specific day, 
 * Numbers above 24 will automatically pass midnight.
 * e.g. default Wakeup hour set to -3 would imply that the user typically wakes up at 9pm the date before.  -
 *  their "day" ranges from 9pm the prev day + ~16 hours
 * 
 * e.g. default fall asleep hour set to +26 would mean that the user typically goes to bed at 2am. 
 */

export interface UAPAppConfiguration{
    defaultWakeupHour: number;
    defaultWakeupMinute: number;
    defaultFallAsleepHour: number;
    defaultFallAsleepMinute: number;
}