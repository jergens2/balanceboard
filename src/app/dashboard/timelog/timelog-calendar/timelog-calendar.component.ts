import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';

import * as moment from 'moment';
import { Subscription } from 'rxjs';

export interface IDaySquare {

  date: moment.Moment;
  svgPath: string;
  style: {};
  text_x: number;
  text_y: number;



}


@Component({
  selector: 'app-timelog-calendar',
  templateUrl: './timelog-calendar.component.html',
  styleUrls: ['./timelog-calendar.component.css']
})
export class TimelogCalendarComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }


  currentDate: moment.Moment;
  currentMonth: moment.Moment;

  daySquares: IDaySquare[];
  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number


  ngOnInit() {
    this.viewBoxHeight = 1600;
    this.viewBoxWidth = 1800;
    this.viewBox = "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;
    this.currentDate = moment();

    let monthDataSubscription: Subscription = new Subscription();
    this.timeLogService.currentDate$.subscribe((currentDate: moment.Moment) => {
      monthDataSubscription.unsubscribe();
      this.currentDate = moment(currentDate);
      if (this.currentMonth == null || this.currentMonth.month() != currentDate.month()) {
        this.currentMonth = moment(currentDate);
        monthDataSubscription.unsubscribe();
        this.timeLogService.fetchMonthsTimeMarks(this.currentDate.startOf('day').toISOString()).subscribe((responseData) => {
          console.log("subscribed to the changing month", responseData.data)
          let monthData: Array<{ date: string, timeMarks: number }> = responseData.data;
          this.daySquares = this.buildDaySquares(this.currentDate, this.viewBoxWidth, this.viewBoxHeight, monthData);
          // this.updateMonthData(responseData.data);
        })
      }
    })
  }

  // private updateMonthData(monthData: Array<{date: string, timeMarks: number}>){
  //   for(let daySquare of this.daySquares){
  //     // console.log(daySquare);
  //     for(let monthDay of monthData){
  //       if(daySquare.date.dayOfYear() == moment(monthDay.date).dayOfYear()){
  //         daySquare.style = {
  //           "fill": this.daySquareGradient(monthDay.timeMarks),
  //           "stroke":"none"
  //         }
  //       }
  //     }

  //   }
  // }

  private daySquareGradient(todaysCount: number, maxCount: number): string {
    let blueGradient = ['#d2e6ff', '#a9d0ff', '#6cafff', '#308eff', '#0074ff']
    if (todaysCount == 0) {
      return "rgb(230, 230, 230)";
    }else{
      let index = (Math.ceil((todaysCount/maxCount) * blueGradient.length))-1;
      return blueGradient[index];
    }
  }

  onClickDaySquare(daySquare: IDaySquare) {
    this.timeLogService.setCurrentDate(moment(daySquare.date));
  }
  onMouseEnterDaySquare(daySquare: IDaySquare) {
    // if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
    //   daySquare.style = {
    //     "fill":"#2678ff",
    //     "cursor":"pointer"
    //   }
    // }else{
    //   daySquare.style = {
    //     "cursor":"pointer",
    //     "fill":"lightblue",
    //     "stroke":"#a5c7ff",
    //     "stroke-width":10
    //   }
    // }

  }
  onMouseLeaveDaySquare(daySquare: IDaySquare) {
    // if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
    //   daySquare.style = {
    //     "fill":"#2678ff",
    //     "stroke":"#a5c7ff",
    //     "stroke-width":10
    //   }
    // }else{
    //   daySquare.style = { 
    //     "fill":"#ddeaff",
    //   }
    // }

  }

  buildDaySquares(date: moment.Moment, viewBoxWidth, viewBoxHeight, monthData: Array<{ date: string, timeMarks: number }>): IDaySquare[] {
    let firstOfMonth = moment(date).date(1);
    let lastOfMonth = moment(date).endOf('month');
    let currentDate: moment.Moment = firstOfMonth;
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.date()+firstOfMonth.day())/columns);
    // let rows = 6;

    let padding = 15;
    let dayWidth = (viewBoxWidth - (padding * (columns + 1))) / columns;
    let dayHeight = (viewBoxHeight - (padding * (rows + 1))) / rows;

    let daySquares: IDaySquare[] = [];

    let maxCount = 0;

    for (let monthDay of monthData) {
      if (monthDay.timeMarks > maxCount) {
        maxCount = monthDay.timeMarks;
      }
    }



    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (currentDate === firstOfMonth) {
          col = currentDate.day();
        }
        let x = padding + (col * dayWidth) + (col * padding);
        let y = padding + (row * dayHeight) + (row * padding);
        let path = 'M' + x + ' ' + y +
          ' L' + x + ' ' + (y + dayHeight) +
          ' L' + (x + dayWidth) + ' ' + (y + dayHeight) +
          ' L' + (x + dayWidth) + ' ' + y +
          ' Z' +
          '';

        let todaysCount = 0;
        for(let monthDay of monthData){
          if (moment(monthDay.date).dayOfYear() == currentDate.dayOfYear()) {
            todaysCount = monthDay.timeMarks;
          }
        }


        let daySquare: IDaySquare = {
          date: currentDate,
          svgPath: path,
          style: {
            "fill": this.daySquareGradient(todaysCount, maxCount),
            "stroke": "none"
          },
          text_x: x + (dayWidth / 2),
          text_y: y + (dayWidth / 2)
          // eventActivities: [] 
        }
        // if(moment(date).dayOfYear() === moment(daySquare.date).dayOfYear()){
        //   daySquare.style = {
        //     "fill":"#ccdfff",
        //     "stroke":"#a5c7ff",
        //     "stroke-width":10
        //   }
        // }
        // if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
        //   daySquare.style = {
        //     "fill":"#2678ff",
        //     "stroke":"none"
        //   }
        // }

        if (currentDate.month() === lastOfMonth.month())
          daySquares.push(daySquare);

        let nextDate: moment.Moment = moment(currentDate);
        nextDate.date(nextDate.date() + 1);
        currentDate = nextDate;



      }
    }
    return daySquares;
  }

}
