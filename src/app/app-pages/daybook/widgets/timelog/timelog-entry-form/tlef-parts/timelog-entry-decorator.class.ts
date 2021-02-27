import { ActivityHttpService } from "../../../../../activities/api/activity-http.service";
import { TimelogEntryItem } from "../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { ActivityCategoryDefinition } from "../../../../../activities/api/activity-category-definition.class";
import { ColorConverter } from "../../../../../../shared/utilities/color-converter.class";
import { ColorType } from "../../../../../../shared/utilities/color-type.enum";
import { TimelogEntryDisplayItemUnit } from "../../timelog-large-frame/timelog-body/timelog-entry/tle-display-item-unit.class";
import { TimelogEntryActivity } from "../../../../daybook-day-item/data-items/timelog-entry-activity.interface";

export class TimelogEntryDecorator {

    private activitiesService: ActivityHttpService;

    constructor(activitiesService: ActivityHttpService) {
        this.activitiesService = activitiesService;
    }

    public getEntryColor(entry: TimelogEntryItem, alpha: number = 0.06): string {
        let color: string = "";
        let topActivitySet: boolean = false;
        entry.timelogEntryActivities.sort((a1, a2) => {
            if (a1.percentage > a2.percentage) return -1;
            else if (a1.percentage < a2.percentage) return 1;
            else return 0;
        }).forEach((activityEntry) => {
            let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
            if (!topActivitySet) {
                topActivitySet = true;
                color = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
            }
        });
        return color;
    }

    public getActivityUnits(activity: TimelogEntryActivity, durationMinutes: number): TimelogEntryDisplayItemUnit[] {
        let activityUnits: TimelogEntryDisplayItemUnit[] = [];
        const foundActivity = this.activitiesService.findActivityByTreeId(activity.activityTreeId);

        let remainingMinutes: number = durationMinutes;
        const maxMinutes = 60;
        while (remainingMinutes >= maxMinutes) {
            const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(foundActivity, (maxMinutes * 60 * 1000));
            activityUnits.push(newUnit);
            remainingMinutes = remainingMinutes - maxMinutes;
        }
        if (remainingMinutes > 0) {
            const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(foundActivity, (remainingMinutes * 60 * 1000));
            activityUnits.push(newUnit);
        }
        return activityUnits;
    }

    public getEntryUnits(entry: TimelogEntryItem, radius: number = 5): TimelogEntryDisplayItemUnit[] {
        const entryDurationMS: number = entry.durationMilliseconds;
        let topActivitySet: boolean = false;
        let allEntryUnits: TimelogEntryDisplayItemUnit[] = [];
        entry.timelogEntryActivities.sort((a1, a2) => {
            if (a1.percentage > a2.percentage) return -1;
            else if (a1.percentage < a2.percentage) return 1;
            else return 0;
        }).forEach((activityEntry) => {
            let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
            let durationMS: number = (activityEntry.percentage * entryDurationMS) / 100;
            let durationMinutes: number = durationMS / (60 * 1000);

            let activityUnits: TimelogEntryDisplayItemUnit[] = [];


            let remainingMinutes: number = durationMinutes;
            const maxMinutes = 60;
            while (remainingMinutes >= maxMinutes) {
                const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(foundActivity, (maxMinutes * 60 * 1000));
                activityUnits.push(newUnit);
                remainingMinutes = remainingMinutes - maxMinutes;
            }
            if (remainingMinutes > 0) {
                const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(foundActivity, (remainingMinutes * 60 * 1000));
                activityUnits.push(newUnit);
            }
            allEntryUnits = allEntryUnits.concat(activityUnits);
        });

        return allEntryUnits;
    }


}