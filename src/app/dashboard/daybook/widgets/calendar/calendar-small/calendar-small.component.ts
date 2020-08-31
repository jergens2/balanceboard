import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalendarDay } from './calendar-day.interface';
import * as moment from 'moment';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { DaybookDayItemController } from '../../../api/daybook-day-item-controller';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { Clock } from '../../../../../shared/time-utilities/clock.class';

@Component({
  selector: 'app-calendar-small',
  templateUrl: './calendar-small.component.html',
  styleUrls: ['./calendar-small.component.css']
})
export class CalendarSmallComponent implements OnInit {


  constructor(private daybookService: DaybookDisplayService) { }

  private _clock: Clock;

  public readonly faExpand = faExpand;

  @Output() public expand: EventEmitter<boolean> = new EventEmitter();
  @Input() public date: moment.Moment;

  public onClickExpand() { this.expand.emit(true); }


  public daysOfCalendar: CalendarDay[] = [];
  public isLarge: boolean = false;

  ngOnInit() {
    this._clock = new Clock();
    this.date = moment();
    // this._daybookManager = this.daybookService.daybookController;

    if (this.date) {
      // Large calendar
      this.isLarge = true;
      this.buildDaysOfCalendar(this.date, 'LARGE');
    } else {
      // Small calendar
      this.buildDaysOfCalendar(this.date, 'SMALL');

      // this.daybookService.mana$.subscribe((activeDayChanged) => {
      //   if(activeDayChanged){
      //     this._daybookManager = activeDayChanged;
      //     this.buildDaysOfCalendar(moment(this._daybookManager.dateYYYYMMDD), "SMALL");
      //   }

      // });
    }




  }

  public onClickCalendarDay(dayOfCalendar: CalendarDay) {
    this.daybookService.changeCalendarDate$(dayOfCalendar.date.format('YYYY-MM-DD'));
  }

  private buildDaysOfCalendar(date: moment.Moment, size: 'SMALL' | 'LARGE') {



    const daysOfCalendar: CalendarDay[] = [];

    let firstDate: moment.Moment = moment(date).startOf('month');
    if (firstDate.day() == 0) {
      firstDate = moment(firstDate).subtract(7, 'days');
    } else {
      firstDate = moment(firstDate).startOf('week');
    }

    const lastDate: moment.Moment = moment(firstDate).add(6, 'weeks').subtract(1, 'day');

    let currentDate: moment.Moment = moment(firstDate);
    while (currentDate.isSameOrBefore(lastDate)) {
      const isThisMonth: boolean = moment(date).month() == moment(currentDate).month();
      const isToday: boolean = moment(currentDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD');
      console.log("fix the calendar")
      const isActiveDay: boolean = moment().format('YYYY-MM-DD') === moment(currentDate).format('YYYY-MM-DD');


      let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN' = 'WINTER';


      /**
       * For simplicity i just use the date of the 21st for season change regardless of the season,
       * even though in reality it is not always the 21st.
       */
      if (moment(currentDate).isSameOrAfter(moment(currentDate).startOf('year')) &&
        moment(currentDate).isBefore(moment(currentDate).month(2).date(21))) {
        season = 'WINTER';
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(2).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(5).date(21))) {
        season = 'SPRING';
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(5).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(8).date(21))) {
        season = 'SUMMER';
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(8).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(11).date(21))) {
        season = 'AUTUMN';
      } else {
        season = 'WINTER';
      }

      const calendarDay: CalendarDay = {
        date: moment(currentDate),
        isThisMonth: isThisMonth,
        isToday: isToday,
        isActiveDay: isActiveDay,
        season: season,
      };

      daysOfCalendar.push(calendarDay);

      currentDate = moment(currentDate).add(1, 'days');
    }

    if (size == 'SMALL') {
      this._monthHeader = moment(date).format('MMMM YYYY');
    } else if (size == 'LARGE') {
      this._monthHeader = moment(date).format('MMMM');
    }


    this.daysOfCalendar = daysOfCalendar;
  }

  private _monthHeader: string = '';
  public get monthHeader(): string {
    return this._monthHeader;
  }


  private _mouseIsOver: boolean = false;
  public onMouseEnter() { this._mouseIsOver = true; }
  public onMouseLeave() { this._mouseIsOver = false; }
  public get mouseIsOver(): boolean { return this._mouseIsOver; }

}
