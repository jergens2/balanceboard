import { DaybookDayItem } from "../../../../daybook/api/daybook-day-item.class";
import { ActivityTree } from "../../../api/activity-tree.class";
import { ActivityCategoryDefinition } from "../../../api/activity-category-definition.class";
import * as moment from 'moment';
import { ActivityCategoryDefinitionService } from "../../../api/activity-category-definition.service";
import { ADIWeekDataChartItem } from "./adi-week-data-chart-item.class";

export class ActivityDataAnalyzer {

    private _daybookItems: DaybookDayItem[] = [];

    private _summaryValOccurrencesTotal: string = '';
    private _summaryValDurationHoursTotal: string = '';
    private _summaryValMedianHoursPerWeek: string = '';
    private _summaryValMedianOccurrencesPerWeek: string = '';

    private _weekHourData: ADIWeekDataChartItem[] = [];

    public get occurrencesTotal(): string { return this._summaryValOccurrencesTotal; }
    public get durationHoursTotal(): string { return this._summaryValDurationHoursTotal; }
    public get medianHoursPerWeek(): string { return this._summaryValMedianHoursPerWeek; }
    public get medianOccurrencesPerWeek(): string { return this._summaryValMedianOccurrencesPerWeek; }

    public get weekHourData(): ADIWeekDataChartItem[] { return this._weekHourData; }

    constructor(daybookItems: DaybookDayItem[],) {
        this._daybookItems = daybookItems;
        this.analyzeActivity
    }

    private get _defaultQuery(): { startTime: moment.Moment, endTime: moment.Moment, } {
        const now = moment();
        const defaultRangeDays: number = 365;
        const start = moment(now).subtract(defaultRangeDays, 'days');
        const end = moment(now);
        return {
            startTime: start,
            endTime: end,
        }
    }

    public get daybookItems(): DaybookDayItem[] { return this._daybookItems; }

    public analyzeActivity(activity: ActivityCategoryDefinition, query = this._defaultQuery) {

        const childIds: string[] = [activity.treeId, ...activity.getAllChildActivities()];
        const relevantItems = this.daybookItems.filter(daybookItem => daybookItem.timelogEntryDataItems
            .find(tledi => tledi.timelogEntryActivities.find(tlea => childIds.find(id => id === tlea.activityTreeId))));
        const startDateYYYYMMDD: string = moment(query.startTime).format('YYYY-MM-DD');
        let currentDateYYYYMMDD: string = moment(startDateYYYYMMDD).format('YYYY-MM-DD');

        let occurrencesPerWeek: number[] = [];
        let msPerWeek: { startDateYYYYMMDD: string, ms: number }[] = [];
        let currentWeekMs: number = 0;
        let currentWeekOccurrences: number = 0;
        while (currentDateYYYYMMDD < moment(query.endTime).format('YYYY-MM-DD')) {
            const foundDayItem = relevantItems.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
            if (foundDayItem) {
                foundDayItem.timelogEntryDataItems.forEach(tledi => {
                    const startTime: moment.Moment = moment(tledi.startTimeISO);
                    const endTime: moment.Moment = moment(tledi.endTimeISO);
                    const durationMs = moment(endTime).diff(startTime, 'milliseconds');
                    tledi.timelogEntryActivities.forEach(tlea => {
                        childIds.forEach(childId => {
                            if (tlea.activityTreeId === childId) {
                                currentWeekMs += (durationMs * (tlea.percentage / 100));
                                currentWeekOccurrences++;
                            }
                        });
                    });
                });
            }
            if (moment(currentDateYYYYMMDD).day() === 6) {
                msPerWeek.push({
                    startDateYYYYMMDD: moment(currentDateYYYYMMDD).startOf('week').format('YYYY-MM-DD'),
                    ms: currentWeekMs,
                });
                occurrencesPerWeek.push(currentWeekOccurrences);
                currentWeekMs = 0;
                currentWeekOccurrences = 0;
            }
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        let sumMs = 0;
        msPerWeek.forEach(ms => sumMs += ms.ms);
        this._summaryValDurationHoursTotal = (sumMs / (1000 * 60 * 60)).toFixed(1);
        const sortedMs = msPerWeek.sort((m1, m2) => {
            if (m1 < m2) { return -1; }
            if (m1 > m2) { return 1; }
            return 0;
        });

        if (sortedMs.length > 0) {
            let half = ((sortedMs.length - 1) / 2);
            if (sortedMs.length % 2 === 0) {
                half = (sortedMs.length / 2);
            }
            if (half > 0) { half--; }
            console.log(sortedMs)
            console.log(sortedMs[half])
            this._summaryValMedianHoursPerWeek = (sortedMs[half].ms / (1000 * 60 * 60)).toFixed(1);
        }
        let cumulativePercent: number = 0;
        this._weekHourData = msPerWeek.map(item => {
            const hours = item.ms / (1000 * 60 * 60);
            const percent: number = (item.ms / sumMs) * 100;
            cumulativePercent += percent;
            const color = activity.color;
            return new ADIWeekDataChartItem(item.startDateYYYYMMDD, hours, percent, cumulativePercent);
        });
        let largestHours = 0;
        this._weekHourData.forEach(item => {
            if(item.hours > largestHours){ largestHours = item.hours; }
        })
        this._weekHourData.forEach(item => {
            const alpha = (item.hours / largestHours).toFixed(2);
            item.setColor(activity.color, alpha);
        });

    }


}