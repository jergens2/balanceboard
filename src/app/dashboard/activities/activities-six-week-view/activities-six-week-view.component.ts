import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from '../activities.service';
import { TimelogService } from '../../daybook/time-log/timelog.service';
import * as moment from 'moment';
import { TimeSegment } from '../../daybook/time-log/time-segment-tile/time-segment.model';
import { TimeSegmentActivity } from '../../daybook/time-log/time-segment-activity.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserDefinedActivity } from '../user-defined-activity.model';
import { DaybookService } from '../../daybook/daybook.service';
import { Day } from '../../daybook/day/day.model';

@Component({
  selector: 'app-activities-six-week-view',
  templateUrl: './activities-six-week-view.component.html',
  styleUrls: ['./activities-six-week-view.component.css']
})
export class ActivitiesSixWeekViewComponent implements OnInit {

  faSpinner = faSpinner;
  loading: boolean = true;

  constructor(private activitiesService: ActivitiesService, private timelogService: TimelogService, private daybookService: DaybookService) { }

  daysOfSixWeeks: Day[] = [];

  ngOnInit() {


    

    let startDate: moment.Moment = moment().startOf('week').subtract(5, 'weeks');
    let endDate: moment.Moment = moment().endOf('week');

    console.log("start date is:", startDate);
    console.log("end date is :", endDate);


    this.daybookService.getDaysInRange$(startDate, endDate).subscribe((days: Day[])=>{
      console.log("Range data is ", days);  
      days.forEach((day)=>{
        console.log(day.date.format('YYYY-MM-DD'))
      })

      this.daysOfSixWeeks = days;
      this.loading = false;

    })



  }

  public topActivity(day: Day): string {
    if (day.activityData != null) {
      if(day.activityData.length > 0){
        if(day.activityData.length > 1){
          return this.activitiesService.findActivityByTreeId(day.activityData[1].activityTreeId).name
        }
      }else{
        return this.activitiesService.findActivityByTreeId(day.activityData[0].activityTreeId).name
      }
    } else {
      return "";
    }

  }

  public dayStyle(day: Day): any {
    if (day.activityData != null) {
      if(day.activityData.length > 0){
        if(day.activityData.length > 1){
          let color = this.activitiesService.findActivityByTreeId(day.activityData[1].activityTreeId).color
          return {
            "background-color": this.transparentColor(color, 0.1),
            "border": "2px solid " + this.transparentColor(color, 1.0),
          }
        }
      }else{
        let color = this.activitiesService.findActivityByTreeId(day.activityData[0].activityTreeId).color
        return {
          "background-color": this.transparentColor(color, 0.1),
          "border": "2px solid " + this.transparentColor(color, 1.0),
        }
      }
    } else {
      return "";
    }
  }

  private transparentColor(color: string, alpha: number): string {
    function hexToRGB(hex: string, alpha: number) {
      var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

      if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
      } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
      }
    }

    let returnColor: string = "";
    try{
      returnColor = hexToRGB(color, alpha);
      return returnColor;
    }catch{
      return "white";
    }

  }

  private getActivityDayData(thisDaysActivities: any[], currentDate: moment.Moment, timeSegment: TimeSegment): any[] {

    let totalDuration: number = 0;
    if (timeSegment.endTime.isAfter(currentDate.endOf("day"))) {
      totalDuration = moment(currentDate.endOf("day")).diff(timeSegment.startTime, "minutes");
    } else if (timeSegment.startTime.isBefore(currentDate.startOf("day"))) {
      totalDuration = moment(timeSegment.endTime).diff(currentDate.startOf("day"), "minutes");
    } else {
      totalDuration = timeSegment.endTime.diff(timeSegment.startTime, "minutes");
    }

    let totalDurationPerActivity: number = totalDuration / timeSegment.activities.length;

    timeSegment.activities.forEach((timeSegmentActivity: TimeSegmentActivity) => {

      let activityInArray: boolean = false;

      thisDaysActivities.forEach((a: any) => {
        if (a.activity == timeSegmentActivity.activity) {
          activityInArray = true;
          a.duration = a.duration + totalDurationPerActivity;
        }
      });
      if (!activityInArray) {
        thisDaysActivities.push({
          activity: timeSegmentActivity.activity,
          duration: totalDurationPerActivity
        })
      }

    });

    return thisDaysActivities;
  }

}
