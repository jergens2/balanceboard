import { CategorizedActivity } from "./categorized-activity.model";

export interface IActivityTile {
    activity: CategorizedActivity,
    ifShowActivityDelete: boolean,
    ifShowActivityModify: boolean,
}