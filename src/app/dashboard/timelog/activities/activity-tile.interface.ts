import { CategorizedActivity } from "./activity/categorized-activity.model";

export interface IActivityTile {
    activity: CategorizedActivity,
    ifShowActivityControls: boolean,
}