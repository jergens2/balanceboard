import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { ISixWeekDayTile } from './six-week-day-tile.interface';

import * as moment from 'moment';
import { ActivitiesService } from '../../activities.service';
import { UserDefinedActivity } from '../../user-defined-activity.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-six-week-view',
  templateUrl: './activity-six-week-view.component.html',
  styleUrls: ['./activity-six-week-view.component.css']
})
export class ActivitySixWeekViewComponent implements OnInit {


  private _activityInstances: IActivityInstance[];
  private _activity: UserDefinedActivity = null;
  tiles: ISixWeekDayTile[] = [];
  weeksOf: string[] = [];
  weekSums: string[] = [];

  @Input() set activityInstances(activityInstances: IActivityInstance[]) {
    this._activityInstances = activityInstances;
  }
  @Input() set activity(activity: UserDefinedActivity) {
    this._activity = activity;
  }

  constructor(private activitiesService: ActivitiesService, private router: Router) { }

  ngOnInit() {

    if (this._activityInstances.length > 0) {
      this.buildSixWeekData();
    }


  }

  buildSixWeekData() {

    /*
      2019-02-03

      Some notes:  
      As of right now, there will be a bit of an inaccuracy issue here, for the following reason:
      in the activity-display.component.ts file, activities are being pulled from timelogEntrys from the server, and by default
      are simply being read-in as if these activies always take up the entirety of the duration of the timelogEntry, even if the timelogEntry has multiple activites within it.

      e.g. a timelogEntry has "reading" and "web browsing" as 2 activities within it.  when the data is pulled, both "reading" as well as "web browsing" measure-in as the full duration of the timelogEntry

      this is actually part of a much larger situation, where saved timelogEntrys do not delineate the times/duration between activities within.  
      This needs to be fixed at the level of creating and storing in the DB.
    */

    let tiles: ISixWeekDayTile[] = [];
    let weeksOf: string[] = [];

    let maxHours: number = 0;

    let currentWeekSum = 0;
    let weekSums: number[] = [];


    let currentDate = moment().startOf('week').subtract(5, 'weeks');
    while (currentDate.format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD')) {
      if (currentDate.day() == 0) {
        weeksOf.push(currentDate.format('YYYY MMM DD'));
      }


      let hours = 0;
      for (let activity of this._activityInstances) {
        if (moment(activity.startTime).format('YYYY-MM-DD') != moment(currentDate).format('YYYY-MM-DD')
          && moment(activity.endTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')) {
          hours += activity.durationHours;
        } else if (moment(activity.startTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')
          && moment(activity.endTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')) {
          hours += activity.durationHours;
        } else if (moment(activity.startTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')
          && moment(activity.endTime).format('YYYY-MM-DD') != moment(currentDate).format('YYYY-MM-DD')) {
          hours += activity.durationHours;
        } else {
          //the activity did not occur at all on this day
        }
      }


      currentWeekSum += hours;
      if (currentDate.day() == 6) {
        weekSums.push(currentWeekSum);
        currentWeekSum = 0;
      }



      let tile: ISixWeekDayTile = { date: moment(currentDate), hours: hours, style: {} }
      if (hours > maxHours) {
        maxHours = hours;
      }

      tiles.push(tile);
      currentDate.add(1, 'days');
    }
    let color = this._activity.color;
    let gradient: string[] = this.getColorGradient(color);

    for (let tile of tiles) {
      let style: any = {};
      let percent: number = tile.hours / maxHours;
      let backgroundColor = this.getColorFromGradient(percent, gradient);

      style = { "background-color": backgroundColor };
      tile.style = style;
    }

    this.weekSums = weekSums.map((weekSum) => {
      return "" + weekSum.toFixed(1) + " hrs";
    })
    console.log(this.weekSums)
    this.weeksOf = weeksOf;
    this.tiles = tiles;


  }

  onClickTile(tile: ISixWeekDayTile) {
    this.router.navigate(['/daybook/' + tile.date.format('YYYY-MM-DD')]);
  }


  tileHours(tile: ISixWeekDayTile): string {
    if (tile.hours > 0) {
      return "" + tile.hours.toFixed(1) + " hrs"
    } else {
      return "";
    }

  }

  tileDate(tile: ISixWeekDayTile): string {
    if (moment(tile.date).date() == 1 || (moment(tile.date).endOf('month').date() == moment(tile.date).date())) {
      return moment(tile.date).format("MMM D")
    } else {
      return moment(tile.date).format("D");
    }
  }

  weekOfStyle(weekOf: string): any {
    //first one yields:
    // grid-row 2 / span 1

    let row = this.weeksOf.indexOf(weekOf) + 2;
    let style = { "grid-row": "" + row + " / span 1" };

    return style;
  }

  weekSumStyle(weekSum: string): any {
    let row = this.weekSums.indexOf(weekSum) + 2;
    let style = { "grid-row": "" + row + " / span 1" };

    return style;
  }


  getColorFromGradient(percent: number, gradient: string[]): string {
    if (percent == 0) {
      return "";
    }
    if (percent >= 0 && percent <= 0.2) {
      return gradient[0];
    } else if (percent > 0.2 && percent <= 0.4) {
      return gradient[1];
    } else if (percent > 0.4 && percent <= 0.6) {
      return gradient[1];
    } else if (percent > 0.6 && percent <= 0.8) {
      return gradient[1];
    } else if (percent > 0.8) {
      return gradient[4];
    }
    return "";
  }

  getColorGradient(startColor: string): string[] {
    function hexToRGB(hex: string, alpha: number): string {
      var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

      if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
      } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
      }
    }
    function returnRGBA(rgb: string, alpha: number): string {
      let matches = rgb.match(/[0-9.]+/g);
      return "rgba(" + matches[0] + "," + matches[1] + "," + matches[2] + "," + alpha + ")";
    }


    let colors: string[] = [];
    let gradientCount: number = 5;

    if (startColor.slice(0, 4).toLowerCase() == "rgba" || startColor.slice(0, 3).toLowerCase() == "rgb") {
      for (let i = 1; i < gradientCount; i++) {
        colors.push(returnRGBA(startColor, i / gradientCount));
      }
      colors.push(returnRGBA(startColor, 1));
    } else {
      for (let i = 1; i < gradientCount; i++) {
        colors.push(hexToRGB(startColor, i / gradientCount));
      }
      colors.push(hexToRGB(startColor, 1));
    }

    return colors;
  }

}
