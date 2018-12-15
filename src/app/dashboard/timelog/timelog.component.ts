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

  addTimeMarkForm: boolean = false;
  private _currentDate: moment.Moment;



  ngOnInit() {
    this._currentDate = this.timeLogService.currentDate;

    this.timeLogService.currentDate$.subscribe((changedDate: moment.Moment)=>{
      this._currentDate = moment(changedDate);
      if(moment(this._currentDate).dayOfYear() != moment().dayOfYear()){
        this.onCloseForm();
      }
    })



    //todo:  need to add a subscription that checks for updates on a frequeent basis e.g. every several seconds
    // this.timeLogService.onTimeLogComponentInit(moment(this.currentDate));
  }
  ngOnDestroy() {

  }



  get currentDate(): moment.Moment{
    return this._currentDate;
  }



  onClickNewTimeMark() {
    this.addTimeMarkForm = true;
  }
  onCloseForm() {
    this.addTimeMarkForm = false;
  }

  



  


  /*
     TEMPLATE FUNCTIONS
  */

  
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

  // dayOfWeek(dateYYYYMMDD: string): string {
  //   return moment(dateYYYYMMDD).format('dddd');
  // }
  // dayOfMonth(dateYYYYMMDD: string): string {
  //   return moment(dateYYYYMMDD).format('MMM Do');
  // }

  dateFormattedDateString(dateYYYYMMDD: string): string {
    //Used by template to input any date and receive back a formatted date string 
    return moment(dateYYYYMMDD).format('dddd, MMMM Do, gggg');
  }

}
