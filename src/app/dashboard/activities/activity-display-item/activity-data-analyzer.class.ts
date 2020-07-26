import { DaybookDayItem } from "../../daybook/api/daybook-day-item.class";
import { ActivityTree } from "../api/activity-tree.class";
import { ActivityCategoryDefinition } from "../api/activity-category-definition.class";
import * as moment from 'moment';
import { ActivityCategoryDefinitionService } from "../api/activity-category-definition.service";

export class ActivityDataAnalyzer {

    private _daybookItems: DaybookDayItem[] = [];
    private _definitionService: ActivityCategoryDefinitionService;

    private _summaryValOccurrencesTotal: string = '';
    private _summaryValDurationHoursTotal: string = '';
    private _summaryValMedianHoursPerWeek: string = '';
    private _summaryValMedianOccurrencesPerWeek: string = '';

    public get occurrencesTotal(): string { return this._summaryValOccurrencesTotal; }
    public get durationHoursTotal(): string { return this._summaryValDurationHoursTotal; }
    public get medianHoursPerWeek(): string { return this._summaryValMedianHoursPerWeek; }
    public get medianOccurrencesPerWeek(): string { return this._summaryValMedianOccurrencesPerWeek; }

    constructor(daybookItems: DaybookDayItem[], definitionService: ActivityCategoryDefinitionService) {
        this._daybookItems = daybookItems;
        this._definitionService = definitionService;
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
        let dayOfSeven = 0;
        let occurrencesPerWeek: number[] = [];
        let msPerWeek: number[] = [];
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
            if (dayOfSeven <= 6) {
                dayOfSeven++;
            } else {
                dayOfSeven = 0;
                msPerWeek.push(currentWeekMs);
                occurrencesPerWeek.push(currentWeekOccurrences);
                currentWeekMs = 0;
                currentWeekOccurrences = 0;
            }
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        let sumMs = 0;
        msPerWeek.forEach(ms => sumMs += ms);
        this._summaryValDurationHoursTotal = (sumMs / (1000 * 60 * 60)).toFixed(1);
        const sortedMs = msPerWeek.sort((m1, m2)=>{
            if(m1 < m2) { return -1;}
            if(m1 > m2) { return 1;}
            return 0;
        });
        
        if(sortedMs.length > 0){
            let half = ((sortedMs.length-1) / 2);
            if(sortedMs.length % 2 === 0){
                half = (sortedMs.length / 2);
            }
            if(half > 0){ half--;}
            console.log(sortedMs)
            console.log(sortedMs[half])
            this._summaryValMedianHoursPerWeek = (sortedMs[half] / (1000 * 60 * 60)).toFixed(1);
        }
        
    }


}