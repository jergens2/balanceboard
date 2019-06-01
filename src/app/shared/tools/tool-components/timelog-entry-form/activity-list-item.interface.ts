import { UserDefinedActivity } from "../../../../dashboard/activities/user-defined-activity.model";

export interface IActivityListItem{
    activity: UserDefinedActivity,
    mouseOver: boolean,
    durationMinutes: number,
    durationPercent: number,
    isResizing: boolean,
}