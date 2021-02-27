import { TimeUnit } from "../../../shared/time-utilities/time-unit.enum";
import { TimeOfDay } from "../../../shared/time-utilities/time-of-day-enum";
import { DayOfWeek } from "../../../shared/time-utilities/day-of-week.enum";
import { ActivityOccurrenceConfiguration } from "./activity-occurrence-configuration.interface";
import { ActivityScheduleRepitition } from "./activity-schedule-repitition.interface";

export interface ActivityScheduleConfiguration{

    repititions: ActivityScheduleRepitition[];


}