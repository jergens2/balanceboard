import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { faTimes, faCog, faSpinner } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';



@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})

export class TimelogComponent implements OnInit, OnDestroy {


  constructor(private timeLogService: TimelogService) { }

  faTimes = faTimes;
  faCog = faCog;
  faSpinner = faSpinner;

  private _currentDate: moment.Moment;



  ngOnInit() {
    this._currentDate = this.timeLogService.currentDate;

    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment)=>{
      this._currentDate = moment(changedDate);
    })



    //todo:  need to add a subscription that checks for updates on a frequeent basis e.g. every several seconds
    // this.timeLogService.onTimeLogComponentInit(moment(this.currentDate));
  }
  ngOnDestroy() {

  }



  get currentDate(): moment.Moment{
    return this._currentDate;
  }



  



  


  /*
     TEMPLATE FUNCTIONS
  */

  
  onDateChange(calendarDate) {
    // this._currentDate$.next(moment(calendarDate))
    this.timeLogService.currentDate = moment(calendarDate);
  }


  dateRelevanceToTodayString(date: moment.Moment): string {
    //Used by the template to input any date and return a colloquialism relative to Today
    if (moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      return "Today";
    } else if (moment(date).format('YYYY-MM-DD') == moment().add(1, 'days').format('YYYY-MM-DD')) {
      return "Tomorrow";
    } else if (moment(date).format('YYYY-MM-DD') == moment().add(-1, 'days').format('YYYY-MM-DD')) {
      return "Yesterday";
    } else if (moment(date).isBefore(moment().startOf('day'))) {
      let duration = moment.duration(moment().startOf('day').diff(date));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days ago";
    } else if (moment(date).isAfter(moment().endOf('day'))) {
      let duration = moment.duration(moment(date).diff(moment().startOf('day')));
      let days = duration.asDays().toFixed(0);
      return "" + days + " days from today";
    }
  }

  // dayOfWeek(dateYYYYMMDD: string): string {
  //   return moment(dateYYYYMMDD).format('dddd');
  // }
  // dayOfMonth(dateYYYYMMDD: string): string {
  //   return moment(dateYYYYMMDD).format('MMM Do');
  // }

  dateFormattedDateString(date: moment.Moment): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(date).format('dddd, MMMM Do, gggg');
  }

}
