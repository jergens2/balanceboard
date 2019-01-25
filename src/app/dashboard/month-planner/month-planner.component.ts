import { Component, OnInit } from '@angular/core';
import { IDayOfMonth } from './day-of-month.interface';
import * as moment from 'moment';
import * as gFonts from 'google-fonts';


@Component({
  selector: 'app-month-planner',
  templateUrl: './month-planner.component.html',
  styleUrls: ['./month-planner.component.css']
})
export class MonthPlannerComponent implements OnInit {

  constructor() { }

  daysOfMonth: IDayOfMonth[] = [];

  

  ngOnInit() {
    let currentDate = moment();
    this.daysOfMonth = this.buildDaysOfMonth(currentDate);
  }


  buildDaysOfMonth(date: moment.Moment): IDayOfMonth[]{
    let days: IDayOfMonth[] = []

    let firstOfCalendar: moment.Moment = moment(moment(date).startOf('month')).startOf('week');
    let lastOfCalendar: moment.Moment = moment(firstOfCalendar).add(41,'days');
    let currentDate: moment.Moment = moment(firstOfCalendar);
    while(moment(currentDate).isSameOrBefore(moment(lastOfCalendar))){
      let isThisMonth: boolean = false;
      if(moment(currentDate).month() == moment(date).month()){
        isThisMonth = true;
      }
      let day: IDayOfMonth = { date: currentDate, style: {} , isThisMonth: isThisMonth }
      days.push(day);

      currentDate = moment(currentDate).add(1,'days');
    }

    return days;
  }

}
