import { Component, OnInit } from '@angular/core';
import { ButtonMenu } from '../../../shared/components/button-menu/button-menu.class';
import { ActivityComponentService } from '../activity-component.service';
import * as moment from 'moment';
import { ADIOccurrence, ADIOccurrenceData } from '../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { totalmem } from 'os';
import { ActivitySummaryData } from './activity-summary-data.interface';
import { ADITreemap } from './activity-summary-treemap-item/activity-treemap.class';
import { ActivityDefinitionTree } from '../api/activity-definition-tree.class';

@Component({
  selector: 'app-activities-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.css']
})
export class ActivitiesSummaryComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _rangeMenu: ButtonMenu;
  private _viewMenu: ButtonMenu;

  private _range: number;
  private _rangeStart: moment.Moment;
  private _rangeEnd: moment.Moment;
  private _view: 'List' | 'Tree';
  private _rangeString: string;
  private _rangeDateString: string;

  public get rangeString(): string { return this._rangeString; }
  public get rangeDateString(): string { return this._rangeDateString; }

  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }
  public get viewMenu(): ButtonMenu { return this._viewMenu; }

  private _treemap: ADITreemap;

  private _activityOccurrences: ActivitySummaryData[];
  public get activityOccurrences(): ActivitySummaryData[] { return this._activityOccurrences; }

  public get treemap(): ADITreemap { return this._treemap; }

  ngOnInit(): void {
    // console.log(this.activityService.summarizer.activityOccurences)
    this._rangeMenu = new ButtonMenu();
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange(7));
    this._rangeMenu.addItem$('14').subscribe(s => this._setRange(14));
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange(30));
    this._rangeMenu.addItem$('60').subscribe(s => this._setRange(60));
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange(90));

    this._viewMenu = new ButtonMenu();
    this._viewMenu.addItem$('List').subscribe(s => this._setView('List'));
    this._viewMenu.addItem$('Tree').subscribe(s => this._setView('Tree'));
    this._viewMenu.openItem('List');
    this._rangeMenu.openItem('7');
  }

  private _setView(view: 'List' | 'Tree') {
    this._view = view;
    this._recalculate();
  }

  private _setRange(range: 7 | 14 | 30 | 60 | 90) {
    // // console.log("Range is: " + range);
    this._rangeString = 'Past ' + range + ' days';
    this._range = range;
    this._rangeStart = moment().subtract(range, 'days');
    this._rangeEnd = moment();
    this._recalculate();
  }

  private _recalculate() {
    // console.log("***************************************_recalculate()\n\n");
    const rangeStart = moment().subtract(this._range, 'days').startOf('day');
    const rangeEnd = moment().endOf('day');
    const currentDateYYYYMMDD: string = moment(rangeStart).format('YYYY-MM-DD');
    const finalDateYYYYMMDD: string = moment(rangeEnd).format('YYYY-MM-DD');
    this._rangeDateString = moment(rangeStart).format('MMMM Do, YYYY') + ' to ' + moment(rangeEnd).format('MMMM Do, YYYY');
    const tree = this.activityService.activityTree;
    const analyzer = this.activityService.summarizer.analyzer;
    const occurrences = analyzer.getOccurrences(currentDateYYYYMMDD, finalDateYYYYMMDD);

    const sumTotalMs: number = analyzer.getSumTotalMs(currentDateYYYYMMDD, finalDateYYYYMMDD);
    const summaryData: ActivitySummaryData[] = analyzer.getSummaryItems(currentDateYYYYMMDD, finalDateYYYYMMDD);

    let totalMs: number = 0;
    occurrences.forEach(occ => {
      totalMs += occ.totalMs;
    });

    /**
     * 
          activity: ActivityCategoryDefinition;
          occurrences: ADIOccurrence[];
          totalFamilyMs: number;
          totalItemMs: number;
          displayDuration: string;
          msPerOccurrence: number;
          percentOfTotal: number;
          percentOfParent: number;
          hasParent: boolean;
          childData: ActivitySummaryData[];
     */
    // this._activityOccurrences = occurrences.map(item => {
    //     const percentOfTotal = (item.totalMs / totalMs) * 100;
    //     return {
    //       activity: tree.findActivityByTreeId(item.activityTreeId),
    //       occurrences: item.occurrences,
    //       totalFamilyMs: item.totalMs,
    //       totalItemMs: item.totalMs,
    //       msPerOccurrence: item.msPerOccurrence,
    //       displayDuration: (item.totalMs / (1000 * 60 * 60)).toFixed(1) + ' hrs',
    //       percentOfTotal: percentOfTotal,

    //     };
    //   });


    this._buildTreemap();
    // console.log("_recalculate() complete")
  }

  private _buildTreemap() {
    const startDateYYYYMMDD: string = moment(this._rangeStart).format('YYYY-MM-DD');
    const endDateYYYYMMDD: string = moment(this._rangeEnd).format('YYYY-MM-DD');

    const occurrenceData = this.activityService.summarizer.analyzer.getOccurrences(startDateYYYYMMDD, endDateYYYYMMDD);
    const totalChartMs = this.activityService.summarizer.analyzer.getSumTotalMs(startDateYYYYMMDD, endDateYYYYMMDD);
    const width = 600;
    const height = 400;
    const activityTree: ActivityDefinitionTree = this.activityService.activityTree;

    const rootActivities = activityTree.rootActivities;

    // console.log("  _buildTreemap()")
    const treemap = new ADITreemap(rootActivities, width, height, occurrenceData, totalChartMs);
    this._treemap = treemap;
    // console.log("   buildTreemap() complete")
    
  }

  public onClickActivity(activity: ActivityCategoryDefinition) {
    this.activityService.openActivity(activity);
  }
}
