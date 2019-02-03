import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { ISixWeekDayTile } from './six-week-day-tile.interface';

import * as moment from 'moment';

@Component({
  selector: 'app-activity-six-week-view',
  templateUrl: './activity-six-week-view.component.html',
  styleUrls: ['./activity-six-week-view.component.css']
})
export class ActivitySixWeekViewComponent implements OnInit {


  private _activityInstances: IActivityInstance[];
  tiles: ISixWeekDayTile[] = [];
  weeksOf: string[] = [];

  @Input() set activityInstances(activityInstances: IActivityInstance[]){
    this._activityInstances = activityInstances;
  }

  constructor() { }

  ngOnInit() {

    this.buildSixWeekData();

  }

  buildSixWeekData(){

    /*
      2019-02-03

      Some notes:  
      As of right now, there will be a bit of an inaccuracy issue here, for the following reason:
      in the activity-display.component.ts file, activities are being pulled from timeSegments from the server, and by default
      are simply being read-in as if these activies always take up the entirety of the duration of the timeSegment, even if the timeSegment has multiple activites within it.

      e.g. a timeSegment has "reading" and "web browsing" as 2 activities within it.  when the data is pulled, both "reading" as well as "web browsing" measure-in as the full duration of the timeSegment

      this is actually part of a much larger situation, where saved timeSegments do not delineate the times/duration between activities within.  
      This needs to be fixed at the level of creating and storing in the DB.
    */

    let tiles: ISixWeekDayTile[] = [];
    let weeksOf: string[] = [];

    let currentDate = moment().startOf('week').subtract(5, 'weeks');
    while(currentDate.format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD')){
      if(currentDate.day() == 0){
        weeksOf.push(currentDate.format('YYYY MMM DD'));
      }

      let hours = 0;
     
      for(let activity of this._activityInstances){
        if(moment(activity.startTime).format('YYYY-MM-DD') != moment(currentDate).format('YYYY-MM-DD') 
        &&  moment(activity.endTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')){
          //the activity did not start on current date but ended on it.
          hours += moment(activity.endTime).diff(moment(activity.endTime).startOf('date'), 'minutes') / 60;
          console.log("start of end time date", moment(activity.endTime).startOf('date') )
        }else if (moment(activity.startTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD') 
        &&  moment(activity.endTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD')){
          //the activity started and ended on current date
          hours += moment(activity.endTime).diff(moment(activity.startTime), 'minutes') / 60;

        }else if (moment(activity.startTime).format('YYYY-MM-DD') == moment(currentDate).format('YYYY-MM-DD') 
        &&  moment(activity.endTime).format('YYYY-MM-DD') != moment(currentDate).format('YYYY-MM-DD')){
          //the activity started on current date but did not end on it
          hours += moment(activity.startTime).endOf('date').diff(moment(activity.endTime).startOf('date'), 'minutes') / 60;
          console.log("end of start time date", moment(activity.startTime).endOf('date') )
        }else{
          //the activity did not occur at all on this day
        }

      }
      let tile: ISixWeekDayTile = { date: moment(currentDate), hours: hours}




      tiles.push(tile);
      currentDate.add(1, 'days');
    }

    this.weeksOf = weeksOf;
    this.tiles = tiles;


  }



  tileHours(tile: ISixWeekDayTile): string{
    if(tile.hours > 0){
      return "" + tile.hours.toFixed(1) + " hrs"
    }else{
      return "";
    }
    
  }

  weekOfStyle(weekOf: string): any {
    //first one yields:
    // grid-row 2 / span 1

    let row = this.weeksOf.indexOf(weekOf) + 2;
    let style = {"grid-row":""+row+" / span 1"};

    return style;
  }   

}
