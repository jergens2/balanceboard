import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DayDataService } from '../../document-data/day-data/day-data.service';
import { DayData } from '../../document-data/day-data/day-data.class';
import { ActivityCategoryDefinitionService } from '../../document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../document-definitions/activity-category-definition/activity-category-definition.class';
import { Router } from '@angular/router';
import { SizeService } from '../../app-screen-size/size.service';
import { AppScreenSize } from '../../app-screen-size/app-screen-size.enum';
import { OnScreenSizeChanged } from '../../app-screen-size/on-screen-size-changed.interface';
import { IYearViewData } from './year-view-data.interface';
import { IDayOfYear } from './day-of-year.interface';
import { TimeViewsService } from '../time-views.service';

@Component({
  selector: 'app-year-view',
  templateUrl: './year-view.component.html',
  styleUrls: ['./year-view.component.css']
})
export class YearViewComponent implements OnInit, OnScreenSizeChanged {

  constructor(
    private daybookService: DayDataService,
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService,
    private router: Router,
    private sizeService: SizeService,
    private timeViewsService: TimeViewsService,
  ) { }

  currentYear: number = 2019;

  months: any[] = null;

  allDays: IDayOfYear[] = [];

  toolTip: { style: any, value: string };

  appScreenSize: AppScreenSize;


  @Input() yearViewData: IYearViewData;
  @Output() dateClicked: EventEmitter<any> = new EventEmitter();


  ngOnInit() {
    this.appScreenSize = this.sizeService.appScreenSize;
    this.sizeService.appScreenSize$.subscribe((appScreenSize: AppScreenSize) => {
      this.onScreenSizeChanged(appScreenSize);
    })

    /*
      Simple method of improved performance:
      
      Instead of pulling the days asynchronously at this time with daybookService, pull them on login and store them in memory.

      as of this writing, it takes approximately 300ms to run buildData() which is fast enough.  
      The part that takes a long while is the async loading, which takes about 800ms


    */

    this.buildCalendar(this.currentYear);


    let currentMonth = moment().startOf("year");

    // this.daybookService.getDaysInRange$(moment(currentMonth), moment(currentMonth).endOf("year")).subscribe((days: Day[]) => {

    //   this.allDays = days;
    //   this.buildData(this.allDays);

    // });

  }

  onScreenSizeChanged(appScreenSize: AppScreenSize) {
    this.appScreenSize = appScreenSize;
  }


  private buildCalendar(currentYear: number) {
    let months: any[] = [];
    let currentMonth = moment().year(currentYear).startOf("year");
    for (let i = 0; i < 12; i++) {

      let currentDay: moment.Moment = moment(currentMonth).startOf("month");
      let endOfMonth: moment.Moment = moment(currentMonth).endOf("month");
      let days: IDayOfYear[] = [];

      let daysAfterStart: number = moment(currentDay).day();
      for (let i = 0; i < daysAfterStart; i++) {
        days.push(null);
      }

      while (currentDay.isBefore(endOfMonth)) {

        let builtDay: IDayOfYear = this.buildDay(currentDay)
        days.push(builtDay);
        this.allDays.push(builtDay);
        currentDay = moment(currentDay).add(1, "days");
      }


      months.push({
        monthDate: currentMonth,
        daysOfMonth: days
      })
      currentMonth = moment(currentMonth).add(1, "month");
    }

    this.months = months;
  }


  private buildDay(currentDay: moment.Moment): IDayOfYear {

    let day: IDayOfYear;

    let dayStyle: any = {};
    let dayObject: DayData = null;

    let dayData: any;

    if (this.yearViewData != null) {
      let dataElement = this.yearViewData.data.find((element) => {
        return element.dateYYYYMMDD == currentDay.format('YYYY-MM-DD');
      })
      dayData = dataElement.value;


      dayStyle = { "background-color": this.dayBackgroundColor(dayData, this.yearViewData.maxValue) };
    } else {
      dayStyle = {};
    }




    day = {
      date: currentDay,
      dayData: dayObject,
      style: dayStyle,
      isHighlighted: false,
    }

    return day;
  }


  private dayBackgroundColor(value: number, maxValue: number): string {
    let color = "rgba(0, 153, 64, " + (value / maxValue).toFixed(2) + ")";
    return color;
  }



