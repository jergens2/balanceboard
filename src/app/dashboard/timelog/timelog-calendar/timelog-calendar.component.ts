import { Component, OnInit } from '@angular/core';
import { TimelogService } from '../timelog.service';

import * as moment from 'moment';

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
  daySquares: IDaySquare[];
  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number


  ngOnInit() {
    this.viewBoxHeight = 1600;
    this.viewBoxWidth = 1800;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.currentDate = moment();
    this.timeLogService.currentDate$.subscribe((currentDate: moment.Moment) => {
      this.currentDate = currentDate;
      this.daySquares = this.buildDaySquares(this.currentDate, this.viewBoxWidth, this.viewBoxHeight);
    })

  }
  
  onClickDaySquare(daySquare: IDaySquare){
    this.timeLogService.setCurrentDate(moment(daySquare.date));
  }
  onMouseEnterDaySquare(daySquare: IDaySquare){
    if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
      daySquare.style = {
        "fill":"#2678ff",
        "cursor":"pointer"
      }
    }else{
      daySquare.style = {
        "cursor":"pointer",
        "fill":"lightblue",
        "stroke":"#a5c7ff",
        "stroke-width":10
      }
    }

  }
  onMouseLeaveDaySquare(daySquare: IDaySquare){
    if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
      daySquare.style = {
        "fill":"#2678ff",
        "stroke":"#a5c7ff",
        "stroke-width":10
      }
    }else{
      daySquare.style = { 
        "fill":"#ddeaff",
      }
    }

  }

  buildDaySquares(date: moment.Moment, viewBoxWidth, viewBoxHeight): IDaySquare[]{
    let firstOfMonth = moment(date).date(1);
    let lastOfMonth = moment(date).endOf('month');
    let currentDate: moment.Moment = firstOfMonth;
    let columns = 7;
    // let rows = Math.ceil((lastOfMonth.date()+firstOfMonth.day())/columns);
    let rows = 6;

    let padding = 15;
    let dayWidth = (viewBoxWidth - (padding*(columns+1))) / columns;
    let dayHeight = (viewBoxHeight - (padding*(rows+1))) / rows;

    let daySquares: IDaySquare[] = [];

    for(let row = 0; row < rows; row++){
      for(let col = 0; col < columns; col++){
        if(currentDate === firstOfMonth){
          col = currentDate.day();
        }
        let x = padding + (col*dayWidth) + (col*padding);
        let y = padding + (row*dayHeight) + (row*padding);
        let path = 'M'+x+' '+y+
          ' L'+x+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+y+
          ' Z'+
          ''
        let daySquare: IDaySquare = {
          date: currentDate,
          svgPath: path,
          style: {
            "fill":"#ddeaff",
            "stroke":"none"
          },
          text_x: x+5,
          text_y: y+20
          // eventActivities: [] 
        }
        if(moment(date).dayOfYear() === moment(daySquare.date).dayOfYear()){
          daySquare.style = {
            "fill":"#ccdfff",
            "stroke":"#a5c7ff",
            "stroke-width":10
          }
        }
        if(moment().dayOfYear() === moment(daySquare.date).dayOfYear()){
          daySquare.style = {
            "fill":"#2678ff",
            "stroke":"none"
          }
        }

        if(currentDate.month() === lastOfMonth.month())
          daySquares.push(daySquare);

        let nextDate: moment.Moment = moment(currentDate);
        nextDate.date(nextDate.date() + 1);
        currentDate = nextDate;

        
        
      }
    }
    return daySquares;
  }

}
