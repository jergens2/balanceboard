import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICalendarDay } from './calendar-day.interface';
import * as moment from 'moment';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-daybook-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor(private router: Router) { }


  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;

  calendarDays: ICalendarDay[] = []

  calendarMonthDate: moment.Moment = moment();

  // today: moment.Moment = moment();

  private _currentDate: moment.Moment = moment();
  @Input() set currentDate(date: moment.Moment){
    this._currentDate = moment(date);
    this.calendarDays = this.buildCalendarDays(this._currentDate);
    this.calendarMonthDate = moment(this._currentDate);
  }
  get currentDate(): moment.Moment{
    return this._currentDate;
  }
  @Output() changedDate: EventEmitter<moment.Moment> = new EventEmitter(); 

  ngOnInit() {
    this.calendarDays = this.buildCalendarDays(this.currentDate);
  }

  buildCalendarDays(referenceDate: moment.Moment): ICalendarDay[]{

    let calendarDays: ICalendarDay[] = [];

    let today = moment(referenceDate);
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
      let isCurrentDay: boolean = false;
      if(currentDate.month() == moment(today).month()){
        isThisMonth = true;
      }
      if(currentDate.dayOfYear() == moment().dayOfYear()){
        isToday = true;
      }
      if(currentDate.dayOfYear() == moment(this.currentDate).dayOfYear()){
        isCurrentDay = true;
      }
      let style = { "grid-row": "" + currentRow + " / span 1", "grid-column":"" + (currentDate.day() + 1) + " / span 1" };
      let calendarDay: ICalendarDay = { date:moment(currentDate) , style: style, isThisMonth: isThisMonth, isToday:isToday, isCurrentDay:isCurrentDay }

      calendarDays.push(calendarDay);
      currentDate = moment(currentDate).add(1, "days");
      if(currentDate.day() == 0){
        currentRow ++;
      }
    }
    

    return calendarDays;
  }

  onClickDay(calendarDay: ICalendarDay){
    this.changedDate.emit(calendarDay.date);
  }

  onClickMonthHeader(){
    
    if(this.calendarMonthDate.month() == moment().month()){
      this.router.navigate(['/month_planner']);
    }else{
      this.calendarMonthDate = moment();
      this.calendarDays = this.buildCalendarDays(this.calendarMonthDate);
    }
    //first click:  set the month back to current month
    //if it's already on the current month then do the router.navigate()
    
  }

  onClickCalendarLeft(){
    this.calendarMonthDate = moment(this.calendarMonthDate).subtract(1,'month');
    this.calendarDays = this.buildCalendarDays(this.calendarMonthDate);
  }

  onClickCalendarRight(){
    this.calendarMonthDate = moment(this.calendarMonthDate).add(1,'month');
    this.calendarDays = this.buildCalendarDays(this.calendarMonthDate);
  }

}