  private buildData(allDays: DayData[]) {



    let months: any[] = [];
    let currentMonth = moment().startOf("year");

    for (let i = 0; i < 12; i++) {

      let currentDay: moment.Moment = moment(currentMonth).startOf("month");
      let endOfMonth: moment.Moment = moment(currentMonth).endOf("month");
      let days: IDayOfYear[] = [];

      let daysAfterStart: number = moment(currentDay).day();
      for (let i = 0; i < daysAfterStart; i++) {
        days.push({
          date: null,
          dayData: null,
          style: { "border": "none", "background-color": "none" },
          isHighlighted: false
        });
      }

      while (currentDay.isBefore(endOfMonth)) {

        let dayStyle: any = {};
        let dayObject = allDays.find((dayObject: DayData) => {
          return dayObject.dateYYYYMMDD == currentDay.format('YYYY-MM-DD');
        })

        if (dayObject) {

          dayStyle = this.buildDayStyle(dayObject);
        } else {

          dayStyle = { "border": "1px solid rgb(206, 206, 206)" };
        }
        days.push({
          date: currentDay,
          dayData: dayObject,
          style: dayStyle,
          isHighlighted: false,
        })
        currentDay = moment(currentDay).add(1, "days");
      }


      months.push({
        monthDate: currentMonth,
        daysOfMonth: days
      })
      currentMonth = moment(currentMonth).add(1, "month");
    }

    this.months = months;
  }


  onClickDay(day: IDayOfYear) {
    this.dateClicked.emit(day);
    // this.router.navigate(['daybook/' + day.dayDate.format('YYYY-MM-DD')]);
  }


  private mouseDownDay: IDayOfYear;
  private mouseOverDay: IDayOfYear;
  onMouseDownDay(day: IDayOfYear) {
    this.mouseDownDay = day;
    this.mouseOverDay = day;
  }

  onMouseOverDay(day: IDayOfYear, hoverEvent: MouseEvent) {

    if (this.mouseOverDay) {
      if (day.date.format('YYYY-MM-DD') != this.mouseOverDay.date.format('YYYY-MM-DD')) {
        this.mouseOverDay = day;
        if (this.mouseDownDay) {
          let startDate: IDayOfYear = this.mouseDownDay;
          let endDate: IDayOfYear = day;
          if (day.date.isBefore(this.mouseDownDay.date)) {
            startDate = day;
            endDate = this.mouseDownDay;
          }
          this.highlightHoverRange(startDate, endDate, hoverEvent);
        }
      }
    }





  }

  onMouseUpDay(day: IDayOfYear) {
    if (this.mouseDownDay) {
      // console.log("Zoom range selected: from " + this.mouseDownDay.date.format('YYYY-MM-DD') + " to " + day.date.format('YYYY-MM-DD')  )
      
      this.timeViewsService.changeRange(this.mouseDownDay.date, day.date );
      this.removeHighlightHoverRange();
    }

  }

  private highlightHoverRange(startDay: IDayOfYear, endDay: IDayOfYear, hoverEvent: MouseEvent) {

    let count = 0;

    this.allDays.forEach(dayOfYear => {
      dayOfYear.isHighlighted = false;
    });
    this.allDays.forEach((dayOfYear: IDayOfYear) => {
      if (dayOfYear.date.isSameOrAfter(startDay.date) && dayOfYear.date.isSameOrBefore(endDay.date)) {
        dayOfYear.isHighlighted = true;
        count++;
      }
    });

    this.toolTip = { value: count.toFixed(0) + " days", style: { "top": (hoverEvent.y - 35) + "px", "left": (hoverEvent.x - 35) + "px" } };
  }

  private removeHighlightHoverRange() {
    this.toolTip = null;
    this.mouseDownDay = null;
    this.mouseOverDay = null;
    this.allDays.forEach(dayOfYear => {
      dayOfYear.isHighlighted = false;
    });
  }

  onMouseUp() {
    this.removeHighlightHoverRange();
  }
  onMouseLeave() {
    this.removeHighlightHoverRange();
  }


  private buildDayStyle(dayObject: DayData) {
    let style: any = {};
    let activity: ActivityCategoryDefinition;
    if (dayObject.activityData) {
      if (dayObject.activityData.length >= 1) {
        activity = this.activityCategoryDefinitionService.findActivityByTreeId(dayObject.activityData[1].activityTreeId);
        style = {
          "background-color": activity.color,
        }
      }
    }
    return style;
  }

  dayData(day: IDayOfYear): string {

    if (day.dayData) {

      if (day.dayData.activityData) {
        let activity: ActivityCategoryDefinition = this.activityCategoryDefinitionService.findActivityByTreeId(day.dayData.activityData[1].activityTreeId)

      }

    } else {
      console.log("No day object for ", day);
    }

    return "";
  }


}
