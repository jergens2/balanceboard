import { ActivityCategoryDefinition } from "../../dashboard/activities/api/activity-category-definition/activity-category-definition.class";


export interface ActivityDropdownListItem{

    activity: ActivityCategoryDefinition;
    isExpanded: boolean;
    generationNumber: number;
    children: ActivityDropdownListItem[];
}