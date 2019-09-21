import { TimeUnit } from "../../../shared/utilities/time-unit.enum";
import { TimeOfDay } from "../../../shared/utilities/time-of-day-enum";
import { TimeRange } from "../../../shared/utilities/time-range.interface";
import { DayOfWeek } from "../../../shared/utilities/day-of-week.enum";
import { ActivityOccurrenceConfiguration } from "./activity-occurrence-configuration.interface";
import { ActivityScheduleRepitition } from "./activity-schedule-repitition.interface";

export interface ActivityScheduleConfiguration{

    repititions: ActivityScheduleRepitition[];


}