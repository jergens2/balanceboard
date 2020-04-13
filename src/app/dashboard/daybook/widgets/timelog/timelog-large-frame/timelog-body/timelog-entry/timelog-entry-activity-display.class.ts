import { TimelogEntryActivity } from "../../../../../api/data-items/timelog-entry-activity.interface";
import { ActivityTree } from "../../../../../../activities/api/activity-tree.class";
import { ActivityCategoryDefinition } from "../../../../../../activities/api/activity-category-definition.class";
import { TimelogEntryDisplayItemUnit } from "./tle-display-item-unit.class";
import { DurationString } from "../../../../../../../shared/utilities/time-utilities/duration-string.class";

export class TimelogEntryActivityDisplay {

    private _activity: ActivityCategoryDefinition;
    private _units: TimelogEntryDisplayItemUnit[] = [];
    private _durationMS: number;
    private _durationString: string;

    constructor(totalDurationMS: number, activity: ActivityCategoryDefinition) {
        this._durationMS = totalDurationMS;
        this._activity = activity;

        if (this._activity) {
            this._buildUnits();
        } else {
            console.log("Error building timelog display item: no activity provided.")
        }

    }

    private _buildUnits() {
        const durationMinutes = this._durationMS / (1000 * 60);
        let remainingMinutes: number = durationMinutes;
        const maxMinutes = 60;
        const units: TimelogEntryDisplayItemUnit[] = [];
        while (remainingMinutes >= maxMinutes) {
            const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(this._activity, (maxMinutes * 60 * 1000));
            units.push(newUnit);
            remainingMinutes = remainingMinutes - maxMinutes;
        }
        if (remainingMinutes > 0) {
            const newUnit: TimelogEntryDisplayItemUnit = new TimelogEntryDisplayItemUnit(this._activity, (remainingMinutes * 60 * 1000));
            units.push(newUnit);
        }
        this._units = units;
        this._durationString = DurationString.getDurationStringFromMS(this._durationMS, true);
    }

    public get name(): string { return this._activity.name; }
    public get units(): TimelogEntryDisplayItemUnit[] { return this._units; }
    public get durationString(): string { return this._durationString; }
}