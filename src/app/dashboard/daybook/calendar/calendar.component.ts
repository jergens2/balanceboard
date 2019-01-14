import { Component, OnInit } from '@angular/core';
import { ICalendarDay } from './calendar-day.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-daybook-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor() { }

  calendarDays: ICalendarDay[] = []

  today: moment.Moment = moment();

  ngOnInit() {
    this.calendarDays = this.buildCalendarDays();
  }

  buildCalendarDays(): ICalendarDay[]{

    let calendarDays: ICalendarDay[] = [];

    let today = moment(this.today);
    let firstDate = moment(today).startOf('month');
    let lastDate = moment(today).endOf('month');

    let weeksAfterFirstRow: number = Math.ceil((moment(lastDate).date() - (7-moment(firstDate).day())) / 7 );
    let additionalDays: number = 0;
    if(weeksAfterFirstRow == 4){
      additionalDays = 7 + (7-lastDate.day())
    }else if(weeksAfterFirstRow == 5){
      additionalDays = (7-lastDate.day())
    }
    lastDate = moment(lastDate).add(additionalDays, 'days');


    let currentDate = moment(firstDate).subtract(firstDate.day(), 'days');
    let currentRow: number = 3;


    while(currentDate.format('YYYY-MM-DD') < lastDate.format('YYYY-MM-DD')){
      let isThisMonth: boolean = false;
      let isToday: boolean = false;
      if(currentDate.month() == moment(today).month()){
        isThisMonth = true;
      }
      if(currentDate.dayOfYear() == moment(today).dayOfYear()){
        isToday = true;
      }
      let style = { "grid-row": "" + currentRow + " / span 1", "grid-column":"" + (currentDate.day() + 1) + " / span 1" };
      let calendarDay: ICalendarDay = { date:moment(currentDate) , style: style, isThisMonth: isThisMonth, isToday:isToday}

      calendarDays.push(calendarDay);
      currentDate = moment(currentDate).add(1, "days");
      if(currentDate.day() == 0){
        currentRow ++;
      }
    }
    

    return calendarDays;
  }



}
