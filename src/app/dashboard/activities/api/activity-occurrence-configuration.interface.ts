import { TimeOfDay } from "../../../shared/utilities/time-of-day-enum";

export interface ActivityOccurrenceConfiguration{
    minutesPerOccurrence: number;
    timeOfDayQuarter: TimeOfDay;
    timeOfDayHour: number;
    timeOfDayMinute: number;
}