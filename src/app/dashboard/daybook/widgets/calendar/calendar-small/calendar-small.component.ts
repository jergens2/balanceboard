import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalendarDay } from './calendar-day.interface';
import * as moment from 'moment';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import { DaybookController } from '../../../controller/daybook-controller.class';

@Component({
  selector: 'app-calendar-small',
  templateUrl: './calendar-small.component.html',
  styleUrls: ['./calendar-small.component.css']
})
export class CalendarSmallComponent implements OnInit {

  constructor(private daybookControllerService: DaybookControllerService) { }

  faExpand = faExpand;

  @Output() expand: EventEmitter<boolean> = new EventEmitter();
  @Input() date: moment.Moment;

  onClickExpand() {
    this.expand.emit(true);
  }

  private activeDayController: DaybookController;
  public daysOfCalendar: CalendarDay[] = [];

  public isLarge: boolean = false;

  ngOnInit() {
    this.activeDayController = this.daybookControllerService.activeDayController;

    if (this.date) {
      // Large calendar
      this.isLarge = true;
      this.buildDaysOfCalendar(this.date, "LARGE");
    } else {
      // Small calendar
      this.buildDaysOfCalendar(moment(this.activeDayController.dateYYYYMMDD), "SMALL");

      this.daybookControllerService.activeDayController$.subscribe((activeDayChanged) => {
        if(activeDayChanged){
          this.activeDayController = activeDayChanged;
          this.buildDaysOfCalendar(moment(this.activeDayController.dateYYYYMMDD), "SMALL");
        }

      });
    }




  }

  public onClickCalendarDay(dayOfCalendar: CalendarDay) {
    this.daybookControllerService.setActiveDayYYYYMMDD(dayOfCalendar.date.format("YYYY-MM-DD"));
  }

  private buildDaysOfCalendar(date: moment.Moment, size: "SMALL" | "LARGE") {



    let daysOfCalendar: CalendarDay[] = [];

    let firstDate: moment.Moment = moment(date).startOf("month");
    if (firstDate.day() == 0) {
      firstDate = moment(firstDate).subtract(7, "days");
    } else {
      firstDate = moment(firstDate).startOf("week");
    }

    const lastDate: moment.Moment = moment(firstDate).add(6, "weeks").subtract(1, "day");

    let currentDate: moment.Moment = moment(firstDate);
    while (currentDate.isSameOrBefore(lastDate)) {
      let isThisMonth: boolean = moment(date).month() == moment(currentDate).month();
      let isToday: boolean = moment(currentDate).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD");
      let isActiveDay: boolean = moment(this.activeDayController.dateYYYYMMDD).format("YYYY-MM-DD") == moment(currentDate).format("YYYY-MM-DD");


      let season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN" = "WINTER";


      /**
       * For simplicity i just use the date of the 21st for season change regardless of the season,
       * even though in reality it is not always the 21st.
       */
      if (moment(currentDate).isSameOrAfter(moment(currentDate).startOf("year")) &&
        moment(currentDate).isBefore(moment(currentDate).month(2).date(21))) {
        season = "WINTER";
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(2).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(5).date(21))) {
        season = "SPRING";
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(5).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(8).date(21))) {
        season = "SUMMER";
      } else if (moment(currentDate).isSameOrAfter(moment(currentDate).month(8).date(21)) &&
        moment(currentDate).isBefore(moment(currentDate).month(11).date(21))) {
        season = "AUTUMN";
      }else{
        season = "WINTER";
      }

      let calendarDay: CalendarDay = {
        date: moment(currentDate),
        isThisMonth: isThisMonth,
        isToday: isToday,
        isActiveDay: isActiveDay,
        season: season,
      };

      daysOfCalendar.push(calendarDay);

      currentDate = moment(currentDate).add(1, "days");
    }

    if (size == "SMALL") {
      this._monthHeader = moment(date).format("MMMM YYYY");
    } else if (size == "LARGE") {
      this._monthHeader = moment(date).format("MMMM");
    }


    this.daysOfCalendar = daysOfCalendar;
  }

  private _monthHeader: string = "";
  public get monthHeader(): string {
    return this._monthHeader;
  }


  private _mouseIsOver: boolean = false;
  public onMouseEnter() {
    this._mouseIsOver = true;
  }
  public onMouseLeave() {
    this._mouseIsOver = false;
  }
  public get mouseIsOver(): boolean {
    return this._mouseIsOver;
  }

}
