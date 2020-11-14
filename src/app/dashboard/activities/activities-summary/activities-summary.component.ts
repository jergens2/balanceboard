import { Component, OnInit } from '@angular/core';
import { ButtonMenu } from '../../../shared/components/button-menu/button-menu.class';
import { ActivityComponentService } from '../activity-component.service';
import * as moment from 'moment';
import { ADIOccurrence, ADIOccurrenceData } from '../activity-display-item/adi-parts/adi-summary/adi-occurrence-data.interface';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';

@Component({
  selector: 'app-activities-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.css']
})
export class ActivitiesSummaryComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _rangeMenu: ButtonMenu;

  private _rangeString: string;
  public get rangeString(): string { return this._rangeString; }

  public get rangeMenu(): ButtonMenu { return this._rangeMenu; }

  private _activityOccurrences: {
    activity: ActivityCategoryDefinition;
    occurrences: ADIOccurrence[];
    totalMs: number;
    displayDuration: string;
    msPerOccurrence: number;
  }[];
  public get activityOccurrences(): {
    activity: ActivityCategoryDefinition;
    occurrences: ADIOccurrence[];
    totalMs: number;
    displayDuration: string;
    msPerOccurrence: number;
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
  }


  private _setRange(range: 7 | 14 | 30 | 60 | 90) {
    console.log("Range is: " + range);

    this._rangeString = 'Past ' + range + ' days';
    const rangeStart = moment().subtract(range, 'days').startOf('day');
    const rangeEnd = moment().endOf('day');

    let currentDateYYYYMMDD: string = moment(rangeStart).format('YYYY-MM-DD');
    const finalDateYYYYMMDD: string = moment(rangeEnd).format('YYYY-MM-DD');

    const tree = this.activityService.activityTree;

    this._activityOccurrences = this.activityService.summarizer
      .analyzer.getOccurrences(currentDateYYYYMMDD, finalDateYYYYMMDD).map(item => {
        return {
          activity: tree.findActivityByTreeId(item.activityTreeId),
          occurrences: item.occurrences,
          totalMs: item.totalMs,
          msPerOccurrence: item.msPerOccurrence,
          displayDuration: (item.totalMs / (1000 * 60 * 60)).toFixed(1) + ' hours',
        };
      });
  }

  public onClickActivity(activity: ActivityCategoryDefinition) {
    this.activityService.openActivity(activity);
  }
}
