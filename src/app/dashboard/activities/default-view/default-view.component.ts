import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../../daybook/time-log/timelog.service';
import { Subscription } from 'rxjs';
import { TimeSegment } from '../../daybook/time-log/time-segment.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { IActivityData } from './activity-data.interface';
import { TimeSegmentActivity } from '../../daybook/time-log/time-segment-activity.model';

@Component({
  selector: 'app-activities-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.css']
})
export class ActivitiesDefaultViewComponent implements OnInit {

  constructor(private timelogService: TimelogService) { }

  faSpinner = faSpinner;

  lastPeriod: any = null;
  daysOfWeek: any[] = [];


  @Output() newActivity: EventEmitter<boolean> = new EventEmitter();

  private timeSegmentSubscription: Subscription = new Subscription();
  private _timeSegments: TimeSegment[] = [];

  ngOnInit() {

    let periodLengthDays: number = 7;
    let periodStartDay: number = 0; // 0 == SUNDAY

    let periodStart: moment.Moment = moment().startOf("day").day(periodStartDay).subtract(periodLengthDays, "days");
    let periodEnd: moment.Moment = moment(periodStart).add(periodLengthDays, "days");

    this.timeSegmentSubscription = this.timelogService.fetchTimeSegmentsByRange$(periodStart, periodEnd).subscribe((timeSegments: TimeSegment[]) => {
      if (timeSegments.length > 0) {
        this._timeSegments = timeSegments;
        this.buildDaysOfRow(periodStart, periodEnd, timeSegments);
        this.buildLastPeriod(periodStart, periodEnd);
      } else {

      }

    });



  }

  private extractActivityData(startTime: moment.Moment, endTime: moment.Moment, timeSegments: TimeSegment[]): IActivityData {
    let activities: {
      name: string,
      durationMinutes: number
    }[] = [];

    console.log("    extracting data for: " + startTime.format('YYYY-MM-DD hh:mm a') + "  to  " + endTime.format('YYYY-MM-DD hh:mm a'));

    for (let timeSegment of timeSegments) {
      let durationMinutes: number = 0;
      if (moment(timeSegment.startTime).isBefore(startTime) && moment(timeSegment.endTime).isAfter(startTime)) {
        durationMinutes = moment(timeSegment.endTime).diff(startTime, "minutes");
      } else if (moment(timeSegment.startTime).isSameOrAfter(startTime) && moment(timeSegment.endTime).isSameOrBefore(endTime)) {
        durationMinutes = moment(timeSegment.endTime).diff(timeSegment.startTime, "minutes");
      } else if (moment(timeSegment.startTime).isBefore(endTime) && moment(timeSegment.endTime).isAfter(endTime)) {
        durationMinutes = moment(endTime).diff(moment(timeSegment.startTime), "minutes");
      }

      if (durationMinutes <= 0) {
        console.log("Duration minutes is " + durationMinutes);
      } else {
        if (timeSegment.activities.length > 0) {
          let alreadyExists: boolean = false;
          timeSegment.activities.forEach((tsActivity: TimeSegmentActivity) => {
            activities.forEach((activity: {
              name: string,
              durationMinutes: number
            }) => {

              if (activity.name == tsActivity.activity.name) {
                alreadyExists = true;
                activity.durationMinutes += (durationMinutes / timeSegment.activities.length);
              }

            });
            if (!alreadyExists) {
              activities.push({
                name: tsActivity.activity.name,
                durationMinutes: 0 + durationMinutes / timeSegment.activities.length
              });
            }
          });



        } else {
          console.log("timeSegment has no activities");
        }
      }
    }


    activities.sort((a1, a2) => {
      if (a1.durationMinutes > a2.durationMinutes) {
        return -1;
      } else if (a1.durationMinutes < a2.durationMinutes) {
        return 1;
      }
      return 0;
    });

    let total: number = 0;
    activities.forEach((activity)=>{ total += activity.durationMinutes});

    let totalMinutes: number = total;
    let totalHours: number = total/60;
    let hours: number = Math.floor(total/60); console.log("hours is ", hours);
    let minutes: number = totalMinutes - (hours*60);

    let activityData: IActivityData = {
      totalMinutes: totalMinutes,
      totalHours: totalHours,
      hours: hours,
      minutes: minutes,
      activities: activities
    }

    return activityData;
  }

