import { ADIChartDisplayItem } from "./adi-chart-display-item.class";
import * as moment from 'moment';
import { ADIOccurrence, ADIOccurrenceData } from "./adi-occurrence-data.interface";
import { ActivityCategoryDefinition } from "../../../api/activity-category-definition.class";
import { ActivityTree } from "../../../api/activity-tree.class";
import { ADIChartItemData } from "./adi-chart-item-data.interface";


export class ADIChartItemBuilder {
    /**Activity Display Item Chart Item Builder */

    private _chartItems: ADIChartDisplayItem[];

    public get chartItems(): ADIChartDisplayItem[] { return this._chartItems; }

    constructor(currentActivity: ActivityCategoryDefinition, occurrenceData: ADIOccurrenceData[],
        includeChildren: boolean, tree: ActivityTree,
        currentRangeStart: moment.Moment, currentRangeEnd: moment.Moment, currentRange: 7 | 30 | 90 | 365 | 'Specify') {
        let totalActivityMs: number = 0;
        occurrenceData.forEach(item => totalActivityMs += item.totalMs);
        let activityIds: string[] = [currentActivity.treeId];
        if (includeChildren) {
            const allActivities = tree.allActivities;
            activityIds = [currentActivity.treeId, ...currentActivity.getAllChildActivities()];
        }
        let currentDateYYYYMMDD: string = moment(currentRangeStart).format('YYYY-MM-DD');
        const lastDateYYYYMMDD: string = moment().day(6).format('YYYY-MM-DD');
        if (moment(currentDateYYYYMMDD).day() > 0) {
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).subtract(moment(currentDateYYYYMMDD).day(), 'days').format('YYYY-MM-DD');
        }
        const activitiesOccurrenceData = occurrenceData.filter(dataItem => activityIds.indexOf(dataItem.activityTreeId) > -1);
        const allDayDataItems: ADIChartItemData[] = [];
        while (currentDateYYYYMMDD <= lastDateYYYYMMDD) {
            const startOfDay = moment(currentDateYYYYMMDD).startOf('day');
            const endOfDay = moment(currentDateYYYYMMDD).endOf('day');

            let dayOccurrences: ADIOccurrence[] = [];
            activitiesOccurrenceData.forEach(activityOccurrenceData => {
                const inRangeItems = activityOccurrenceData.occurrences.filter(occurrence => {
                    return occurrence.startTime.isSameOrAfter(startOfDay) && occurrence.endTime.isSameOrBefore(endOfDay);
                });
                if (inRangeItems.length > 0) {
                    dayOccurrences = [...dayOccurrences, ...inRangeItems];
                }
            });
            let daySumMs: number = 0;
            let dayOccurrenceCount: number = 0;
            let largestDayMs: number = 0;
            dayOccurrences.forEach(dayOccurrence => {
                dayOccurrenceCount++;
                daySumMs += dayOccurrence.durationMs;
                if (dayOccurrence.durationMs > largestDayMs) {
                    largestDayMs = dayOccurrence.durationMs;
                }
            });

            const dayChartItem: ADIChartItemData = {
                startDateYYYYMMDD: currentDateYYYYMMDD,
                ms: daySumMs,
                msCumulativePercent: 0,
                msPercentOfLargest: 0,
                occurrenceCount: dayOccurrenceCount,
                occurrenceCumulativePercent: 0,
                occurrencePercentOfLargest: 0,
            };
            allDayDataItems.push(dayChartItem);
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        const isWeekMode = currentRange === 365;
        const dataItems: ADIChartItemData[] = [];
        if (isWeekMode) {
            let currentWeekYYYYMMDD: string = moment(currentRangeStart).format('YYYY-MM-DD');
            const lastDateYYYYMMDD: string = moment().day(6).format('YYYY-MM-DD');
            if (moment(currentWeekYYYYMMDD).day() > 0) {
                currentWeekYYYYMMDD = moment(currentWeekYYYYMMDD).subtract(moment(currentWeekYYYYMMDD).day(), 'days').format('YYYY-MM-DD');
            }
            let largestWeekMs: number = 0;
            let largestWeekOcc: number = 0;
            let sumOfAllWeeksMs: number = 0;
            let sumOfAllOcc: number = 0;
            while (currentWeekYYYYMMDD <= lastDateYYYYMMDD) {
                const endOfWeekYYYYMMDD = moment(currentWeekYYYYMMDD).day(6).format('YYYY-MM-DD')
                const weekItems = allDayDataItems.filter(item => {
                    return item.startDateYYYYMMDD >= currentWeekYYYYMMDD && item.startDateYYYYMMDD <= endOfWeekYYYYMMDD;
                });
                let sumOfWeekMs: number = 0;
                let weekOccurrenceCount: number = 0;
                weekItems.forEach(item => {
                    sumOfWeekMs += item.ms;
                    weekOccurrenceCount += item.occurrenceCount;
                });
                const dataItem: ADIChartItemData = {
                    startDateYYYYMMDD: currentWeekYYYYMMDD,
                    ms: sumOfWeekMs,
                    msCumulativePercent: 0,
                    msPercentOfLargest: 0,
                    occurrenceCount: weekOccurrenceCount,
                    occurrenceCumulativePercent: 0,
                    occurrencePercentOfLargest: 0,
                };
                if (sumOfWeekMs > largestWeekMs) {
                    largestWeekMs = sumOfWeekMs;
                }
                if (weekOccurrenceCount > largestWeekOcc) {
                    largestWeekOcc = weekOccurrenceCount;
                }
                sumOfAllOcc += weekOccurrenceCount;
                dataItems.push(dataItem);
                sumOfAllWeeksMs += sumOfWeekMs;
                currentWeekYYYYMMDD = moment(currentWeekYYYYMMDD).add(7, 'days').format('YYYY-MM-DD');
            }

            let cumulativePercentCount: number = 0;
            let cumulativePercentMs: number = 0;
            for (let i = 0; i < dataItems.length; i++) {
                const percentOfLargest = dataItems[i].ms / largestWeekMs;
                const percentOfLargestOcc = dataItems[i].occurrenceCount / largestWeekOcc;
                cumulativePercentMs += dataItems[i].ms / sumOfAllWeeksMs;
                cumulativePercentCount += (dataItems[i].occurrenceCount / sumOfAllOcc);
                dataItems[i].msPercentOfLargest = percentOfLargest;
                dataItems[i].msCumulativePercent = cumulativePercentMs;

                // console.log("CUMULATIVE PERCENT COUNT IS " + cumulativePercentCount)
                // console.log("occurrence percent of largest" + percentOfLargestOcc)
                dataItems[i].occurrenceCumulativePercent = cumulativePercentCount;
                dataItems[i].occurrencePercentOfLargest = percentOfLargestOcc;
            }

        } else {
            const startDateYYYYMMDD = currentRangeStart.format('YYYY-MM-DD');
            const endDateYYYYMMDD = currentRangeEnd.format('YYYY-MM-DD');
            let currentDayDateYYYYMMDD = startDateYYYYMMDD;
            let largestDayMs: number = 0;
            let largestOccurrences: number = 0;
            let sumOfAllDaysMs: number = 0;
            let sumOfAllOccurrences: number = 0;
            while (currentDayDateYYYYMMDD <= endDateYYYYMMDD) {
                const dataItem: ADIChartItemData = allDayDataItems.find(item => item.startDateYYYYMMDD === currentDayDateYYYYMMDD);
                dataItems.push(dataItem);
                currentDayDateYYYYMMDD = moment(currentDayDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
                if (dataItem.ms > largestDayMs) {
                    largestDayMs = dataItem.ms;
                }
                if (dataItem.occurrenceCount > largestOccurrences) {
                    largestOccurrences = dataItem.occurrenceCount;
                }
                sumOfAllOccurrences += dataItem.occurrenceCount;
                sumOfAllDaysMs += dataItem.ms;
            }
            let cumulativeMsPercent: number = 0;
            let cumulativeCountPercent: number = 0;
            for (let i = 0; i < dataItems.length; i++) {
                const percentOfLargestMs = dataItems[i].ms / largestDayMs;
                const percentOfLargestOcc = dataItems[i].occurrenceCount / largestOccurrences;
                cumulativeMsPercent += dataItems[i].ms / sumOfAllDaysMs;
                cumulativeCountPercent += dataItems[i].occurrenceCount / sumOfAllOccurrences;;

                dataItems[i].msPercentOfLargest = percentOfLargestMs;
                dataItems[i].msCumulativePercent = cumulativeMsPercent;

                dataItems[i].occurrenceCumulativePercent = cumulativeCountPercent;
                dataItems[i].occurrencePercentOfLargest = percentOfLargestOcc;
            }
        }
        // console.log("DATA ITEMS: ", dataItems)
        this._chartItems = dataItems.map(item => {
            const chartItem = new ADIChartDisplayItem(item, currentActivity.color);
            return chartItem;
        });

    }


}