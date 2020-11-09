import { DaybookDayItem } from '../../../../daybook/daybook-day-item/daybook-day-item.class';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import * as moment from 'moment';
import { ADIWeekDataChartItem } from './adi-week-data-chart-item.class';
import { ActivityDataSleepAnalyzer } from './activity-data-sleep-analyzer.class';
import { ActivityAnalysis } from './activity-analysis.interface';
import { ADIOccurrenceData } from './adi-occurrence-data.interface';

export class ActivityDataAnalyzer {

    private _daybookItems: DaybookDayItem[] = [];

    private _activityOccurrences: ADIOccurrenceData[];
    // private _weekHourData: ADIWeekDataChartItem[] = [];

    public get activityOccurences(): ADIOccurrenceData[] { return this._activityOccurrences; }

    // public get occurrencesTotal(): string { return this._summaryValOccurrencesTotal; }
    // public get durationHoursTotal(): string { return this._summaryValDurationHoursTotal; }
    // public get medianHoursPerWeek(): string { return this._summaryValMedianHoursPerWeek; }
    // public get medianOccurrencesPerWeek(): string { return this._summaryValMedianOccurrencesPerWeek; }

    // public get weekHourData(): ADIWeekDataChartItem[] { return this._weekHourData; }

    constructor(daybookItems: DaybookDayItem[],) {
        this._daybookItems = daybookItems;
        console.log('Daybook day items: ' + this._daybookItems.length)
        let sumTLEs = 0;
        this._daybookItems.forEach(item => {
            sumTLEs += item.timelogEntryDataItems.length;
        })
        console.log('total count of Timelog Entries: ' + sumTLEs)
        this._analyzeInitial(90);
        this._calculateAll();
    }


    private _calculateAll() {
        console.log("Calculating all daybookDayItems: " + this._daybookItems.length);
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


        activityOccurrences.sort((a1, a2)=> {
            if(a1.totalMs > a2.totalMs){
                return -1;
            }else if(a1.totalMs < a2.totalMs){
                return 1;
            }else{
                return 0;
            }
        });

        // console.log("activity occurrences: " )
        // activityOccurrences.forEach(item => {
        //     console.log(item)
        // })

        this._activityOccurrences = activityOccurrences;
        const end = moment();
        console.log("Method duration ms: " + end.diff(start, 'milliseconds'));
    }



    private _analyzeInitial(days: number = 90) {
        this._analyzeSleep();

    }
    private _analyzeSleep() {

    }




    public get daybookItems(): DaybookDayItem[] { return this._daybookItems; }

    public getAnalysis(activity: ActivityCategoryDefinition,
        query: { startTime: moment.Moment, endTime: moment.Moment },
        includeChildren: boolean): ActivityAnalysis {
        const childIds: string[] = [activity.treeId, ...activity.getAllChildActivities()];
        const allIds: string[] = includeChildren === true ? childIds : [activity.treeId];
        const relevantItems = this.daybookItems.filter(daybookItem => daybookItem.timelogEntryDataItems
            .find(tledi => tledi.timelogEntryActivities.find(tlea => allIds.find(id => id === tlea.activityTreeId))));
        const startDateYYYYMMDD: string = moment(query.startTime).format('YYYY-MM-DD');
        let currentDateYYYYMMDD: string = moment(startDateYYYYMMDD).format('YYYY-MM-DD');
        let occurrenceData: {
            dateYYYYMMDD: string,
            occurrences: number,
            ms: number
        }[] = [];
        while (currentDateYYYYMMDD < moment(query.endTime).format('YYYY-MM-DD')) {
            const foundDayItem = relevantItems.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
            if (foundDayItem) {

                let ms: number = 0;
                let occurrences: number = 0;
                foundDayItem.timelogEntryDataItems.forEach(tledi => {
                    const startTime: moment.Moment = moment(tledi.startTimeISO);
                    const endTime: moment.Moment = moment(tledi.endTimeISO);
                    const durationMs = moment(endTime).diff(startTime, 'milliseconds');
                    tledi.timelogEntryActivities.forEach(tlea => {
                        childIds.forEach(childId => {
                            if (tlea.activityTreeId === childId) {
                                ms += (durationMs * (tlea.percentage / 100));
                                occurrences++;
                            }
                        });
                    });
                });
                occurrenceData.push({
                    dateYYYYMMDD: foundDayItem.dateYYYYMMDD,
                    occurrences: occurrences,
                    ms: ms,
                });
            }
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }


        const analysis: ActivityAnalysis = this._calculateAnalysis(occurrenceData, activity);
        return analysis;
    }

