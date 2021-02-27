import { ActivityCategoryDefinition } from "../../app-pages/activities/api/activity-category-definition.class";

export interface ActivitySearchResult {
    activity: ActivityCategoryDefinition;
    groupIndex: number;
    displayString: string;
    isIndented: boolean;
}
