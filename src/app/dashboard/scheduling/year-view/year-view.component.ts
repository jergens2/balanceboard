import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DaybookService } from '../../daybook/daybook.service';
import { Day } from '../../daybook/day/day.model';
import { ActivitiesService } from '../../activities/activities.service';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-year-view',
  templateUrl: './year-view.component.html',
  styleUrls: ['./year-view.component.css']
})
export class YearViewComponent implements OnInit {

  constructor(private daybookService: DaybookService, private activitiesService: ActivitiesService, private router:Router) { }

  currentYear: string = "2019";

  months: any[];

  allDays: Day[] = [];

  ngOnInit() {

    /*
      Simple method of improved performance:
      
      Instead of pulling the days asynchronously at this time with daybookService, pull them on login and store them in memory.

      as of this writing, it takes approximately 300ms to run buildData() which is fast enough.  
      The part that takes a long while is the async loading, which takes about 800ms


    */


    let currentMonth = moment().startOf("year");

    this.daybookService.getDaysInRange$(moment(currentMonth), moment(currentMonth).endOf("year")).subscribe((days: Day[]) => {

      this.allDays = days;
      this.buildData(this.allDays);

    });


  }



  private buildData(allDays: Day[]) {



    let months: any[] = [];
    let currentMonth = moment().startOf("year");

    for (let i = 0; i < 12; i++) {

      let currentDay: moment.Moment = moment(currentMonth).startOf("month");
      let endOfMonth: moment.Moment = moment(currentMonth).endOf("month");
      let days: any[] = [];

      let daysAfterStart: number = moment(currentDay).day();
      for(let i=0; i<daysAfterStart; i++){
        days.push({
          dayDate: "",
          dayObject: {},
          dayStyle: { "border":"none", "background-color":"none"}
        });
      }

      while (currentDay.isBefore(endOfMonth)) {

        let dayStyle: any = {};
        let dayObject = allDays.find((dayObject: Day) => {
          return dayObject.dateYYYYMMDD == currentDay.format('YYYY-MM-DD');
        })

        if(dayObject){

          dayStyle = this.buildDayStyle(dayObject);
        }else{

          dayStyle = { "border":"1px solid rgb(206, 206, 206)"};
        }
        days.push({
          dayDate: currentDay,
          dayObject: dayObject,
          dayStyle: dayStyle
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


  onClickDay(day: { dayDate: moment.Moment, dayObject: Day, dayStyle: any }){
    this.router.navigate(['daybook/'+day.dayDate.format('YYYY-MM-DD')]);
  }


  private buildDayStyle(dayObject: Day){
    let style: any = {};
    let activity:UserDefinedActivity; 
    if(dayObject.activityData){
      if(dayObject.activityData.length >= 1){
        activity = this.activitiesService.findActivityByTreeId(dayObject.activityData[1].activityTreeId);
        style = {
          "background-color":activity.color,
        }
      }
    }  
    return style;
  }

  dayData(day: { dayDate: moment.Moment, dayObject: Day, dayStyle: any }): string {

    if(day.dayObject){
      
      if(day.dayObject.activityData){
        let activity: UserDefinedActivity = this.activitiesService.findActivityByTreeId(day.dayObject.activityData[1].activityTreeId)
        
      }
      
    }else{
      console.log("No day object for ", day);
    }

    return "";
  }


}
