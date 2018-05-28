import { Injectable } from '@angular/core';

@Injectable()
export class TimeService {

  constructor() { }

  now = new Date();

  now_yyyymmdd(){
    return this.static_yyyymmdd(this.now);
  } 

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

  static_yyyymmdd(date: Date): string{
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
  
    return [date.getFullYear(),
      '-' + (mm>9 ? '' : '0') + mm,
      '-' + (dd>9 ? '' : '0') + dd
           ].join('');
  }

}
