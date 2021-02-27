import { ActivityCategoryDefinition } from "../../app-pages/activities/api/activity-category-definition.class";


export interface ActivityDropdownListItem{

    activity: ActivityCategoryDefinition;
    isExpanded: boolean;
    generationNumber: number;
    children: ActivityDropdownListItem[];
}