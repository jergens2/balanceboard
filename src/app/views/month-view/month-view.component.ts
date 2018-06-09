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

  monthEvents: EventActivity[];
  now: moment.Moment;
  days: DaySquare[];

  constructor(private timeService: TimeService, private homeService: HomeService) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 800;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.days = this.calculateDays(this.viewBoxHeight, this.viewBoxWidth);
    this.now = this.timeService.getActiveDate();
    this.timeService.getEventActivitysByDateRange(this.now.startOf('month'),this.now.endOf('month')).subscribe(
      (events) => {
        console.log(events);
      }
    )
  }

  calculateDays(viewBoxHeight, viewBoxWidth): DaySquare[] {
    let now: moment.Moment = this.timeService.getDate();
    let firstOfMonth = moment(now).date(1);
    let lastOfMonth = moment(now).endOf('month');
    let currentDate: moment.Moment = firstOfMonth;
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.date()+firstOfMonth.day())/columns);

    let padding = 10;
    let dayWidth = (viewBoxWidth - (padding*(columns+1))) / columns;
    let dayHeight = (viewBoxHeight - (padding*(rows+1))) / rows;

    let days: DaySquare[] = [];

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
        let day: DaySquare = {
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
          days.push(day);

        let nextDate: moment.Moment = moment(currentDate);
        nextDate.date(nextDate.date() + 1);
        currentDate = nextDate;

        
        
      }
    }
    return days;
  }

  onClick(day: DaySquare){
    this.timeService.setActiveDate(day.date);
    this.homeService.setView('day');
  }
  onMouseEnter(day: DaySquare){
    day.style = {
      "fill":"#f9f9f9",
      "stroke":"blue",
      "cursor":"pointer"
    }
  }
  onMouseLeave(day: DaySquare){
    day.style = {
      "fill":"#f9f9f9",
      "stroke":"none"
    }
  }

}
