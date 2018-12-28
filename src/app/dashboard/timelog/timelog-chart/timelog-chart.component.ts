import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';
import { TimeMark } from '../time-mark.model';
import { ITimeMarkChartTile } from './timemark-chart-tile.interface';

import * as moment from 'moment';
import { ActivitiesService } from '../activities/activities.service';



@Component({
  selector: 'app-timelog-chart',
  templateUrl: './timelog-chart.component.html',
  styleUrls: ['./timelog-chart.component.css']
})
export class TimelogChartComponent implements OnInit {

  constructor(private timeLogService: TimelogService, private activitiesService: ActivitiesService) { }

  chartHourTiles: ITimeMarkChartTile[] = [];
  hours: string[] = [];
  hourHeight: number;
  hourHeightPx: string;

  frameStartHour: number;
  frameEndHour: number;

  ngOnInit() {

    this.hourHeight = 35;
    this.hourHeightPx = this.hourHeight.toFixed(0) + "px";

    this.frameStartHour = this.timeLogService.userDefinedStartTimeOfDay.hour();
    if( this.timeLogService.userDefinedStartTimeOfDay.minute() >= 30){
      this.frameStartHour += 1;
    }

    this.frameEndHour = this.timeLogService.userDefinedEndTimeOfDay.hour();
    if (this.timeLogService.userDefinedStartTimeOfDay.minute() >= 30) {
      this.frameEndHour += 1;
    }

    let hour: number = this.frameStartHour;
    while (hour <= this.frameEndHour) {
      this.hours.push(moment(this.timeLogService.userDefinedStartTimeOfDay).hour(hour).format('h a'));
      hour++;
    }




    this.timeLogService.thisDaysTimeMarks.subscribe((timeMarks: TimeMark[]) => {
      let chartTimeMarks = Object.assign([], timeMarks);
      this.chartHourTiles = this.buildHourTiles(chartTimeMarks, this.frameStartHour, this.frameEndHour);

      // this.timeMarkChartTiles = this.buildTimeMarkChartTiles(chartTimeMarks, this.hourHeight);
    })
  }

  buildHourTiles(chartTimeMarks: TimeMark[], startHour: number, endHour: number): ITimeMarkChartTile[] {
    /*
      In the template, the hour labels are centered vertically.
      This means that visually, the horizontal line is actually offset by half of an hour.
      e.g. the horizontal line at the text 9am is not actually at 9am but at 9:30am.

      Therefore, for each of these tiles, they actually need to run from -30 minutes to +30 minutes
    */
    console.log("building hour tiles");

    let tiles: ITimeMarkChartTile[] = [];
    let hour: number = startHour;
    while (hour <= endHour) {
      
      let startTime = moment().hour(hour).minute(-30).second(0).millisecond(0);
      let endTime = moment().hour(hour).minute(30).second(0).millisecond(0);

      let timeMarks: TimeMark[] = [];

      for(let timeMark of chartTimeMarks){
        if(moment(timeMark.startTime).isAfter(startTime) || moment(timeMark.endTime).isBefore(endTime)){
          timeMarks.push(Object.assign({},timeMark));
        }
      }

      let tile: ITimeMarkChartTile = { timeMarks: timeMarks, startTime: startTime, endTime: endTime};
      tiles.push(tile);

      hour++;
    }


    return tiles;
  }

  // buildTimeMarkChartTiles(timeMarks: TimeMark[], hourHeightPx: number): ITimeMarkChartTile[] {
  //   let tiles: ITimeMarkChartTile[] = [];

  //   if (timeMarks != null) {
  //     timeMarks.sort((a, b) => {
  //       if (moment(a.startTime).isBefore(moment(b.startTime))) {
  //         return 1
  //       } else {
  //         return 0;
  //       }
  //     })

  //     for (let timeMark of timeMarks) {

  //       let templateStartTime = this.timeLogService.userDefinedStartTimeOfDay;
  //       let templateEndTime = this.timeLogService.userDefinedEndTimeOfDay;

  //       if (!moment(timeMark.endTime).isBefore(templateStartTime) && !moment(timeMark.startTime).isAfter(templateEndTime)) {

  //         let marginTop = "1px";
  //         let timeMarkHeight: string = "0px";
  //         timeMarkHeight = (((timeMark.duration / 60) * hourHeightPx) - 1)  + "px";


  //         if (moment(timeMark.startTime).isBefore(templateStartTime)) {
  //           let hoursCut = moment(templateStartTime).diff((moment(timeMark.startTime)), 'hours');
  //           let pxCut = hoursCut * hourHeightPx;

  //           timeMarkHeight = (((timeMark.duration / 60) * hourHeightPx) - pxCut - 1) + "px";
  //         }

  //         if (moment(timeMark.endTime).isAfter(templateEndTime)) {
  //           let endTime = moment(timeMark.endTime);

  //           let hoursCut = moment(timeMark.endTime).diff((moment(templateEndTime)), 'hours');
  //           let pxCut = hoursCut * hourHeightPx;
  //           timeMarkHeight = (((timeMark.duration / 60) * hourHeightPx) - pxCut - 1) + "px";
  //           // console.log("timemark height", timeMarkHeight);
  //         }


  //         let styleColor = "white";
  //         if (timeMark.activities.length == 0) {
  //           styleColor = "white";
  //         } else if (timeMark.activities.length == 1) {


  //           styleColor = timeMark.activities[0].activity.color
  //         } else if (timeMark.activities.length > 1) {
  //           // TODO need to calculate which activity represents the largest portion of the timeMark and return that activity's color
  //           styleColor = timeMark.activities[0].activity.color
  //         }
  //         let tile: ITimeMarkChartTile = { timeMark: timeMark, style: {}, styleHeight: timeMarkHeight, styleBackgroundColor: styleColor, styleMarginTop: marginTop };
  //         // console.log("pushing tile", tile);
  //         tiles.push(tile);
  //       }
  //     }
  //   }
  //   return tiles;
  // }


  // calculateHeight(timeMark: TimeMark): {} {
  //   let height = 0;
  //   height = timeMark.duration;
  //   let str = height.toString() + "px"
  //   return { "height": str };
  // }

  // getTileHeight(timeMark: TimeMark): string {
  //   let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
  //   let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
  //   let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

  //   dayFrameDuration = Math.abs(dayFrameDuration);

  //   let frameHeight = 500; //500px

  //   let timeMarkHeight = timeMark.duration / (dayFrameDuration / frameHeight);

  //   let heightStyle = timeMarkHeight.toFixed(0) + "px";
  //   return heightStyle;
  //   // return { 'height': heightStyle };
  // }




  /*
  Template Functions
  */

  ifShowActivities(timeMark: TimeMark): boolean {
    if (timeMark != null) {
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

  onClickTile(tile: ITimeMarkChartTile) {
    console.log("tile clicked", tile);
  }

}
