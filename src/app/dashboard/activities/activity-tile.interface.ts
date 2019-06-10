import { ActivityCategoryDefinition } from "../../shared/document-definitions/activity-category-definition/activity-category-definition.class";

export interface IActivityTile {
    activity: ActivityCategoryDefinition,
    ifShowActivityDelete: boolean,
    ifShowActivityModify: boolean,
}