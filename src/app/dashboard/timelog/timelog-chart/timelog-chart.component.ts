import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';
import { TimeMark } from '../time-mark.model';

import * as moment from 'moment';
import { ActivitiesService } from '../activities/activities.service';

export interface ITimeMarkChartTile {
  timeMark: TimeMark,
  style: Object,
  styleHeight: string,
  styleMarginTop: string,
  styleBackgroundColor: string,
}



@Component({
  selector: 'app-timelog-chart',
  templateUrl: './timelog-chart.component.html',
  styleUrls: ['./timelog-chart.component.css']
})
export class TimelogChartComponent implements OnInit {

  constructor(private timeLogService: TimelogService, private activitiesService: ActivitiesService) { }

  timeMarkChartTiles: ITimeMarkChartTile[];
  hours: string[];
  hourHeight: number;

  ngOnInit() {

    /*
      Much of the chart display appearance is statically defined in the CSS.  
      Meaning: changing the start hour / end hour reference here would require specific changes to the pre-defined CSS grid.
      at some point it may be wise to set the css programmatically


    */
    this.hourHeight = 28;
    this.hours = [];
    let hour = 8; //chart reference start time: 8:00am;
    let endHour = 22;
    while (hour <= endHour) {
      this.hours.push(moment().hour(hour).format("h a"));
      hour++;
    }

    this.timeMarkChartTiles = [];
    this.timeLogService.thisDaysTimeMarks.subscribe((timeMarks: TimeMark[]) => {

      this.timeMarkChartTiles = this.buildTimeMarkChartTiles(timeMarks, this.hourHeight);
    })
  }

  buildTimeMarkChartTiles(timeMarks: TimeMark[], hourHeightPx: number): ITimeMarkChartTile[] {
    let tiles: ITimeMarkChartTile[] = [];

    if (timeMarks != null) {
      timeMarks.sort((a, b)=>{
        if(moment(a.startTime).isBefore(moment(b.startTime))){
          return 1
        }else{
          return 0;
        }
      })
      for (let timeMark of timeMarks) {

        let templateStartTime = moment(timeMark.startTime).hour(8).minute(0).second(0).millisecond(0);
        let templateEndTime = moment(timeMark.startTime).hour(22).minute(0).second(0).millisecond(0);

        if (!moment(timeMark.endTime).isBefore(templateStartTime) && !moment(timeMark.startTime).isAfter(templateEndTime)) {

          let marginTop = "";

          if(timeMarks.indexOf(timeMark) == 0){
            if( moment(timeMark.startTime).isAfter(templateStartTime)) {
              // In this case, the first time mark starts some time after the template start time (8am) so a top margin is added to accurately reflect
              // the position in the chart
              marginTop = (moment(timeMark.startTime).diff(templateStartTime, 'hours') * hourHeightPx) + "px";
            }
          }else{
            if (moment(timeMark.startTime).isBefore(templateStartTime)) {
              timeMark.startTime = moment(templateStartTime);
            }
            if (moment(timeMark.endTime).isAfter(templateEndTime)) {
              timeMark.endTime = moment(templateEndTime);
            }
          }


          let hourHeight: string = ((timeMark.duration / 60) * hourHeightPx) + "px";
          // let topMargin: string = ((moment(timeMark.startTime).diff(moment(templateStartTime), 'hours' )) * hourHeightPx) + "px";
          let topMargin = "100px";
          // console.log("topMargin:" , topMargin);


          let styleColor = "white";
          if (timeMark.activities.length == 0) {
            styleColor = "white";
          } else if (timeMark.activities.length == 1) {


            styleColor = timeMark.activities[0].activity.color
          } else if (timeMark.activities.length > 1) {
            // TODO need to calculate which activity represents the largest portion of the timeMark and return that activity's color
            styleColor = timeMark.activities[0].activity.color
          }
          let tile: ITimeMarkChartTile = { timeMark: timeMark, style: {}, styleHeight: hourHeight, styleBackgroundColor: styleColor, styleMarginTop: marginTop};

          tiles.push(tile);
        }
      }
    }
    return tiles;
  }


  calculateHeight(timeMark: TimeMark): {} {
    let height = 0;
    height = timeMark.duration;
    let str = height.toString() + "px"
    return { "height": str };
  }

  getTileHeight(timeMark: TimeMark): string {
    let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
    let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

    dayFrameDuration = Math.abs(dayFrameDuration);

    let frameHeight = 500; //500px

    let timeMarkHeight = timeMark.duration / (dayFrameDuration / frameHeight);

    let heightStyle = timeMarkHeight.toFixed(0) + "px";
    return heightStyle;
    // return { 'height': heightStyle };
  }


  /*
  Template Functions
  */

  ifShowActivities(timeMark: TimeMark): boolean {
    if(timeMark != null){
      if (timeMark.duration < 30) {
        return false;
      } else {
        return true;
      }
    }
    // console.log("DUration: " , timeMarkDuration);


  }

  onMouseEnterChartTile() {

  }

  onMouseLeaveChartTile() {

  }


}
