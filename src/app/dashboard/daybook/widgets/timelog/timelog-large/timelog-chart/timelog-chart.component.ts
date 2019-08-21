import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import * as moment from 'moment';
import { TimelogWindow } from './timelog-window.interface';
import { TimelogChartRowItem } from './timelog-chart-item/timelog-chart-row-item.class';

@Component({
  selector: 'app-timelog-chart',
  templateUrl: './timelog-chart.component.html',
  styleUrls: ['./timelog-chart.component.css']
})
export class TimelogChartComponent implements OnInit {

  constructor() { }

  @Input() activeDay: DaybookDayItem;

  timelogChartGrid: any = {};

  timelogChartRowItems: TimelogChartRowItem[] = [];
  timelogGuidelineItems: any[] = [];
  timelogGuidelinesNgStyle: any = {};
  timelogGuidelinesBorderRightNgStyle: any = {};



  ngOnInit() {
    let minutesPerIncrement: number = 5;
    let windowSize: number = 16;  // number of hours to display.  Effectively, the zoom level.




    
    let timelogWindow: TimelogWindow = this.activeDay.getTimelogWindow(windowSize);
    console.log("timelog window is: " + timelogWindow.startTime.format("h:mm a") + " to " + timelogWindow.endTime.format("h:mm a"));

    let startTime: moment.Moment = moment(timelogWindow.startTime).subtract(1, "hour");
    let endTime: moment.Moment = moment(timelogWindow.endTime).add(1, "hour");

    

    let timelogChartRowItems: TimelogChartRowItem[] = [];
    let timelogGuidelineItems: any[] = [];


    let currentTime: moment.Moment = moment(startTime);
    let currentRowIndex: number = 1;
    let timelogGuidelinesGridRowStart = 0;
    let timelogGuidelinesGridRowSpan = 1;
    while(currentTime.isBefore(endTime)){

      if(currentTime.isSameOrAfter(timelogWindow.startTime) && currentTime.isSameOrBefore(timelogWindow.endTime)){
        if(timelogGuidelinesGridRowStart == 0){
          console.log("its a index " + currentRowIndex)
          timelogGuidelinesGridRowStart = currentRowIndex;
        }
        if(timelogGuidelinesGridRowStart > 0){
          timelogGuidelinesGridRowSpan++;
        }
        
        let ampm: string = "a";
        if(currentTime.isBefore(moment(currentTime).hour(12).minute(0).second(0).millisecond(0))){
          ampm = "a";
        }else{
          ampm = "p";
        }
        if(currentTime.minute() == 0){
          timelogGuidelineItems.push({
            label: currentTime.format("h") + ampm,
            ngStyle: {
              "grid-column":"1 / span 1",
              "grid-row":""+currentRowIndex+" / span 1",
            }
          });
        }
      }

      

      let newTimelogChartRowItem: TimelogChartRowItem = new TimelogChartRowItem(moment(currentTime), moment(currentTime).add(minutesPerIncrement, "minutes"));
      let rowNgStyle: any = {
        "grid-column":"1 / -1",
        "grid-row":""+currentRowIndex+" / span 1",
      }
      newTimelogChartRowItem.setNgStyle(rowNgStyle);
      timelogChartRowItems.push(newTimelogChartRowItem);
      currentTime = moment(currentTime).add(minutesPerIncrement, "minutes");
      currentRowIndex++;
    }



    console.log("timelog guideline items", timelogGuidelineItems)

    this.timelogGuidelinesNgStyle = {
      "grid-row":""+timelogGuidelinesGridRowStart + " / span " + timelogGuidelinesGridRowSpan+"",
    };
    this.timelogGuidelinesBorderRightNgStyle = {
      "grid-row":"" + timelogGuidelinesGridRowStart + " / span " + (timelogGuidelinesGridRowSpan-2) + "",
    };

    this.timelogChartRowItems = timelogChartRowItems;
    this.timelogGuidelineItems = timelogGuidelineItems;

    this.timelogChartGrid = {
      ngStyle: {
        "grid-template-rows":"repeat("+timelogChartRowItems.length+", 1fr)",
      },
      windowSize: windowSize,
      startTime: startTime,
      endTime: endTime,
    }
  }

}
