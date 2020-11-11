import { ActivityCategoryDefinition } from "../../dashboard/activities/api/activity-category-definition.class";

export interface ActivitySearchResult {
    activity: ActivityCategoryDefinition;
    groupIndex: number;
    displayString: string;
    isIndented: boolean;
}
