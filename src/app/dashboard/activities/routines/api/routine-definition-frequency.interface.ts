import { TimeUnit } from "../../../../shared/utilities/time-utilities/time-unit.enum";

export interface RoutineDefinitionFrequency{
    value: number,
    unit: TimeUnit,
    startsOnDateYYYYMMDD: string,
}