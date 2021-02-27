import { TimeUnit } from "../../../shared/time-utilities/time-unit.enum";
import { ActivityOccurrenceConfiguration } from "./activity-occurrence-configuration.interface";



export interface ActivityScheduleRepitition {
    unit: TimeUnit,
    frequency: number,
    occurrences: ActivityOccurrenceConfiguration[];
    startDateTimeISO: string;
}