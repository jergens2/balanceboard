import { DaybookDayItem } from "../../daybook/daybook-day-item/daybook-day-item.class";
import { ActivityCategoryDefinition } from "./activity-category-definition.class";
import { TimelogEntryBuilder } from "../../daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class";



export class DaybookActivityUpdater {

    private _daybookDayItems: DaybookDayItem[];

    constructor(daybookDayItems: DaybookDayItem[]) {
        this._daybookDayItems = daybookDayItems;
    }

    public get daybookDayItems(): DaybookDayItem[] { return this._daybookDayItems; }

    public executeMergeActivity(fromTreeId: string, toTreeId: string): DaybookDayItem[] {
        const relevantItems = this.daybookDayItems.filter(daybookDayItem => {
            return daybookDayItem.timelogEntryDataItems.find(tleDi =>
                tleDi.timelogEntryActivities.find(tleA =>
                    tleA.activityTreeId === fromTreeId));
        });
        const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
        relevantItems.forEach(daybookDayItem => {
            daybookDayItem.timelogEntryDataItems.forEach(tledi => {
                const hasFromTreeId = tledi.timelogEntryActivities.find(tlea => tlea.activityTreeId === fromTreeId);
                const hasToTreeId = tledi.timelogEntryActivities.find(tlea => tlea.activityTreeId === toTreeId);
                if (hasToTreeId && hasFromTreeId) {
                    hasToTreeId.percentage = (hasFromTreeId.percentage + hasToTreeId.percentage);
                    tledi.timelogEntryActivities.splice(tledi.timelogEntryActivities.indexOf(hasFromTreeId), 1);
                } else if (hasFromTreeId) {
                    tledi.timelogEntryActivities.forEach(tlea => {
                        if (tlea.activityTreeId === fromTreeId) {
                            tlea.activityTreeId = toTreeId;
                        }
                    });
                }
            });
        });
        return relevantItems;
    }

    public executePermanentlyDelete(activity: ActivityCategoryDefinition): DaybookDayItem[] {
        const relevantItems = this.daybookDayItems.filter(daybookDayItem => {
            return daybookDayItem.timelogEntryDataItems.find(tleDi =>
                tleDi.timelogEntryActivities.find(tleA =>
                    tleA.activityTreeId === activity.treeId));
        });
        let foundItems: number = 0;
        relevantItems.forEach(daybookDayItem => {
            const tledis = daybookDayItem.timelogEntryDataItems;
            for (let i = 0; i < tledis.length; i++) {
                if(tledis[i].timelogEntryActivities.length === 1){
                    if(tledis[i].timelogEntryActivities[0].activityTreeId === activity.treeId){
                        // if there is only 1 activity, then just delete the whole timelog entry.
                        tledis.splice(i, 1);
                        i--;
                        foundItems ++;
                    }
                }
            }
            daybookDayItem.timelogEntryDataItems.forEach(tledi => {
                const foundIndex = tledi.timelogEntryActivities.findIndex(item => {
                    item.activityTreeId === activity.treeId
                });
                if (foundIndex >= 0) {

                    tledi.timelogEntryActivities.splice(foundIndex, 1);
                    foundItems ++;
                }
            });
        });
        return relevantItems;
    }

}