import { UserDefinedActivity } from "./user-defined-activity.model";

export interface IActivityTile {
    activity: UserDefinedActivity,
    ifShowActivityDelete: boolean,
    ifShowActivityModify: boolean,
}