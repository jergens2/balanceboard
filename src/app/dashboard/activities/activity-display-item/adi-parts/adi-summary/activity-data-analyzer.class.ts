import { DaybookDayItem } from '../../../../daybook/daybook-day-item/daybook-day-item.class';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import * as moment from 'moment';
import { ADIChartDisplayItem } from './adi-chart-display-item.class';
import { ActivityDataSleepAnalyzer } from './activity-data-sleep-analyzer.class';
import { ActivityAnalysis } from './activity-analysis.interface';
import { ADIOccurrence, ADIOccurrenceData } from './adi-occurrence-data.interface';
import { ActivitySummaryData } from '../../../activities-summary/activity-summary-data.interface';
import { ActivityDefinitionTree } from '../../../api/activity-definition-tree.class';

export class ActivityDataAnalyzer {

    private _daybookItems: DaybookDayItem[] = [];
    private _tree: ActivityDefinitionTree;

    private _activityOccurrences: ADIOccurrenceData[];
    // private _weekHourData: ADIWeekDataChartItem[] = [];

    public get activityOccurences(): ADIOccurrenceData[] { return this._activityOccurrences; }
    public get daybookItems(): DaybookDayItem[] { return this._daybookItems; }
    // public get occurrencesTotal(): string { return this._summaryValOccurrencesTotal; }
    // public get durationHoursTotal(): string { return this._summaryValDurationHoursTotal; }
    // public get medianHoursPerWeek(): string { return this._summaryValMedianHoursPerWeek; }
    // public get medianOccurrencesPerWeek(): string { return this._summaryValMedianOccurrencesPerWeek; }

    // public get weekHourData(): ADIWeekDataChartItem[] { return this._weekHourData; }

    constructor(daybookItems: DaybookDayItem[], tree: ActivityDefinitionTree) {
        this._daybookItems = daybookItems;
        this._tree = tree;
        this._calculateAllActivityOccurrences();
    }


    private _calculateAllActivityOccurrences() {
        // console.log("Calculating all daybookDayItems: " + this._daybookItems.length);
        const start = moment();

        const activityOccurrences: ADIOccurrenceData[] = [];
        this._daybookItems.forEach(dayItem => {
            dayItem.timelogEntryDataItems.forEach(tledi => {
                const startTime: moment.Moment = moment(tledi.startTimeISO);
                const endTime: moment.Moment = moment(tledi.endTimeISO);
                const durationMs = moment(endTime).diff(startTime, 'milliseconds');
                tledi.timelogEntryActivities.forEach(tlea => {
                    const occurrence = {
                        dateYYYYMMDD: startTime.format('YYYY-MM-DD'),
                        startTime: moment(startTime),
                        endTime: moment(endTime),
                        durationMs: durationMs * (tlea.percentage / 100)
                    };
                    const foundActivity = activityOccurrences.find(ao => ao.activityTreeId === tlea.activityTreeId);
                    if (foundActivity) {
                        foundActivity.occurrences.push(occurrence);
                    } else {
                        activityOccurrences.push({
                            activityTreeId: tlea.activityTreeId,
                            occurrences: [occurrence],
                            totalMs: occurrence.durationMs,
                            msPerOccurrence: occurrence.durationMs,
                        });
                    }
                });
            });
        });

        activityOccurrences.forEach(activityOccurrence => {
            let totalMs: number = 0;
            activityOccurrence.occurrences.forEach(o => {
                totalMs += o.durationMs;
            });
            activityOccurrence.totalMs = totalMs;
            activityOccurrence.msPerOccurrence = totalMs / activityOccurrence.occurrences.length;
        });


        activityOccurrences.sort((a1, a2) => {
            if (a1.totalMs > a2.totalMs) {
                return -1;
            } else if (a1.totalMs < a2.totalMs) {
                return 1;
            } else {
                return 0;
            }
        });

        // console.log("activity occurrences: " )
        // activityOccurrences.forEach(item => {
        //     console.log(item)
        // })

        this._activityOccurrences = activityOccurrences;
        const end = moment();
        // console.log("Method duration ms: " + end.diff(start, 'milliseconds'));
    }


    public getOccurrences(startDateYYYYMMDD: string, endDateYYYYMMDD: string): ADIOccurrenceData[] {
        const rangeActivities: ADIOccurrenceData[] = [];
        this._activityOccurrences.forEach(activityOccurrence => {
            const rangeItems = activityOccurrence.occurrences.filter(occurrence => {
                return occurrence.dateYYYYMMDD >= startDateYYYYMMDD && occurrence.dateYYYYMMDD <= endDateYYYYMMDD;
            });
            if (rangeItems.length > 0) {
                let totalMs: number = 0;
                let msPerOccurrence: number = 0;
                rangeItems.forEach(rangeItem => {
                    totalMs += rangeItem.durationMs;
                });
                msPerOccurrence = totalMs / rangeItems.length;
                rangeActivities.push({
                    activityTreeId: activityOccurrence.activityTreeId,
                    occurrences: rangeItems,
                    totalMs: totalMs,
                    msPerOccurrence: msPerOccurrence,
                });
            }
        });
        return rangeActivities.sort((a1, a2) => {
            if (a1.totalMs > a2.totalMs) {
                return -1;
            } else if (a1.totalMs < a2.totalMs) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    public getSummaryItems(startDateYYYYMMDD: string, endDateYYYYMMDD: string): ActivitySummaryData[] {
        const occurrences = this.getOccurrences(startDateYYYYMMDD, endDateYYYYMMDD);
        // const workingActivities: ActivityCategoryDefinition[] = occurrences
        //     .map(item => this._tree.findActivityByTreeId(item.activityTreeId));
        const totalMs = this.getSumTotalMs(startDateYYYYMMDD, endDateYYYYMMDD);
        const rootActivities = this._tree.rootActivities;
        return [];
    }


    private _buildSummaryData(activity: ActivityCategoryDefinition,
        occurrenceData: ADIOccurrenceData[]) {
        const thisOccurrenceData = occurrenceData.find(item => item.activityTreeId === activity.treeId);
        const children = activity.children;

    }

    public getSumTotalMs(startDateYYYYMMDD: string, endDateYYYYMMDD: string): number {
        const occData = this.getOccurrences(startDateYYYYMMDD, endDateYYYYMMDD);
        let sum: number = 0;
        occData.forEach(item => sum += item.totalMs);
        return sum;
    }


}
