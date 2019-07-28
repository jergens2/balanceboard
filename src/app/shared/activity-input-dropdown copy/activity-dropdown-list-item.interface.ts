import { ActivityCategoryDefinition } from "../document-definitions/activity-category-definition/activity-category-definition.class";


export interface IActivityDropdownListItem{

    activity: ActivityCategoryDefinition;
    isExpanded: boolean;
    generationNumber: number;
    children: IActivityDropdownListItem[];
}