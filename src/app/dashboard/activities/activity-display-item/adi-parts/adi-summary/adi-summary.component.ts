import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivityDataAnalyzer } from './activity-data-analyzer.class';
import { ActivityComponentService } from '../../../activity-component.service';
import { ButtonMenu } from '../../../../../shared/components/button-menu/button-menu.class';
import * as moment from 'moment';
import { ADIChartDisplayItem } from './adi-chart-display-item.class';
import { ActivityAnalysis } from './activity-analysis.interface';
import { ADIOccurrence, ADIOccurrenceData } from './adi-occurrence-data.interface';
import { ADIChartItemData } from './adi-chart-item-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-adi-summary',
  templateUrl: './adi-summary.component.html',
  styleUrls: ['./adi-summary.component.css']
})
export class AdiSummaryComponent implements OnInit, OnDestroy {

  constructor(private activitiesService: ActivityComponentService) { }

  private _rangeMenu: ButtonMenu = new ButtonMenu();
  private _analysis: ActivityAnalysis;
  private _occurrencesTotal: string;
  private _durationHoursTotal: string;
  private _medianHoursPerWeek: string;
  private _medianOccurrencesPerWeek: string;
  private _currentRange: 7 | 30 | 90 | 365 | 'Specify';
  private _currentRangeStart: moment.Moment;
  private _currentRangeEnd: moment.Moment;
  private _chartItems: ADIChartDisplayItem[] = [];
  private _includeChildren: boolean = true;

  private _reloadSub: Subscription;
  private _firstBurned: boolean = false;

