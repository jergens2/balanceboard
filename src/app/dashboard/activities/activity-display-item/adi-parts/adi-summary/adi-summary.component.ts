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

  public get analyzer(): ActivityDataAnalyzer { return this.activitiesService.summarizer.analyzer; }
  public get occurrencesTotal(): string { return this._occurrencesTotal; }
  public get durationHoursTotal(): string { return this._durationHoursTotal; }
  public get medianHoursPerWeek(): string { return this._medianHoursPerWeek; }
  public get medianOccurrencesPerWeek(): string { return this._medianOccurrencesPerWeek; }
  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }
  // public get weekHourData(): ADIWeekDataChartItem[] { return this.analyzer.weekHourData; }
  public get analysis(): ActivityAnalysis { return this._analysis; }

  ngOnInit(): void {
    console.log("Activity occurrence data:" + this.analyzer.activityOccurences.length);
    this._setRange(365);
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange(7));
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange(30));
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange(90));
    this._rangeMenu.addItem$('365').subscribe(s => this._setRange(365));
    this._rangeMenu.addItem$('Specify').subscribe(s => this._setRange('Specify'));
    this.activitiesService.currentActivity$.subscribe(item => {
      this._reload();
    })
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
    const occurrenceData = this.activitiesService.summarizer.activityOccurences;
    const foundActivity = occurrenceData.find(item => item.activityTreeId === currentActivity.treeId);
    if (foundActivity) {
      this._analysis = this._buildAnalysis(foundActivity);
    } else {
      this._occurrencesTotal = '0';
      this._durationHoursTotal = '0';
      this._medianHoursPerWeek = '0';
      this._medianOccurrencesPerWeek = '0';
    }

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
    }
  }


}

