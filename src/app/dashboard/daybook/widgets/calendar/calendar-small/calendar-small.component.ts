import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CalendarDay } from './calendar-day.interface';
import * as moment from 'moment';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { Clock } from '../../../../../shared/time-utilities/clock.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-small',
  templateUrl: './calendar-small.component.html',
  styleUrls: ['./calendar-small.component.css']
})
export class CalendarSmallComponent implements OnInit, OnDestroy {

  private _daysOfCalendar: CalendarDay[] = [];
  private _isLarge: boolean = false;
  private _mouseIsOver: boolean = false;
  private _monthHeader: string = '';
  private _updateSub: Subscription;

  constructor(private daybookService: DaybookDisplayService) { }

  public readonly faExpand = faExpand;
  @Output() public expand: EventEmitter<boolean> = new EventEmitter();

  public get isLarge(): boolean { return this._isLarge; }
  public get daysOfCalendar(): CalendarDay[] { return this._daysOfCalendar; }

  public get mouseIsOver(): boolean { return this._mouseIsOver; }
  public get monthHeader(): string { return this._monthHeader; }

  public onClickExpand() { this.expand.emit(true); }
  public onMouseEnter() { this._mouseIsOver = true; }
  public onMouseLeave() { this._mouseIsOver = false; }
  public onClickCalendarDay(dayOfCalendar: CalendarDay) {
    this.daybookService.changeCalendarDate$(dayOfCalendar.date.format('YYYY-MM-DD'));
  }

  ngOnInit() {
    this._buildDaysOfCalendar(moment(this.daybookService.activeDateYYYYMMDD).startOf('day'));
    this._updateSub = this.daybookService.displayUpdated$.subscribe(update => {
      this._buildDaysOfCalendar(moment(this.daybookService.activeDateYYYYMMDD).startOf('day'));
    });
  }
  ngOnDestroy() {
    this._updateSub.unsubscribe();
  }

  private _buildDaysOfCalendar(date: moment.Moment) {
    const daysOfCalendar: CalendarDay[] = [];

    let firstDate: moment.Moment = moment(date).startOf('month');
    if (firstDate.day() === 0) {
      firstDate = moment(firstDate).subtract(7, 'days');
    } else {
      firstDate = moment(firstDate).startOf('week');
    }

    const lastDate: moment.Moment = moment(firstDate).add(6, 'weeks').subtract(1, 'day');

    let currentDate: moment.Moment = moment(firstDate);
    while (currentDate.isSameOrBefore(lastDate)) {
      const activeDateYYYYMMDD: string = this.daybookService.activeDateYYYYMMDD;
      const isThisMonth: boolean = moment(date).month() === moment(currentDate).month();
      const isToday: boolean = moment(currentDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
      const isActiveDay: boolean = moment(activeDateYYYYMMDD).format('YYYY-MM-DD') === moment(currentDate).format('YYYY-MM-DD');
      let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN' = 'WINTER';
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
    this._monthHeader = moment(date).format('MMMM');
    this._daysOfCalendar = daysOfCalendar;
  }
}
