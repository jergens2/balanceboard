import { ADIOccurrence } from "../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface";
import { ActivityCategoryDefinition } from "../api/activity-category-definition.class";

export interface ActivitySummaryData {
    activity: ActivityCategoryDefinition;
    occurrences: ADIOccurrence[];
    totalFamilyMs: number;
    totalItemMs: number;
    displayDuration: string;
    msPerOccurrence: number;
    percentOfTotal: number;
    percentOfParent: number;
    hasParent: boolean;
    childData: ActivitySummaryData[];
}