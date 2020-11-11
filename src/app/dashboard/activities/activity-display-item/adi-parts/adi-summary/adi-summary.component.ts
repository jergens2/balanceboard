import { Component, OnInit } from '@angular/core';
import { ActivityDataAnalyzer } from './activity-data-analyzer.class';
import { ActivityComponentService } from '../../../activity-component.service';
import { ButtonMenu } from '../../../../../shared/components/button-menu/button-menu.class';
import * as moment from 'moment';
import { ADIWeekDataChartItem } from './adi-week-data-chart-item.class';
import { ActivityAnalysis } from './activity-analysis.interface';
import { ADIOccurrenceData } from './adi-occurrence-data.interface';

@Component({
  selector: 'app-adi-summary',
  templateUrl: './adi-summary.component.html',
  styleUrls: ['./adi-summary.component.css']
})
export class AdiSummaryComponent implements OnInit {

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
  private _weekHourData: ADIWeekDataChartItem[] = [];
  private _includeChildren: boolean = true;

  public get analyzer(): ActivityDataAnalyzer { return this.activitiesService.summarizer.analyzer; }
  public get occurrencesTotal(): string { return this._occurrencesTotal; }
  public get durationHoursTotal(): string { return this._durationHoursTotal; }
  public get medianHoursPerWeek(): string { return this._medianHoursPerWeek; }
  public get medianOccurrencesPerWeek(): string { return this._medianOccurrencesPerWeek; }
  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }
  public get weekHourData(): ADIWeekDataChartItem[] { return this._weekHourData; }
  public get analysis(): ActivityAnalysis { return this._analysis; }
  public get includeChildren(): boolean { return this._includeChildren; }

  ngOnInit(): void {
    console.log("Activity occurrence data:" + this.analyzer.activityOccurences.length);
    this._setRange(365);
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange(7));
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange(30));
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange(90));
    this._rangeMenu.addItem$('365').subscribe(s => this._setRange(365));
    // this._rangeMenu.addItem$('Specify').subscribe(s => this._setRange('Specify'));
    this.activitiesService.currentActivity$.subscribe(item => {
      this._reload();
    });
  }

  private _setRange(range: 7 | 30 | 90 | 365 | 'Specify') {
    this._currentRange = range;
    this._currentRangeEnd = moment();
    if (range === 'Specify') {
      console.log("method disabled")
      this._currentRangeStart = moment().subtract(30, 'days');
    } else {
      this._currentRangeStart = moment().subtract(range, 'days');
    }
    this._reload();
  }

  private _reload() {
    const currentActivity = this.activitiesService.currentActivity;
    if(currentActivity){
      const occurrenceData = this.activitiesService.summarizer.activityOccurences;
      const foundActivityData = occurrenceData.find(item => item.activityTreeId === currentActivity.treeId);
      this._weekHourData = this._buildWeekHourData();
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

  private _buildWeekHourData(): ADIWeekDataChartItem[] {
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

    const weekHourData: ADIWeekDataChartItem[] = [];
    let startDateYYYYMMDD: string = moment(this._currentRangeStart).format('YYYY-MM-DD');

    const lastDateYYYYMMDD: string = moment().day(6).format('YYYY-MM-DD');
    console.log("Last date YYYYMMDD is " + lastDateYYYYMMDD);
    console.log("Start date is: " + startDateYYYYMMDD)

    if (moment(startDateYYYYMMDD).day() > 0) {
      startDateYYYYMMDD = moment(startDateYYYYMMDD).subtract(moment(startDateYYYYMMDD).day(), 'days').format('YYYY-MM-DD');
    }

    const activitiesOccurrenceData = occurrenceData.filter(dataItem => activityIds.indexOf(dataItem.activityTreeId) > -1);
    const weekDatas: {
      startDateYYYYMMDD: string, ms: number, cumulativePercent: number, percentOfLargest: number
    }[] = [];

    let largestMs: number = 0;
    let totalMs: number = 0;
    while (startDateYYYYMMDD <= lastDateYYYYMMDD) {
      const startOfWeek = moment(startDateYYYYMMDD);
      const endOfWeek = moment(startDateYYYYMMDD).add(6, 'days');
      let weekOccurrences: {
        dateYYYYMMDD: string,
        startTime: moment.Moment,
        endTime: moment.Moment,
        durationMs: number,
      }[] = [];
      activitiesOccurrenceData.forEach(activityOccurrenceData => {
        const inRangeItems = activityOccurrenceData.occurrences.filter(occurrence => {
          return occurrence.startTime.isSameOrAfter(startOfWeek) && occurrence.startTime.isSameOrBefore(endOfWeek);
        });
        if (inRangeItems.length > 0) {
          weekOccurrences = [...weekOccurrences, ...inRangeItems];
        }
      });
      const weekData = {
        startDateYYYYMMDD: startDateYYYYMMDD, ms: 0, cumulativePercent: 0, percentOfLargest: 0
      };
      let sumMs = 0;
      for (let i = 0; i < weekOccurrences.length; i++) {
        sumMs += weekOccurrences[i].durationMs;
      }
      if (sumMs > largestMs) {
        largestMs = sumMs;
      }
      totalMs += sumMs;
      weekData.ms = sumMs;
      weekDatas.push(weekData);
      startDateYYYYMMDD = moment(startDateYYYYMMDD).add(7, 'days').format('YYYY-MM-DD');
    }
    let cumulativeMs: number = 0;

    for (let i = 0; i < weekDatas.length; i++) {
      const percentOfLargest = weekDatas[i].ms / largestMs;
      cumulativeMs += weekDatas[i].ms;
      weekDatas[i].cumulativePercent = cumulativeMs / totalMs;
      weekDatas[i].percentOfLargest = percentOfLargest;

    }
    console.log("WEEK DATA: ", weekDatas)
    const color = currentActivity.color;
    const chartItems: ADIWeekDataChartItem[] = weekDatas.map(data => {
      const chartItem = new ADIWeekDataChartItem(data);
      const alpha = data.percentOfLargest;
      chartItem.setColor(color, alpha);
      return chartItem;
    });
    return chartItems;
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

