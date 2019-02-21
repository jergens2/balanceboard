import { Component, OnInit } from '@angular/core';
import { IMonthOfYear } from './month-of-year/month-of-year.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-year-planner',
  templateUrl: './year-planner.component.html',
  styleUrls: ['./year-planner.component.css']
})
export class YearPlannerComponent implements OnInit {

  constructor() { }

  months: IMonthOfYear[] = [];

  ngOnInit() {
    this.months = this.buildMonths();
  }

  buildMonths(): IMonthOfYear[]{

    let currentMonthDate: moment.Moment = moment().startOf('year');

    let months: IMonthOfYear[] = [];
    for(let monthCount=0; monthCount < 12; monthCount ++){
      let month: IMonthOfYear = { date:currentMonthDate };
      months.push(month);
      currentMonthDate = moment(currentMonthDate).add(1, 'month');
    }

    return months;

  }


}