  private buildDaysOfRow(periodStart: moment.Moment, periodEnd: moment.Moment, timeSegments: TimeSegment[]) {




    let daysOfWeek: any[] = [];


    let currentDay: moment.Moment = moment(periodStart).startOf("day");
    while (currentDay.isBefore(periodEnd)) {
      console.log("Current day is " + currentDay.format('YYYY-MM-DD hh:mm a'));




      console.log("start of current day is " + currentDay.startOf("day").format('YYYY-MM-DD hh:mm a'))

      let dayOfWeek = {
        date: currentDay.format('YYYY-MM-DD'),
        activityData: this.extractActivityData(moment(currentDay.startOf("day")), moment(currentDay.endOf("day")), timeSegments)

      }
      daysOfWeek.push(dayOfWeek);
      currentDay = moment(currentDay).add(1, "days").startOf("day");
    }


    console.log(this.extractActivityData(moment(periodStart), moment(periodEnd), timeSegments))

    this.daysOfWeek = daysOfWeek;
  }

  private buildLastPeriod(periodStart: moment.Moment, periodEnd: moment.Moment) {



    this.timeSegmentSubscription.unsubscribe();
    console.log("fetching by start time, end time: ", periodStart.format('YYYY-MM-DD hh:mm a'), periodEnd.format('YYYY-MM-DD hh:mm a'));
    // this.timeSegmentSubscription = this.timelogService.fetchTimeSegmentsByRange$(periodStart, periodEnd).subscribe((timeSegments: TimeSegment[])=>{
    //   this._timeSegments = timeSegments;

    //   let zum = 0; 
    //   this._timeSegments.forEach((timeSegment)=>{
    //     zum += moment(timeSegment.endTime).diff(moment(timeSegment.startTime), "hours");
    //   })

    //   console.log("zum is ", zum)

    //   /*
    //     note to self:

    //     find the gaps in the timesegments here.  determine where gaps in time might be to reconcile why 116 is the total and not 168 hours.
    //     if it was like 165 hours or something i would understand that it is probably the periods of time prior to bed time that are missed.


    //   */

    //   let day = moment(periodStart);
    //   let activities: {name:string, totalHours:number}[] = [];

    //   let currentTime: moment.Moment = moment(this._timeSegments[0].startTime);
    //   let accumulatedTime: number = 0;
    //   for(let timeSegment of this._timeSegments){

    //     if(day)
    //     if(moment(currentTime).isSame(moment(timeSegment.startTime))){
    //       console.log("current Time is the same as last timeSegment.endtime")
    //     }else{
    //       console.log(timeSegment.startTime.format('YYYY-MM-DD hh:mm a') + " to " + timeSegment.endTime.format('YYYY-MM-DD hh:mm a'))
    //     }

    //     accumulatedTime += moment(timeSegment.endTime).diff(moment(timeSegment.startTime), "hours");
    //     accumulatedTime

    //     currentTime = moment(timeSegment.endTime)

    //     if(timeSegment.activities.length > 0){
    //       let durationHours: number =  moment(timeSegment.endTime).diff(timeSegment.startTime, "hours")
    //       durationHours = durationHours / timeSegment.activities.length;

    //       for(let timeSegmentActivity of timeSegment.activities){



    //         let activityExists: boolean = false;
    //         for(let activity of activities){
    //           if(activity.name == timeSegmentActivity.activity.name){
    //             activityExists = true;
    //             activity.totalHours += durationHours;
    //           }
    //         }
    //         if(!activityExists){
    //           activities.push({name: timeSegmentActivity.activity.name, totalHours: durationHours});
    //         }


    //       }
    //     }else{
    //       console.log("timeSegment activites.length == 0.  This should be very unlikely or not happen at all ?")
    //     }
    //   }

    //   activities.sort((a1, a2)=>{
    //     if(a1.totalHours > a2.totalHours){
    //       return -1;
    //     }else if(a1.totalHours < a2.totalHours){
    //       return 1;
    //     }
    //     return 0;
    //   })

    //   let sum = 0;
    //   activities.forEach((activity)=>{
    //     sum+= activity.totalHours;
    //   })

    //   console.log("total sum is: ", sum);

    //   let lastPeriod: any = {
    //     periodStart: periodStart,
    //     periodEnd: periodEnd,
    //     activities: activities
    //   };

    //   console.log(lastPeriod);

    //   this.lastPeriod = lastPeriod;



    // });


  }



  onClickCreateNewActivity() {
    this.newActivity.emit();
  }







}
