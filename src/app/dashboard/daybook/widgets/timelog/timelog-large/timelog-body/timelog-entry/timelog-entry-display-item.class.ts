import { TimelogEntryItem } from "./timelog-entry-item.class";
import { ActivityCategoryDefinition } from "../../../../../../activities/api/activity-category-definition.class";
import { ActivityTree } from "../../../../../../activities/api/activity-tree.class";
import { ColorConverter } from "../../../../../../../shared/utilities/color-converter.class";
import { ColorType } from "../../../../../../../shared/utilities/color-type.enum";
import { TimelogEntryActivity } from "../../../../../api/data-items/timelog-entry-activity.interface";
import * as moment from 'moment';

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
    public get isSmallEntry(): boolean { return this._isSmallEntry; }


    private _buildEntry() {

        let displayString: string = "No timelog entries";
        let units: { color: string, unitType: "HOUR" | "FIFTEEN", fill: any[] }[] = [];
        if (this.timelogEntries.length > 0) {
            let mergedTimelogEntry = this.timelogEntries[0];
            if (this.timelogEntries.length > 1) {
                
                const startTime = moment(this.timelogEntries[0].startTime);
                
                const endTime = moment(this.timelogEntries[this.timelogEntries.length - 1].endTime);
                const totalMS = endTime.diff(startTime, 'milliseconds');
                let activities: { activityTreeId: string, milliseconds: number }[] = [];
                this.timelogEntries.forEach((timelogEntry) => {
                    activities = activities.concat(timelogEntry.timelogEntryActivities.map((tlea) => {
                        const tleMS = timelogEntry.endTime.diff(timelogEntry.startTime, 'milliseconds');
                        const milliseconds: number = (100 / tlea.percentage) * tleMS;
                        return {
                            activityTreeId: tlea.activityTreeId,
                            milliseconds: milliseconds,
                        };
                    }));
                });
                mergedTimelogEntry = new TimelogEntryItem(startTime, endTime);
                mergedTimelogEntry.timelogEntryActivities = activities.map((activity)=>{
                    const percentage = (activity.milliseconds / totalMS) * 100;
                    return {
                        activityTreeId: activity.activityTreeId,
                        percentage: percentage,
                    }
                });
            }


            const entryDuration: number = mergedTimelogEntry.durationSeconds / 60;
            let topActivitySet: boolean = false;
            mergedTimelogEntry.timelogEntryActivities.sort((a1, a2) => {
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

            if (mergedTimelogEntry.timelogEntryActivities.length > 1) {
                displayString += " +" + (mergedTimelogEntry.timelogEntryActivities.length - 1) + " more";
            }

        }
        this._displayString = displayString;
        this._units = units;

    }
}