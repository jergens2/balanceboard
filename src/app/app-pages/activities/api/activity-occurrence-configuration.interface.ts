import { TimeOfDay } from "../../../shared/time-utilities/time-of-day-enum";
import { DayOfWeek } from "../../../shared/time-utilities/day-of-week.enum";
import { TimeUnit } from "../../../shared/time-utilities/time-unit.enum";

export interface ActivityOccurrenceConfiguration{

    index: number;
    unit: TimeUnit;
    

    minutesPerOccurrence: number;
    timeOfDayQuarter: TimeOfDay;
    timeOfDayHour: number;
    timeOfDayMinute: number;


    timesOfDay: TimeOfDay[],
    timesOfDayRanges: {startTimeISO: string, endTimeISO: string}[],

    timesOfDayExcludedRanges: {startTimeISO: string, endTimeISO: string}[],

    daysOfWeek: DayOfWeek[],
    daysOfWeekExcluded: DayOfWeek[],

    daysOfYear: number[],
}