    private _calculateAnalysis(occurrenceData: { dateYYYYMMDD: string, occurrences: number, ms: number }[],
        activity: ActivityCategoryDefinition): ActivityAnalysis {
        let analysis = {
            definition: activity,
            averageMsPerWeek: 0,
            averageMsPerDay: 0,
            averageOccurrencesPerWeek: 0,
            averageOccurrencesPerDay: 0,
            averageMsPerOccurrence: 0,
            medianMsPerWeek: 0,
            medianMsPerDay: 0,
            medianOccurrencesPerWeek: 0,
            medianOccurrencesPerDay: 0,
            // medianMsPerOccurrence: 0,
            totalOccurrences: 0,
            totalMs: 0,
        };
        if (occurrenceData.length > 0) {
            let currentDateYYYYMMDD: string = moment(occurrenceData[0].dateYYYYMMDD).startOf('week').format('YYYY-MM-DD');
            let weekOccurrenceData: { startDateYYYYMMDD: string, occurrences: number, ms: number }[] = [];
            let currentWeekData: { startDateYYYYMMDD: string, occurrences: number, ms: number } = {
                startDateYYYYMMDD: currentDateYYYYMMDD, occurrences: 0, ms: 0,
            };
            for (let i = 0; i < occurrenceData.length; i++) {
                currentWeekData.ms += occurrenceData[i].ms;
                currentWeekData.occurrences += occurrenceData[i].occurrences;
                if (moment(occurrenceData[i].dateYYYYMMDD).day() === 6) {
                    weekOccurrenceData.push(currentWeekData);
                    currentWeekData = { startDateYYYYMMDD: currentDateYYYYMMDD, occurrences: 0, ms: 0, };
                } else if (i === occurrenceData.length - 1) {
                    weekOccurrenceData.push(currentWeekData);
                }
            }
            const sortedDayOccurrenceData = occurrenceData.sort((day1, day2) => {
                if (day1.ms > day2.ms) { return -1; }
                else if (day1.ms < day2.ms) { return 1; }
                return 0;
            });
            const sortedWeekOccurrenceData = weekOccurrenceData.sort((week1, week2) => {
                if (week1.ms > week2.ms) { return -1; }
                else if (week1.ms < week2.ms) { return 1; }
                return 0;
            });
            let sumMs: number = 0;
            let sumOccurrences: number = 0;
            sortedDayOccurrenceData.forEach(d => { sumMs += d.ms; sumOccurrences += d.occurrences; });
            const weekHalfIndex = sortedWeekOccurrenceData.length % 2 === 0 ? sortedWeekOccurrenceData.length / 2 : (sortedWeekOccurrenceData.length - 1) / 2;
            const dayHalfIndex = sortedDayOccurrenceData.length % 2 === 0 ? sortedDayOccurrenceData.length / 2 : (sortedDayOccurrenceData.length - 1) / 2;

            // console.log("weekHalfIndex, dayHalfIndex: ", weekHalfIndex, dayHalfIndex);
            // console.log("sorted week occurrence data",)
            // sortedWeekOccurrenceData.forEach(item => console.log(item))

            analysis = {
                definition: activity,
                averageMsPerWeek: sumMs / sortedWeekOccurrenceData.length,
                averageMsPerDay: sumMs / sortedDayOccurrenceData.length,
                averageOccurrencesPerWeek: sumOccurrences / sortedWeekOccurrenceData.length,
                averageOccurrencesPerDay: sumOccurrences / sortedDayOccurrenceData.length,
                averageMsPerOccurrence: sumMs / sumOccurrences,
                medianMsPerWeek: sortedWeekOccurrenceData[weekHalfIndex].ms,
                medianMsPerDay: sortedDayOccurrenceData[dayHalfIndex].ms,
                medianOccurrencesPerWeek: sortedWeekOccurrenceData[weekHalfIndex].occurrences,
                medianOccurrencesPerDay: sortedDayOccurrenceData[dayHalfIndex].occurrences,
                totalOccurrences: sumOccurrences,
                totalMs: sumMs,
            };
        }
        return analysis;
    }

}
