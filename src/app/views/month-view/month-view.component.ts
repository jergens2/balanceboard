import { EventActivity } from './../../models/event-activity.model';
import * as moment from 'moment';
import { HomeService } from './../../services/home.service';
import { TimeService } from './../../services/time.service';
import { Component, OnInit } from '@angular/core';
import { DaySquare } from './daySquare.model';


@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit {

  
  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number;

  now: moment.Moment;
  daySquares: DaySquare[];
  maxCount: number = 0;

  constructor(private timeService: TimeService, private homeService: HomeService) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 800;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.now = this.timeService.getActiveDate();
    this.daySquares = this.calculateDaySquares(this.viewBoxHeight, this.viewBoxWidth);
    this.timeService.getEventActivitysByDateRange(moment(this.now.startOf('month')),moment(this.now.endOf('month')))
      .subscribe((eventList)=>{
        this.updateDaySquareEvents(eventList);
      });
  }
  updateDaySquareEvents(eventActivities: EventActivity[]){
    for(let eventActivity of eventActivities){
      for(let daySquare of this.daySquares){
        if(eventActivity.startTime.format('YYYY-MM-DD') === daySquare.date.format('YYYY-MM-DD')){
          daySquare.eventActivities.push(eventActivity);
        }
      }
    }
    
    for(let daySquare of this.daySquares){
      if(daySquare.eventActivities.length > this.maxCount){
        this.maxCount = daySquare.eventActivities.length;
      }
    }
    for(let daySquare of this.daySquares){
      daySquare.style = {
        "fill":this.getColorScale(daySquare.eventActivities.length, this.maxCount),
        "stroke":"none"
      }
    }
  }

  getColorScale(value, max): string{
    
    const colorScale = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c'];
    if(value == 0){
      return "#f9f9f9";
    }else{
      return colorScale[Math.ceil((value*colorScale.length)/max)-1];

    }

  }

  calculateDaySquares(viewBoxHeight, viewBoxWidth): DaySquare[] {
    let now: moment.Moment = this.timeService.getDate();
    let firstOfMonth = moment(now).date(1);
    let lastOfMonth = moment(now).endOf('month');
    let currentDate: moment.Moment = firstOfMonth;
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.date()+firstOfMonth.day())/columns);

    let padding = 10;
    let dayWidth = (viewBoxWidth - (padding*(columns+1))) / columns;
    let dayHeight = (viewBoxHeight - (padding*(rows+1))) / rows;

    let daySquares: DaySquare[] = [];

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
        let daySquare: DaySquare = {
          date: currentDate,
          svgPath: path,
          style: {
            "fill":"#f9f9f9",
            "stroke":"none"
          },
          text_x: x+5,
          text_y: y+20,
          eventActivities: [] 
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

  onClick(daySquare: DaySquare){
    this.timeService.setActiveDate(daySquare.date);
    this.homeService.setView('day');
  }
  onMouseEnter(daySquare: DaySquare){
    daySquare.style = {
      "fill":"yellow",
      "stroke":"blue",
      "cursor":"pointer"
    }
  }
  onMouseLeave(daySquare: DaySquare){
    daySquare.style = {
      "fill":this.getColorScale(daySquare.eventActivities.length, this.maxCount),
      "stroke":"none",
      "stroke-width":""
    }
  }

}
