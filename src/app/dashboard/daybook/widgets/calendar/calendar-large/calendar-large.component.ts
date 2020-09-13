import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../daybook-day-item/daybook-day-item.class';
import * as moment from 'moment';
import { DaybookDisplayService } from '../../../daybook-display.service';

@Component({
  selector: 'app-calendar-large',
  templateUrl: './calendar-large.component.html',
  styleUrls: ['./calendar-large.component.css']
})
export class CalendarLargeComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }


  ngOnInit() {

    let day: moment.Moment = moment(this.daybookService.daybookController.dateYYYYMMDD).startOf("year");
    let months = [];
    for(let i=0; i< 12; i++){
      months.push(moment(day));
      day = moment(day).add(1, "month");
    }

    this.months = months;

    // this.daybookService.activeDayController$.subscribe((activeDay)=>{
    //   let day: moment.Moment = moment(activeDay.dateYYYYMMDD).startOf("year");
    //   let months: {firstDate: moment.Moment, season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN"}[] = [];
    //   for(let i=0; i< 12; i++){
    //     let season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
    //     if(i == 0 || i == 1 || i == 11){
    //       season = "WINTER";
    //     }else if(i == 2 || i == 3 || i == 4){
    //       season = "SPRING";
    //     }else if(i == 5 || i == 6 || i == 7){
    //       season = "SUMMER";
    //     }else if(i == 8 || i == 9 || i == 10){
    //       season = "AUTUMN";
    //     }
    //     months.push({firstDate: moment(day), season: season});
    //     day = moment(day).add(1, "month");
    //   }
    //   this.months = months;
    // });
  }

  public months: {firstDate: moment.Moment, season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN"}[] = [];

}
