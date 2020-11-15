import { Component, OnInit } from '@angular/core';
import { ButtonMenu } from '../../../shared/components/button-menu/button-menu.class';
import { ActivityComponentService } from '../activity-component.service';
import * as moment from 'moment';
import { ADIOccurrence, ADIOccurrenceData } from '../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { totalmem } from 'os';

@Component({
  selector: 'app-activities-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.css']
})
export class ActivitiesSummaryComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _rangeMenu: ButtonMenu;
  private _viewMenu: ButtonMenu;

  private _rangeString: string;
  private _rangeDateString: string;

  public get rangeString(): string { return this._rangeString; }
  public get rangeDateString(): string { return this._rangeDateString; }

  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }
  public get viewMenu(): ButtonMenu { return this._viewMenu; }

  private _activityOccurrences: {
    activity: ActivityCategoryDefinition;
    occurrences: ADIOccurrence[];
    totalMs: number;
    displayDuration: string;
    msPerOccurrence: number;
    percentOfTotal: number;
  }[];
  public get activityOccurrences(): {
    activity: ActivityCategoryDefinition;
    occurrences: ADIOccurrence[];
    totalMs: number;
    displayDuration: string;
    msPerOccurrence: number;
    percentOfTotal: number;
  }[] { return this._activityOccurrences; }

  ngOnInit(): void {
    console.log(this.activityService.summarizer.activityOccurences)
    this._rangeMenu = new ButtonMenu();
    this._rangeMenu.addItem$('7').subscribe(s => this._setRange(7));
    this._rangeMenu.addItem$('14').subscribe(s => this._setRange(14));
    this._rangeMenu.addItem$('30').subscribe(s => this._setRange(30));
    this._rangeMenu.addItem$('60').subscribe(s => this._setRange(60));
    this._rangeMenu.addItem$('90').subscribe(s => this._setRange(90));
    this._rangeMenu.openItem('7');
    this._viewMenu = new ButtonMenu();
    this._viewMenu.addItem$('List').subscribe(s => this._setView('List'));
    this._viewMenu.addItem$('Tree').subscribe(s => this._setView('Tree'));
    this._viewMenu.openItem('List');
  }

  private _setView(view: 'List' | 'Tree') {
    console.log("Set view: " + view)
  }

  private _setRange(range: 7 | 14 | 30 | 60 | 90) {
    // console.log("Range is: " + range);
    this._rangeString = 'Past ' + range + ' days';
    const rangeStart = moment().subtract(range, 'days').startOf('day');
    const rangeEnd = moment().endOf('day');
    const currentDateYYYYMMDD: string = moment(rangeStart).format('YYYY-MM-DD');
    const finalDateYYYYMMDD: string = moment(rangeEnd).format('YYYY-MM-DD');
    this._rangeDateString = moment(rangeStart).format('MMMM Do, YYYY') + ' to ' + moment(rangeEnd).format('MMMM Do, YYYY');
    const tree = this.activityService.activityTree;
    const occurrences = this.activityService.summarizer.analyzer.getOccurrences(currentDateYYYYMMDD, finalDateYYYYMMDD);
    let totalMs: number = 0;
    occurrences.forEach(occ => {
      totalMs += occ.totalMs;
    });
    this._activityOccurrences = this.activityService.summarizer
      .analyzer.getOccurrences(currentDateYYYYMMDD, finalDateYYYYMMDD).map(item => {
        const percentOfTotal = (item.totalMs / totalMs) * 100;
        return {
          activity: tree.findActivityByTreeId(item.activityTreeId),
          occurrences: item.occurrences,
          totalMs: item.totalMs,
          msPerOccurrence: item.msPerOccurrence,
          displayDuration: (item.totalMs / (1000 * 60 * 60)).toFixed(1) + ' hrs',
          percentOfTotal: percentOfTotal
        };
      });
  }

  public onClickActivity(activity: ActivityCategoryDefinition) {
    this.activityService.openActivity(activity);
  }
}
