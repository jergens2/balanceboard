import { Component, OnInit } from '@angular/core';
import { IYearDay } from './year-day.interface';

import * as moment from 'moment';

@Component({
  selector: 'app-activity-year-view',
  templateUrl: './activity-year-view.component.html',
  styleUrls: ['./activity-year-view.component.css']
})
export class ActivityYearViewComponent implements OnInit {

  constructor() { }

  yearDays: IYearDay[] = [];

  ngOnInit() {
    this.yearDays = this.buildYearDays();
  }

  buildYearDays(): IYearDay[] {


    let yearDays: IYearDay[] = [];

    let today = moment();
    let firstDate = moment(today).subtract(52,'weeks').day(0);
    let currentDay = moment(firstDate);
    
    let gridRow = 2;
    let gridCol = 2;
    while(currentDay.format('YYYY-MM-DD') <= today.format('YYYY-MM-DD')){

      let style = {"grid-row": ""+ gridRow + " / span 1", "grid-column":"" + gridCol + " / span 1"};
      let yearDay: IYearDay = { date: moment(currentDay) , style:style};
      yearDays.push(yearDay);
      gridRow++;
      if(currentDay.day() == 6){
        gridRow = 2;
        gridCol ++;
      }
      currentDay = moment(currentDay).add(1,'days');

    }

    return yearDays;
  }


  onClickYearDay(yearDay: IYearDay){
    console.log(yearDay.date.format('YYYY-MM-DD'))
  }

}
