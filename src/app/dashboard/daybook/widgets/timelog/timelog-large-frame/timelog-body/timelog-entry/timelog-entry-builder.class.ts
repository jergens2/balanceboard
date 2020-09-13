import { DaybookTimelogEntryDataItem } from '../../../../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryItem } from './timelog-entry-item.class';
import * as moment from 'moment';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ColorConverter } from '../../../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../../../shared/utilities/color-type.enum';
import { ActivityTree } from '../../../../../../activities/api/activity-tree.class';

export class TimelogEntryBuilder {
    constructor() {

    }

    public buildFromDataItem(dataItem: DaybookTimelogEntryDataItem): TimelogEntryItem {
        const startTime = moment(dataItem.startTimeISO);
        const endTime = moment(dataItem.endTimeISO);
        const timelogEntryItem: TimelogEntryItem = new TimelogEntryItem(startTime, endTime);
        timelogEntryItem.setIsSaved();
        timelogEntryItem.timelogEntryActivities = dataItem.timelogEntryActivities;
        timelogEntryItem.embeddedNote = dataItem.embeddedNote;
        return timelogEntryItem;
    }

    public buildNew(startTime: moment.Moment, endTime: moment.Moment): TimelogEntryItem {
        return new TimelogEntryItem(startTime, endTime);
    }

    public getBackgroundColor(timelogEntry: TimelogEntryItem, activityTree: ActivityTree): string {
        let backgroundColor: string = '';
        if (timelogEntry) {
            if (timelogEntry.timelogEntryActivities.length > 0) {
                let topActivitySet: boolean = false;
                timelogEntry.timelogEntryActivities.sort((a1, a2) => {
                    if (a1.percentage > a2.percentage) return -1;
                    else if (a1.percentage < a2.percentage) return 1;
                    else return 0;
                }).forEach((activityEntry) => {
                    const foundActivity: ActivityCategoryDefinition = activityTree.findActivityByTreeId(activityEntry.activityTreeId);
                    const durationMS: number = (activityEntry.percentage * timelogEntry.durationMilliseconds) / 100;
                    const durationMinutes: number = durationMS / (60 * 1000);
                    if (!topActivitySet) {
                        topActivitySet = true;
                        const alpha = 0.2;
                        backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
                    }

                });
            }
        }
        return backgroundColor;
    }
}
