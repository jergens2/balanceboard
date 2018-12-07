import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';
import { TimeMark } from '../time-mark.model';

import * as moment from 'moment';

export interface ITimeMarkChartTile {
  timeMark: TimeMark,
  style: Object,
  styleHeight: string,
}



@Component({
  selector: 'app-timelog-chart',
  templateUrl: './timelog-chart.component.html',
  styleUrls: ['./timelog-chart.component.css']
})
export class TimelogChartComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

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
      for (let timeMark of timeMarks) {

        let templateStartTime = moment(timeMark.startTime).hour(8).minute(0).second(0).millisecond(0);
        let templateEndTime = moment(timeMark.startTime).hour(22).minute(0).second(0).millisecond(0);
        if (!moment(timeMark.endTime).isBefore(templateStartTime) && !moment(timeMark.startTime).isAfter(templateEndTime)) {
          if (moment(timeMark.startTime).isBefore(templateStartTime)) {
            timeMark.startTime = moment(templateStartTime);
          }
          if (moment(timeMark.endTime).isAfter(templateEndTime)){
            timeMark.endTime = moment(templateEndTime);
          }
          let hourHeight: string = ((timeMark.duration / 60) * hourHeightPx) + "px";

          let tile: ITimeMarkChartTile = { timeMark: timeMark, style: {}, styleHeight: hourHeight }
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

  //  styleTileHeight(timeMarkDuration: number) : string{
  //     let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
  //     let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
  //     let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

  //     dayFrameDuration = Math.abs(dayFrameDuration);

  //     let frameHeight = 500; //500px

  //     let timeMarkHeight = timeMarkDuration / (dayFrameDuration / frameHeight) ;

  //     let result = timeMarkHeight.toFixed(0) + "px";
  //     return result;
  //   }

    ifShowActivities(timeMark: TimeMark) : boolean{
      // console.log("DUration: " , timeMarkDuration);
      if(timeMark.duration < 30){
        return false;
      }else{
        return true;
      }

    }

  onMouseEnterChartTile() {

  }

  onMouseLeaveChartTile() {

  }

}
