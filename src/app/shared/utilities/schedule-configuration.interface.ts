import { DayOfWeek } from "./day-of-week.enum";
import { TimeUnit } from "./time-unit.enum";
import { TimeOfDay } from "./time-of-day-enum";
import { TimeRange } from "./time-range.interface";
import { ScheduleRepitition } from "./schedule-repitition.interface";

export interface ScheduleConfiguration{

    repititions: ScheduleRepitition[];

    timeOfDay: TimeOfDay,
    timeOfDayRanges: TimeRange[],

    daysOfWeek: DayOfWeek[];
    daysOfWeekExcluded: DayOfWeek[];
}