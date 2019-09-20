import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalendarDay } from './calendar-day.interface';
import * as moment from 'moment';
import { faArrowRight, faArrowLeft, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { DaybookSmallWidget } from '../../daybook-small-widget.interface';
import { DaybookService } from '../../../daybook.service';

@Component({
  selector: 'app-calendar-small',
  templateUrl: './calendar-small.component.html',
  styleUrls: ['./calendar-small.component.css']
})
export class CalendarSmallComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  faExpand = faExpand;

  @Output() expand: EventEmitter<boolean> = new EventEmitter();

  onClickExpand() {
    this.expand.emit(true);
  }

  private activeDay: DaybookDayItem;
  public daysOfCalendar: CalendarDay[] = [];

  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;

    this.buildDaysOfCalendar(moment(this.activeDay.dateYYYYMMDD));

    this.daybookService.activeDay$.subscribe((activeDayChanged)=>{
      this.activeDay = activeDayChanged;
      console.log("WE REBUILDING BOSS")
      this.buildDaysOfCalendar(moment(this.activeDay.dateYYYYMMDD));
    });

    
  }

  public onClickCalendarDay(dayOfCalendar: CalendarDay){
    this.daybookService.activeDayYYYYMMDD = dayOfCalendar.date.format("YYYY-MM-DD");
  }

  private buildDaysOfCalendar(activeDate: moment.Moment){
    let daysOfCalendar: CalendarDay[] = [];

    let firstDate: moment.Moment = moment(activeDate).startOf("month");
    if(firstDate.day() == 0){
      firstDate = moment(firstDate).subtract(7, "days");
    }else{
      firstDate = moment(firstDate).startOf("week");
    }

    const lastDate: moment.Moment = moment(firstDate).add(6, "weeks").subtract(1, "day");

    let currentDate: moment.Moment = moment(firstDate);
    while(currentDate.isSameOrBefore(lastDate)){
      let isThisMonth: boolean = moment(activeDate).month() == moment(currentDate).month();
      let isToday: boolean = moment(currentDate).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD");
      let isActiveDay: boolean = moment(this.activeDay.dateYYYYMMDD).format("YYYY-MM-DD") == moment(currentDate).format("YYYY-MM-DD");
      let calendarDay: CalendarDay = {
        date: moment(currentDate),
        isThisMonth: isThisMonth,
        isToday: isToday,
        isActiveDay: isActiveDay,
      };
      
      daysOfCalendar.push(calendarDay);

      currentDate = moment(currentDate).add(1, "days");
    }


    this._monthHeader = moment(activeDate).format("MMMM YYYY");
    this.daysOfCalendar = daysOfCalendar;
  }

  private _monthHeader: string = "";
  public get monthHeader(): string {
    return this._monthHeader;
  }


  private _mouseIsOver: boolean = false;
  public onMouseEnter(){
    this._mouseIsOver = true;
  }
  public onMouseLeave(){
    this._mouseIsOver = false;
  }
  public get mouseIsOver(): boolean{
    return this._mouseIsOver;
  }

}
