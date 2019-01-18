import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';
import { TimeSegment } from '../time-segment.model';

import * as moment from 'moment';
import { ActivitiesService } from '../../activities/activities.service';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export interface ITimeSegmentChartTile {
  timeSegment: TimeSegment,
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

  timeSegmentChartTiles: ITimeSegmentChartTile[];
  hours: string[];
  hourHeight: number;

  ifLoading: boolean = true;
  faSpinner = faSpinner;

  ngOnInit() {

    /*
      Much of the chart display appearance is statically defined in the CSS.  
      Meaning: changing the start hour / end hour reference here would require specific changes to the pre-defined CSS grid.
      at some point it may be wise to set the css programmatically
      2018-12-16:  start and end time now exist as variables in the service, but this chart component still uses the statically defined CSS, 
      and does not refer to the variables in the service to determine the css, but it should.
    */
    this.hourHeight = 28;
    this.hours = [];
    let hour = 8; //chart reference start time: 8:00am;
    let endHour = 22;
    while (hour <= endHour) {
      this.hours.push(moment().hour(hour).format("h a"));
      hour++;
    }

    this.timeSegmentChartTiles = [];
    this.timeLogService.thisDaysTimeSegments.subscribe((timeSegments: TimeSegment[]) => {
      this.timeSegmentChartTiles = [];
      this.ifLoading = true;
      if(timeSegments != null){
        if(timeSegments.length > 0){
          let chartTimeSegments = Object.assign([], timeSegments);
          this.timeSegmentChartTiles = this.buildTimeSegmentChartTiles(chartTimeSegments, this.hourHeight);
          
        }
        this.ifLoading = false;
      }
      
    })
  }

  buildTimeSegmentChartTiles(timeSegments: TimeSegment[], hourHeightPx: number): ITimeSegmentChartTile[] {
    let tiles: ITimeSegmentChartTile[] = [];

    if (timeSegments != null) {
      timeSegments.sort((a, b) => {
        if (moment(a.startTime).isAfter(moment(b.startTime))) {
          return 1
        }
        if (moment(a.startTime).isBefore(moment(b.startTime))) {
          return -1;
        }
        return 0;

      })

      for (let timeSegment of timeSegments) {

        let templateStartTime = this.timeLogService.userDefinedStartTimeOfDay;
        let templateEndTime = this.timeLogService.userDefinedEndTimeOfDay;

        if (!moment(timeSegment.endTime).isBefore(templateStartTime) && !moment(timeSegment.startTime).isAfter(templateEndTime)) {

          let marginTop = "1px";
          let timeSegmentHeight: string = "0px";
          timeSegmentHeight = (((timeSegment.duration / 60) * hourHeightPx) - 1) + "px";


          if (moment(timeSegment.startTime).isBefore(templateStartTime)) {
            let hoursCut = moment(templateStartTime).diff((moment(timeSegment.startTime)), 'hours');
            let pxCut = hoursCut * hourHeightPx;

            timeSegmentHeight = (((timeSegment.duration / 60) * hourHeightPx) - pxCut - 1) + "px";
          }
          if (moment(timeSegment.startTime).isAfter(templateStartTime) && tiles.length == 0){

            let diff = moment(timeSegment.startTime).diff(moment(templateStartTime), 'hours');
            marginTop = (diff * hourHeightPx) + "px";
          }

          if (moment(timeSegment.endTime).isAfter(templateEndTime)) {
            let endTime = moment(timeSegment.endTime);

            let hoursCut = moment(timeSegment.endTime).diff((moment(templateEndTime)), 'hours');
            let pxCut = hoursCut * hourHeightPx;
            timeSegmentHeight = (((timeSegment.duration / 60) * hourHeightPx) - pxCut - 1) + "px";
            // console.log("timeSegment height", timeSegmentHeight);
          }


          let styleColor = "white";
          if (timeSegment.activities.length == 0) {
            styleColor = "white";
          } else if (timeSegment.activities.length == 1) {


            styleColor = timeSegment.activities[0].activity.color
          } else if (timeSegment.activities.length > 1) {
            // TODO need to calculate which activity represents the largest portion of the timeSegment and return that activity's color
            styleColor = timeSegment.activities[0].activity.color
          }
          let tile: ITimeSegmentChartTile = { timeSegment: timeSegment, style: {}, styleHeight: timeSegmentHeight, styleBackgroundColor: styleColor, styleMarginTop: marginTop };
          // console.log("pushing tile", tile);
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }


  calculateHeight(timeSegment: TimeSegment): {} {
    let height = 0;
    height = timeSegment.duration;
    let str = height.toString() + "px"
    return { "height": str };
  }

  getTileHeight(timeSegment: TimeSegment): string {
    let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
    let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

    dayFrameDuration = Math.abs(dayFrameDuration);

    let frameHeight = 500; //500px

    let timeSegmentHeight = timeSegment.duration / (dayFrameDuration / frameHeight);

    let heightStyle = timeSegmentHeight.toFixed(0) + "px";
    return heightStyle;
    // return { 'height': heightStyle };
  }


  /*
  Template Functions
  */

  ifShowActivities(timeSegment: TimeSegment): boolean {
    if (timeSegment != null) {
      if (timeSegment.duration < 30) {
        return false;
      } else {
        return true;
      }
    }
    // console.log("DUration: " , timeSegmentDuration);


  }

  onMouseEnterChartTile() {

  }

  onMouseLeaveChartTile() {

  }

  onClickTile(tile: ITimeSegmentChartTile) {
    console.log("tile clicked", tile);
  }

}