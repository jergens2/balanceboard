import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { DaybookDayItem } from '../../../../daybook/daybook-day-item/daybook-day-item.class';
import { ActivityDataAnalyzer } from './activity-data-analyzer.class';
import { ActivityDataSleepAnalyzer } from './activity-data-sleep-analyzer.class';
import { ActivityAnalysis } from './activity-analysis.interface';
import { ActivityDefinitionTree } from '../../../api/activity-definition-tree.class';
import * as moment from 'moment';
import { ADIOccurrenceData } from './adi-occurrence-data.interface';

export class ActivityDataSummarizer {


    private _sortedActivities: ActivityCategoryDefinition[] = [];
    private _activityAnalyses: ActivityAnalysis[] = [];
    private _activityAnalyzer: ActivityDataAnalyzer;

    public get activityOccurences(): ADIOccurrenceData[] { return this._activityAnalyzer.activityOccurences; }

    constructor(daybookItems: DaybookDayItem[], activityTree: ActivityDefinitionTree) {
        this._activityAnalyzer = new ActivityDataAnalyzer(daybookItems, activityTree);
        const sleepAnalyzer = new ActivityDataSleepAnalyzer(daybookItems);

        // const activityAnalyses: ActivityAnalysis[] = activityTree.allActivities.map<ActivityAnalysis>(activity => {
        //     return this._activityAnalyzer.getAnalysis(activity, this._defaultQuery, false);
        // })
        // this._activityAnalyses = [...activityAnalyses];

        // this._activityAnalyses.sort((item1, item2)=>{
        //     if(item1.totalMs > item2.totalMs){ return -1;}
        //     else if(item1.totalMs < item2.totalMs) { return 1; }
        //     return 0;
        // }).forEach(item => {
        //     console.log(" " + item.definition.name  + " Total MS: " + item.totalMs)
        // })
        // console.log("Sorted activities: ")
        // this._sortedActivities.forEach(item => {
        //     console.log(" " + item.definition.name + " --- ", item)
        // })
    }

    public get analyzer(): ActivityDataAnalyzer { return this._activityAnalyzer; }

    public analyzeActivityAndChildren(currentActivty: ActivityCategoryDefinition) {
        console.log("method disabled")
        // this._activityAnalyzer.getAnalysis(currentActivty, this._defaultQuery, true);
    }

    private get _defaultQuery(): { startTime: moment.Moment, endTime: moment.Moment, } {
        const now = moment();
        const defaultRangeDays: number = 365;
        const start = moment(now).subtract(defaultRangeDays, 'days');
        const end = moment(now);
        return {
            startTime: start,
            endTime: end,
        };
    }

}
