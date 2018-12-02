import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { faTimes, faCog, faArrowCircleRight, faArrowCircleLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';
import { interval, Subscription, BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ITimeMarkTile {
  timeMark: TimeMark,
  style: Object,
  deleteButtonIsVisible: boolean
}

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})

export class TimelogComponent implements OnInit, OnDestroy {


  constructor(private timeLogService: TimelogService) { }



  faTimes = faTimes;
  faCog = faCog;
  faArrowCircleRight = faArrowCircleRight;
  faArrowCircleLeft = faArrowCircleLeft;
  faSpinner = faSpinner;

  ifLoadingTimeMarks: boolean;
  addTimeMarkForm: boolean = false;

  // private _thisMonthsTimeMarks$: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>(null);

  // private _thisDaysTimeMarks: TimeMark[];
  // private _currentDate$: BehaviorSubject<moment.Moment>; 
  private _currentDate: moment.Moment;

  // thisDayCardStyle = {};

  timeMarkTiles: ITimeMarkTile[] = [];
  private defaultTimeMarkTileStyle: Object;


  ngOnInit() {
    this._currentDate = this.timeLogService.currentDate;
    console.log("current Date", this._currentDate.format('YYYY-MM-DD'), this._currentDate)

    this.ifLoadingTimeMarks = true;
    this.defaultTimeMarkTileStyle = {};

    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment)=>{
      this._currentDate = moment(changedDate);
      console.log("current Date is now ", this._currentDate.format('YYYY-MM-DD'), this._currentDate)
    })

    this.timeLogService.thisDaysTimeMarks.subscribe((timeMarks: TimeMark[]) => {
      console.log("time marks for this day: ", timeMarks);
      this.timeMarkTiles = this.buildThisDaysTimeMarkTiles(timeMarks);
      this.ifLoadingTimeMarks = false;
    })

    //todo:  need to add a subscription that checks for updates on a frequeent basis e.g. every several seconds
    this.timeLogService.onTimeLogComponentInit(moment(this.currentDate));
  }
  ngOnDestroy() {

  }

  get latestTimeMark(): TimeMark {
    return this.timeLogService.latestTimeMark;
  }

  get currentDate(): moment.Moment{
    return this._currentDate;
  }

  get currentDateString(): string {
    return this._currentDate.format('YYYY-MM-DD');
  }

  onClickNewTimeMark() {
    this.addTimeMarkForm = true;
  }
  onCloseForm() {
    this.addTimeMarkForm = false;
  }

  private buildThisDaysTimeMarkTiles(timeMarks: TimeMark[]): ITimeMarkTile[] {

    let timeMarkTiles: ITimeMarkTile[] = [];
    for(let timeMark of timeMarks){
      let timeMarkTile: ITimeMarkTile = { timeMark: timeMark, style: this.defaultTimeMarkTileStyle, deleteButtonIsVisible: false };
      timeMarkTiles.push(timeMarkTile);
    }
    return timeMarkTiles;
  }



  


  /*
     TEMPLATE FUNCTIONS
  */

  onMouseEnterTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = true;
  }

  onMouseLeaveTimeMarkTile(timeMarkTile: ITimeMarkTile) {
    timeMarkTile.deleteButtonIsVisible = false;
  }

  onClickDeleteTimeMark(timeMark: TimeMark) {
    //to do:  when clicked, prompt for a confirmation:  "Delete this time mark?"
    this.timeLogService.deleteTimeMark(timeMark);
  }

  onClickAdjacentDate(direction: string) {

    this.onCloseForm();
    this.timeMarkTiles = null;
    this.ifLoadingTimeMarks = true;
    // console.log(this._currentDate.format('YYYY-MM-DD'))
    if(direction == "left"){
      let newDate = moment(this.currentDate).subtract(1,'days');
      // console.log("clicked left, changing to new date:", newDate.format('YYYY-MM-DD'))
      this.timeLogService.currentDate = newDate;
    }else if(direction == "right"){
      let newDate = moment(this.currentDate).add(1,'days');
      // console.log("clicked right, changing to new date:", newDate.format('YYYY-MM-DD'))
      this.timeLogService.currentDate = newDate;
    }


  }
  onDateChange(calendarDate) {
    // this._currentDate$.next(moment(calendarDate))
    this.timeLogService.currentDate = moment(calendarDate);
  }

  dateNotGreaterThanToday(dateYYYYMMDD: string): boolean {
    if (moment().format('YYYY-MM-DD') < moment(dateYYYYMMDD).format('YYYY-MM-DD')) {
      return false;
    } else {
      return true;
    }
  }

  dateRelevanceToTodayString(dateYYYYMMDD: string): string {
    //Used by the template to input any date and return a colloquialism relative to Today
    if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      return "Today";
    } else if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().add(1, 'days').format('YYYY-MM-DD')) {
      return "Tomorrow";
    } else if (moment(dateYYYYMMDD).format('YYYY-MM-DD') == moment().add(-1, 'days').format('YYYY-MM-DD')) {
      return "Yesterday";
    } else if (moment(dateYYYYMMDD).isBefore(moment().startOf('day'))) {
      let duration = moment.duration(moment().startOf('day').diff(dateYYYYMMDD));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days ago";
    } else if (moment(dateYYYYMMDD).isAfter(moment().endOf('day'))) {
      let duration = moment.duration(moment(dateYYYYMMDD).diff(moment().startOf('day')));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days from today";
    }
  }

  dayOfWeek(dateYYYYMMDD: string): string {
    return moment(dateYYYYMMDD).format('dddd');
  }
  dayOfMonth(dateYYYYMMDD: string): string {
    return moment(dateYYYYMMDD).format('MMM Do');
  }

  dateFormattedDateString(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('dddd, MMMM Do, gggg');
  }
  dateFormattedDateStringShort(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('MMMM Do, gggg');
  }

  dateIsToday(dateYYYYMMDD: string): boolean {
    //Used by template to check if provided date string is Today
    return (moment().format('YYYY-MM-DD') == dateYYYYMMDD);
  }

}
