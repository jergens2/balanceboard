import { TimeUnit } from "./time-unit.enum";


export interface ScheduleRepitition {
    value: number,
    unit: TimeUnit,
    startsOnDateTimeISO: string,
}