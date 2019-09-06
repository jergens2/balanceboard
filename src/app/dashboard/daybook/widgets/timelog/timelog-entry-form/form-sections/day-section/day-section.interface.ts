import { TimeOfDay } from "../../../../../../../shared/utilities/time-of-day-enum";
import { DaybookDayItemScheduledActivity } from "../../../../../api/data-items/daybook-day-item-scheduled-activity.class";

export interface DaySection{
    timeOfDay: TimeOfDay;
    scheduledActivities: DaybookDayItemScheduledActivity[];
}