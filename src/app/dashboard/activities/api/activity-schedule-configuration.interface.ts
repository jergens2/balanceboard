import { TimeUnit } from "../../../shared/utilities/time-unit.enum";
import { TimeOfDay } from "../../../shared/utilities/time-of-day-enum";
import { TimeRange } from "../../../shared/utilities/time-range.interface";
import { DayOfWeek } from "../../../shared/utilities/day-of-week.enum";
import { ActivityOccurrenceConfiguration } from "./activity-occurrence-configuration.interface";

export interface ActivityScheduleConfiguration{
    timeUnitFrame: TimeUnit,
    timeFrameFrequency: number,
    
    scheduledOccurrences: ActivityOccurrenceConfiguration[],

    startDateTimeISO: string;

    timesOfDay: TimeOfDay[],
    timesOfDayRanges: TimeRange[],

    timesOfDayExcludedRanges: TimeRange[],

    daysOfWeek: DayOfWeek[],
    daysOfWeekExcluded: DayOfWeek[],

    daysOfYear: number[],
}