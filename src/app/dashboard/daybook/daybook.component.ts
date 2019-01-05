import { Component, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../timelog/timelog.service';

@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.css']
})
export class DaybookComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  dayStartTime: moment.Moment;
  dayEndTime: moment.Moment;

  private _currentDate: moment.Moment;

  gridSegments: any[] = [];

  daybookBodyStyle: any = { "background-color": "red", "border": "10px solid green" };
  hourLabels: any[] = [];

  ngOnInit() {


    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment) => {
      this._currentDate = moment(changedDate);
      this.dayStartTime = moment(this._currentDate).hour(7).minute(30).second(0).millisecond(0);
      this.dayEndTime = moment(this._currentDate).hour(22).minute(30).second(0).millisecond(0);

      this.buildDisplay();
    })



  }

  buildDisplay() {
    let hour: number = 0;
    hour = this.dayStartTime.hour();

    let currentTime = moment(this.dayStartTime).subtract(30, 'minutes');
    if (currentTime.minute() < 15) {
      currentTime.minute(0);
    } else if (currentTime.minute() >= 15 && currentTime.minute() < 45) {
      currentTime.minute(30);
    } else {
      currentTime.minute(60);
    }

    let endTime = moment(this.dayEndTime).add(30, 'minutes');

    let hourLabels: any[] = [];

    let gridIndex: number = 1;
    while (currentTime.isSameOrBefore(endTime)) {

      if (currentTime.minute() != 30) {

        let hourLabel = {
          "time": currentTime.format("h:mm a"),
          "style": { "grid-column": "1 / span 1", "grid-row": "" + gridIndex + " / span 2" }
        };
        if(gridIndex == 1 ){
          hourLabel = {
            "time": '',
            "style": { "grid-column": "1 / span 1", "grid-row": "" + gridIndex + " / span 2" }
          };
        }

        hourLabels.push(hourLabel);
      }
      currentTime.add(30, 'minutes');
      gridIndex += 1;
    }

    // let endHour: number = this.dayEndTime.hour();
    // if (this.dayEndTime.minute() >= 30) {
    //   endHour += 1;
    // }

    // let hours: number[] = [];

    // while (hour <= endHour) {
    //   hours.push(hour);
    //   hour += 1;
    // }

    // let gridLinesCount: number = hours.length * 2;


    // console.log(hours)
    this.daybookBodyStyle = { "display":"grid", "grid-template-rows": "repeat(" + gridIndex.toFixed(0) + ", 1fr)", "grid-template-columns": "6em auto" }
    this.hourLabels = hourLabels;
  }


}
