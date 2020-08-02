import { ActivityCategoryDefinition } from "../../../api/activity-category-definition.class";

/**
 * data represented as a set of calculated values for any given range of days of time.
 */
export interface ActivityAnalysis{

    definition: ActivityCategoryDefinition,

    averageMsPerWeek: number,
    averageMsPerDay: number,
    averageOccurrencesPerWeek:number,
    averageOccurrencesPerDay: number,
    averageMsPerOccurrence: number,

    medianMsPerWeek: number,
    medianMsPerDay: number,
    medianOccurrencesPerWeek: number,
    medianOccurrencesPerDay: number,
    // medianMsPerOccurrence: number,
    
    totalOccurrences: number,
    totalMs: number,
}