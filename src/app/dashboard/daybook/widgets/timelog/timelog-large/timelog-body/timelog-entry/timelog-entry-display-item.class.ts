import { TimelogEntryItem } from "./timelog-entry-item.class";
import { ActivityCategoryDefinition } from "../../../../../../activities/api/activity-category-definition.class";
import { ActivityTree } from "../../../../../../activities/api/activity-tree.class";
import { ColorConverter } from "../../../../../../../shared/utilities/color-converter.class";
import { ColorType } from "../../../../../../../shared/utilities/color-type.enum";

export class TimelogEntryDisplayItem {

    constructor(timelogEntries: TimelogEntryItem[], activityTree: ActivityTree, isSmallEntry: boolean = false) {
        this._timelogEntries = timelogEntries;
        this._activityTree = activityTree;
        this._isSmallEntry = isSmallEntry;
        this._buildEntry();
    }

    private _isSmallEntry: boolean;
    private _timelogEntries: TimelogEntryItem[];
    private _activityTree: ActivityTree;
    private _backgroundColor: string = "";
    private _displayString: string = "";
    private _units: { color: string, unitType: "HOUR" | "FIFTEEN", fill: any[] }[] = [];

    public get timelogEntries(): TimelogEntryItem[] { return this._timelogEntries; }
    public get displayString(): string { return this._displayString; }
    public get backgroundColor(): string { return this._backgroundColor; }
    public get units(): { color: string, unitType: "HOUR" | "FIFTEEN", fill: any[] }[] { return this._units; };


    private _buildEntry() {

        const entryDuration: number = this.timelogEntries[0].durationSeconds / 60;

        let displayString: string = "";

        let units: { color: string, unitType: "HOUR" | "FIFTEEN", fill: any[] }[] = [];
        let topActivitySet: boolean = false;
        this.timelogEntries[0].timelogEntryActivities.sort((a1, a2) => {
            if (a1.percentage > a2.percentage) return -1;
            else if (a1.percentage < a2.percentage) return 1;
            else return 0;
        }).forEach((activityEntry) => {
            let foundActivity: ActivityCategoryDefinition = this._activityTree.findActivityByTreeId(activityEntry.activityTreeId);
            let durationMinutes: number = (activityEntry.percentage * entryDuration) / 100;

            if (!topActivitySet) {
                topActivitySet = true;
                const alpha = 0.06;
                this._backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
                if (foundActivity) {
                    displayString = foundActivity.name;
                } else {
                    displayString = "Unknown activity";
                }
            }

            let color: string = "";
            if (foundActivity) {
                color = foundActivity.color;
            } else {
                color = "rgba(0,0,0,0.1)";
            }

            let unitCount: number = Math.ceil(durationMinutes / 15);

            let remainingUnitCount: number = unitCount;
            while (remainingUnitCount > 0) {
                if (remainingUnitCount >= 4) {
                    let fill: any[] = [1, 2, 3, 4];
                    units.push({
                        color: color,
                        unitType: "HOUR",
                        fill: fill,
                    });
                    remainingUnitCount -= 4;
                } else {
                    let fill: any[] = [];
                    for (let i = 1; i <= remainingUnitCount; i++) {
                        fill.push(i);
                    }
                    units.push({
                        color: color,
                        unitType: "HOUR",
                        fill: fill,
                    });
                    remainingUnitCount = 0;
                }
            }

        });

        if (this.timelogEntries[0].timelogEntryActivities.length > 1) {
            displayString += " +" + (this.timelogEntries[0].timelogEntryActivities.length - 1) + " more";
        }



        this._displayString = displayString;
        this._units = units;

    }
}