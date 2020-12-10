import { Component, OnInit } from '@angular/core';
import { ButtonMenu } from '../../../shared/components/button-menu/button-menu.class';
import { ActivityComponentService } from '../activity-component.service';
import * as moment from 'moment';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { ActivitySummaryData } from './activity-summary-data.interface';
import { ActivityDefinitionTree } from '../api/activity-definition-tree.class';
import { ADITreemap } from './activities-summary-treemap/activity-treemap.class';
import { AppScreenSizeService } from '../../../shared/app-screen-size/app-screen-size.service';

@Component({
  selector: 'app-activities-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.css']
})
export class ActivitiesSummaryComponent implements OnInit {

  constructor(private activityService: ActivityComponentService, private screenService: AppScreenSizeService) { }

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
  private _screenWidth: number;

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
    const listItem = this._viewMenu.menuItems.find(item => item.label === 'List');
    const rangeItem = this._rangeMenu.menuItems.find(item => item.label === '7');
    this._viewMenu.openItemClicked(listItem);
    this._rangeMenu.openItemClicked(rangeItem);

    this._screenWidth = this.screenService.appScreenSize.width;
    this.screenService.appScreenSize$.subscribe(change => {
      this._screenWidth = change.width;
      if (this._treemap) {
        const diff = Math.abs(this._treemap.chartWidth - this._screenWidth);
        if (diff > 50) {
          this._recalculate();
        }
      }
    });
    this._recalculate();
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
    this._rangeDateString = moment(rangeStart).format('MMMM Do, YYYY') + ' to ' + moment(rangeEnd).format('MMMM Do, YYYY');
    this._buildTreemap();
  }

  private _buildTreemap() {
    const startDateYYYYMMDD: string = moment(this._rangeStart).format('YYYY-MM-DD');
    const endDateYYYYMMDD: string = moment(this._rangeEnd).format('YYYY-MM-DD');

    const occurrenceData = this.activityService.summarizer.analyzer.getOccurrences(startDateYYYYMMDD, endDateYYYYMMDD);
    const totalChartMs = this.activityService.summarizer.analyzer.getSumTotalMs(startDateYYYYMMDD, endDateYYYYMMDD);

    let width = this._screenWidth - 40;
    let height = width;
    if (this._screenWidth > 775) {
      width = this._screenWidth - 260;
      height = width * 0.6;
    }
    if (height > 620) {
      height = 620;
    }
    const activityTree: ActivityDefinitionTree = this.activityService.activityTree;
    const rootActivities = activityTree.rootActivities;
    const treemap = new ADITreemap(rootActivities, width, height, occurrenceData, totalChartMs);
    this._treemap = treemap;
  }

  public onClickActivity(activity: ActivityCategoryDefinition) {
    this.activityService.openActivity(activity);
  }
}
