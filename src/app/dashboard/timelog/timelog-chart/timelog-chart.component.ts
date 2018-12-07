import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';
import { TimeMark } from '../time-mark.model';

import * as moment from 'moment';

export interface ITimeMarkChartTile{
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

  ngOnInit() {
    this.timeMarkChartTiles = [];
    this.timeLogService.thisDaysTimeMarks.subscribe((timeMarks: TimeMark[]) => {
      console.log("subscribe thing");
      this.timeMarkChartTiles = this.buildTimeMarkChartTiles(timeMarks);
    })
  }

  buildTimeMarkChartTiles(timeMarks: TimeMark[]): ITimeMarkChartTile[]{
    let tiles: ITimeMarkChartTile[] = [];
    if(timeMarks != null){  
      for(let timeMark of timeMarks){
        let tile : ITimeMarkChartTile = { timeMark: timeMark, style: {} , styleHeight : this.getTileHeight(timeMark)}
        tiles.push(tile);
      }
    }
    return tiles;
  }


  calculateHeight(timeMark: TimeMark): {}{
    let height = 0;
    height = timeMark.duration;
    let str = height.toString() + "px"
    return { "height": str};
  }

  getTileHeight(timeMark: TimeMark): string {
    console.log("getTileHeight method");
    let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
    let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

    dayFrameDuration = Math.abs(dayFrameDuration);

    let frameHeight = 500; //500px

    let timeMarkHeight = timeMark.duration / (dayFrameDuration / frameHeight) ;

    let heightStyle = timeMarkHeight.toFixed(0) + "px";
    return heightStyle;
    // return { 'height': heightStyle };
  }


  /*
  Template Functions
  */

 styleTileHeight(timeMarkDuration: number) : string{
    console.log("why is this method being called when mouseover on other components ???");
    let startTime = moment().hour(7).minute(30).second(0).millisecond(0);
    let endTime = moment().hour(22).minute(30).second(0).millisecond(0);
    let dayFrameDuration = moment.duration(moment(startTime).diff(moment(endTime))).asMinutes();

    dayFrameDuration = Math.abs(dayFrameDuration);

    let frameHeight = 500; //500px

    let timeMarkHeight = timeMarkDuration / (dayFrameDuration / frameHeight) ;

    let result = timeMarkHeight.toFixed(0) + "px";
    return result;
  }

  styleDisplayActivities(timeMarkDuration: number) : string{
    console.log("DUration: " , timeMarkDuration);
    if(timeMarkDuration < 35){
      return "none";
    }else{
      return "inline";
    }

  }

  onMouseEnterChartTile(){

  }

  onMouseLeaveChartTile(){

  }

}
