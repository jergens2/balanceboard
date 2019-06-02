import { UserDefinedActivity } from "../../../../dashboard/activities/user-defined-activity.model";
import { ActivitySliderBar } from "./tlef-activity-slider-bar/activity-slider-bar.class";

export interface ITLEFActivityListItem{
    activity: UserDefinedActivity,
    mouseOver: boolean,
    durationMinutes: number,
    durationPercent: number,
    sliderBar: ActivitySliderBar
}