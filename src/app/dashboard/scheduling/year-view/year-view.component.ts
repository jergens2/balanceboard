import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-year-view',
  templateUrl: './year-view.component.html',
  styleUrls: ['./year-view.component.css']
})
export class YearViewComponent implements OnInit {

  constructor() { }

  currentYear: string = "2019";

  months: any[];

  ngOnInit() {

    let months: any[] = [];
    let currentMonth = moment().startOf("year");
    for(let i=0; i<12; i++){

      let currentDay: moment.Moment = moment(currentMonth).startOf("month");
      let endOfMonth: moment.Moment = moment(currentMonth).endOf("month");
      let days: any[] = [];
      while(currentDay.isBefore(endOfMonth)){
        
        currentDay = moment(currentDay).add(1,"days");
      }


      months.push({
        month:currentMonth
      })
      currentMonth = moment(currentMonth).add(1,"month");
    }

    this.months = months;
  }




}
