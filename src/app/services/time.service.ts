import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class TimeService {

  constructor() {}

  now: Date = new Date();
  activeDate: moment.Moment = moment(this.now);

  getDate(): Date{
    return this.now;
  }
  getMonthString(){
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
    return months[this.now.getMonth()];
  }

  setActiveDate(date: Date){
    //this.activeDate = date;
  }

  getActiveDate(): moment.Moment{
    return this.activeDate;
  }




}