  public get analyzer(): ActivityDataAnalyzer { return this.activitiesService.summarizer.analyzer; }
  public get occurrencesTotal(): string { return this._occurrencesTotal; }
  public get durationHoursTotal(): string { return this._durationHoursTotal; }
  public get medianHoursPerWeek(): string { return this._medianHoursPerWeek; }
  public get medianOccurrencesPerWeek(): string { return this._medianOccurrencesPerWeek; }
  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }

  public get chartItems(): ADIChartDisplayItem[] { return this._chartItems; }

  public get currentRange(): 7 | 30 | 90 | 365 | 'Specify' { return this._currentRange; }


  public get analysis(): ActivityAnalysis { return this._analysis; }
  public get includeChildren(): boolean { return this._includeChildren; }

  ngOnInit(): void {
    console.log('Activity occurrence data:' + this.analyzer.activityOccurences.length);
    this._setRange(365);
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange(7));
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange(30));
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange(90));
    const sub365 = this._rangeMenu.addItem$('365');
    this._rangeMenu.menuItems.find(item => item.label === '365').selectItem();
    sub365.subscribe(s => this._setRange(365));

    // this._rangeMenu.addItem$('Specify').subscribe(s => this._setRange('Specify'));
    this._reloadSub = this.activitiesService.currentActivity$.subscribe(item => {
      if (this._firstBurned) {
        this._reload();
      } else {
        this._firstBurned = true;
      }
    });
  }

  ngOnDestroy() {
    this._reloadSub.unsubscribe();
  }

  private _setRange(range: 7 | 30 | 90 | 365 | 'Specify') {
    this._currentRange = range;
    this._currentRangeEnd = moment();
    if (range === 'Specify') {
      console.log('method disabled')
      this._currentRangeStart = moment().subtract(30, 'days');
    } else {
      this._currentRangeStart = moment().subtract(range, 'days');
    }
    this._reload();
  }

  private _reload() {
    const currentActivity = this.activitiesService.currentActivity;
    if (currentActivity) {
      const occurrenceData = this.activitiesService.summarizer.activityOccurences;
      const foundActivityData = occurrenceData.find(item => item.activityTreeId === currentActivity.treeId);
      this._buildChartItems();


      if (foundActivityData) {
        this._analysis = this._buildAnalysis(foundActivityData);

      } else {
        this._occurrencesTotal = '0';
        this._durationHoursTotal = '0';
        this._medianHoursPerWeek = '0';
        this._medianOccurrencesPerWeek = '0';
      }
    }


  }

  private _buildChartItems() {
    const currentActivity = this.activitiesService.currentActivity;
    const occurrenceData: ADIOccurrenceData[] = this.activitiesService.summarizer.activityOccurences;
    let totalActivityMs: number = 0;
    occurrenceData.forEach(item => totalActivityMs += item.totalMs);
    let activityIds: string[] = [currentActivity.treeId];
    if (this.includeChildren) {
      const tree = this.activitiesService.activityTree;
      const allActivities = tree.allActivities;
      activityIds = [currentActivity.treeId, ...currentActivity.getAllChildActivities()];
    }
    let currentDateYYYYMMDD: string = moment(this._currentRangeStart).format('YYYY-MM-DD');
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
        occurrenceCount: dayOccurrenceCount,
        cumulativePercent: 0,
        percentOfLargest: 0,
      };
      allDayDataItems.push(dayChartItem);
      currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    }
    const isWeekMode = this._currentRange === 365;
    const dataItems: ADIChartItemData[] = [];
    if (isWeekMode) {
      let currentWeekYYYYMMDD: string = moment(this._currentRangeStart).format('YYYY-MM-DD');
      const lastDateYYYYMMDD: string = moment().day(6).format('YYYY-MM-DD');
      if (moment(currentWeekYYYYMMDD).day() > 0) {
        currentWeekYYYYMMDD = moment(currentWeekYYYYMMDD).subtract(moment(currentWeekYYYYMMDD).day(), 'days').format('YYYY-MM-DD');
      }
      let largestWeekMs: number = 0;
      let sumOfAllWeeksMs: number = 0;
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
          occurrenceCount: weekOccurrenceCount,
          cumulativePercent: 0,
          percentOfLargest: 0,
        };
        if (sumOfWeekMs > largestWeekMs) {
          largestWeekMs = sumOfWeekMs;
        }
        dataItems.push(dataItem);
        sumOfAllWeeksMs += sumOfWeekMs;
        currentWeekYYYYMMDD = moment(currentWeekYYYYMMDD).add(7, 'days').format('YYYY-MM-DD');
      }


      let cumulativePercent: number = 0;
      for (let i = 0; i < dataItems.length; i++) {
        const percentOfLargest = dataItems[i].ms / largestWeekMs;
        cumulativePercent += dataItems[i].ms / sumOfAllWeeksMs;
        dataItems[i].percentOfLargest = percentOfLargest;
        dataItems[i].cumulativePercent = cumulativePercent;
      }

    } else {
      const startDateYYYYMMDD = this._currentRangeStart.format('YYYY-MM-DD');
      const endDateYYYYMMDD = this._currentRangeEnd.format('YYYY-MM-DD');
      let currentDayDateYYYYMMDD = startDateYYYYMMDD;
      let largestDayMs: number = 0;
      let sumOfAllDaysMs: number = 0;
      while (currentDayDateYYYYMMDD <= endDateYYYYMMDD) {
        const dataItem: ADIChartItemData = allDayDataItems.find(item => item.startDateYYYYMMDD === currentDayDateYYYYMMDD);
        dataItems.push(dataItem);
        currentDayDateYYYYMMDD = moment(currentDayDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        if(dataItem.ms > largestDayMs){
          largestDayMs = dataItem.ms;
        }
        sumOfAllDaysMs += dataItem.ms;
      }
      let cumulativePercent: number = 0;
      for (let i = 0; i < dataItems.length; i++) {
        const percentOfLargest = dataItems[i].ms / largestDayMs;
        cumulativePercent += dataItems[i].ms / sumOfAllDaysMs;
        dataItems[i].percentOfLargest = percentOfLargest;
        dataItems[i].cumulativePercent = cumulativePercent;
      }
    }
    // console.log("DATA ITEMS: ", dataItems)
    this._chartItems = dataItems.map(item => {
      const chartItem = new ADIChartDisplayItem(item);
      const alpha = item.percentOfLargest;
      chartItem.setColor(this.activitiesService.currentActivity.color, alpha);
      return chartItem;
    });
  }

  private _buildAnalysis(occurrenceData: ADIOccurrenceData): ActivityAnalysis {
    const def = this.activitiesService.currentActivity;

    const rangeItems = occurrenceData.occurrences.filter(occurrence => {
      return occurrence.startTime.isSameOrAfter(this._currentRangeStart) &&
        occurrence.endTime.isSameOrBefore(this._currentRangeEnd);
    });

    let sumMs = 0;
    rangeItems.forEach(item => {
      sumMs += item.durationMs;
    });
    this._occurrencesTotal = '' + rangeItems.length;
    this._durationHoursTotal = '' + sumMs / (60 * 60 * 1000);
    this._medianHoursPerWeek = '';
    this._medianOccurrencesPerWeek = '';


    return {
      definition: def,
      averageMsPerWeek: 0,
      averageMsPerDay: 0,
      averageOccurrencesPerWeek: 0,
      averageOccurrencesPerDay: 0,
      averageMsPerOccurrence: 0,

      medianMsPerWeek: 0,
      medianMsPerDay: 0,
      medianOccurrencesPerWeek: 0,
      medianOccurrencesPerDay: 0,
      // medianMsPerOccurrence: number,
      totalOccurrences: occurrenceData.occurrences.length,
      totalMs: occurrenceData.totalMs,
    };
  }


}

