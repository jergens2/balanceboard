import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TimelogService } from '../timelog.service';

import * as moment from 'moment';
import { Subscription, Subject, Observable, merge } from 'rxjs';
import { TimeSegment } from '../time-segment.model';

import { faSpinner, faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';

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

  faSpinner = faSpinner;
  faArrowCircleRight = faArrowCircleRight;
  faArrowCircleLeft = faArrowCircleLeft;

  // currentMonth: moment.Moment;
  currentDate: moment.Moment;
  timeSegments: TimeSegment[] = [];
  timeSegmentsDayCeiling: number = 0;

  daySquares: IDaySquare[];
  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number

  ifLoadingCalendar: boolean;


  ngOnInit() {



    this.viewBoxHeight = 600;
    this.viewBoxWidth = 800;
    this.viewBox = "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;

    this.currentDate = moment();
    this.daySquares = this.buildDaySquares(this.viewBoxWidth, this.viewBoxHeight);


    this.timeLogService.currentDate$.subscribe((date) => {
      if (moment(this.currentDate).month() != moment(date).month()) {
        this.currentDate = date;
        this.daySquares = this.buildDaySquares(this.viewBoxWidth, this.viewBoxHeight);
      }
      this.currentDate = date;
    })

    this.timeLogService.timeSegments$.subscribe((timeSegments: TimeSegment[]) => {
      this.timeSegments = timeSegments;
      this.calculateTimeSegmentsCountCeiling();
    })



  }

  private calculateTimeSegmentsCountCeiling(): number {
    if (this.timeSegments != null) {
      if (this.timeSegments.length > 0) {
        let currentDate = moment(this.timeSegments[0].startTimeISO);
        let currentMax = 0;
        let tempMax = 0;
        for (let timeSegment of this.timeSegments) {

          if (currentDate.dayOfYear() == moment(timeSegment.startTimeISO).dayOfYear()) {

            tempMax++;
            if (tempMax > currentMax) {
              currentMax = tempMax;
            }
          } else {
            tempMax = 0;
          }
          currentDate = moment(timeSegment.startTimeISO)
        }
        return currentMax;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  private daySquareGradient(thisDaysCount: number, maxCount: number): string {
    // console.log(thisDaysCount, maxCount);
    let blueGradient = ['#d2e6ff', '#a9d0ff', '#6cafff', '#308eff', '#0074ff']
    if (thisDaysCount == 0) {
      return "rgb(230, 230, 230)";
    } else {
      let index = (Math.ceil((thisDaysCount / maxCount) * blueGradient.length)) - 1;
      return blueGradient[index];
    }
  }

  buildDaySquares(viewBoxWidth, viewBoxHeight): IDaySquare[] {
    /*
      2018-12-03: timeSegments parameter will represent all timeSegments for the entire month.  Therefore we can just make the assumption that any timeSegment in timeSegments will
      be of the month that we want to deal with.
    */
    let date: moment.Moment = moment(this.currentDate);


    let firstOfMonth = moment(date).date(1);
    let lastOfMonth = moment(date).endOf('month');
    let currentDate: moment.Moment = firstOfMonth;
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.date() + firstOfMonth.day()) / columns);
    // let rows = 6;

    let padding = 5;
    let dayWidth = (viewBoxWidth - (padding * (columns + 1))) / columns;
    let dayHeight = (viewBoxHeight - (padding * (rows + 1))) / rows;

    let daySquares: IDaySquare[] = [];


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

        // let thisDaysTimeSegments = [];
        // for(let timeSegment of this.timeSegments){
        //   if(moment(timeSegment.startTime).dayOfYear() == moment(date).dayOfYear()){
        //     thisDaysTimeSegments.push(timeSegment);
        //   }
        // }
        // console.log(thisDaysTimeSegments);


        let daySquare: IDaySquare = {
          date: currentDate,
          svgPath: path,
          style: {
            // "fill": this.daySquareGradient(thisDaysTimeSegments.length, this.timeSegmentsDayCeiling),
            "fill": "rgb(230, 230, 230)",
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


  /*
      TEMPLATE FUNCTIONS
  */

  get currentDateString(): string {
    return this.currentDate.format('YYYY-MM-DD');
  }

  onClickAdjacentDate(direction: string) {

    // this.onCloseForm();  
    // close the new time segment form


    // this.timeSegmentTiles = null;
    // this.ifLoadingTimeSegments = true;

    // console.log(this._currentDate.format('YYYY-MM-DD'))
    if (direction == "left") {
      let newDate = moment(this.currentDate).subtract(1, 'days');
      // console.log("clicked left, changing to new date:", newDate.format('YYYY-MM-DD'))
      this.timeLogService.currentDate = newDate;
    } else if (direction == "right") {
      let newDate = moment(this.currentDate).add(1, 'days');
      // console.log("clicked right, changing to new date:", newDate.format('YYYY-MM-DD'))
      this.timeLogService.currentDate = newDate;
    }


  }
  dateFormattedDateString(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('dddd, MMMM Do, gggg');
  }

  dateFormattedDateStringShort(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('MMMM Do, gggg');
  }


  onClickDaySquare(daySquare: IDaySquare) {
    this.timeLogService.currentDate = (moment(daySquare.date));
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




}
