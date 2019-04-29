import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from '../activities.service';
import { TimelogService } from '../../daybook/time-log/timelog.service';
import * as moment from 'moment';
import { TimeSegment } from '../../daybook/time-log/time-segment-tile/time-segment.model';
import { TimeSegmentActivity } from '../../daybook/time-log/time-segment-activity.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserDefinedActivity } from '../user-defined-activity.model';

@Component({
  selector: 'app-activities-six-week-view',
  templateUrl: './activities-six-week-view.component.html',
  styleUrls: ['./activities-six-week-view.component.css']
})
export class ActivitiesSixWeekViewComponent implements OnInit {

  faSpinner = faSpinner;
  loading: boolean = true;

  constructor(private activitiesService: ActivitiesService, private timelogService: TimelogService) { }

  days: any[] = [];

  ngOnInit() {

    let startDate: moment.Moment = moment().startOf('week').subtract(5, 'weeks');
    let endDate: moment.Moment = moment().endOf('week');

    this.timelogService.fetchTimeSegmentsByRange$(startDate, endDate).subscribe((timeSegments: TimeSegment[]) => {
      let currentDate: moment.Moment = moment(startDate);


      let days: any[] = [];

      while (currentDate.isBefore(endDate)) {
        let startOfDay: moment.Moment = moment(currentDate).startOf("day");
        let endOfDay: moment.Moment = moment(currentDate).endOf("day");

        let thisDaysActivities: any[] = [];

        for (let timeSegment of timeSegments) {
          if ((timeSegment.startTime.isSameOrAfter(startOfDay) && timeSegment.startTime.isSameOrBefore(endOfDay)) || (timeSegment.endTime.isSameOrAfter(startOfDay) && timeSegment.endTime.isSameOrBefore(endOfDay))) {

            thisDaysActivities = this.getActivityDayData(thisDaysActivities, currentDate, timeSegment);


          }
        }

        thisDaysActivities.sort((a1, a2) => {
          if (a1.duration > a2.duration) {
            return -1;
          }
          if (a1.duration < a2.duration) {
            return 1;
          }
          return 0;
        })

        thisDaysActivities = thisDaysActivities.filter((activity: any) => {
          console.log("Warning: This is incomplete.");
          if (activity.activity != this.activitiesService.findActivityByTreeId("5b9c362dd71b00180a7cf701_default_sleep")) {
            return activity;
          }
        })


        let topActivity: UserDefinedActivity = null;
        if (thisDaysActivities.length > 0) {
          topActivity = thisDaysActivities[0].activity;
        }

        let day: any = {
          date: currentDate,
          topActivity: topActivity,
        }

        days.push(day);
        currentDate = moment(currentDate).add(1, 'days');
      }

      this.loading = false;
      this.days = days;
    })

  }

  public activityName(day: any): string {
    if (day.topActivity != null) {
      let activity: UserDefinedActivity = day.topActivity as UserDefinedActivity;
      return activity.name;
    } else {
      return "";
    }

  }

  public dayStyle(day: any): any {
    // console.log("dayStyle: ", day)
    if (day.topActivity != null) {
      let color: string = (day.topActivity as UserDefinedActivity).color;
      // console.log("color is ", this.transparentColor(color));
      return {
        "background-color": this.transparentColor(color, 0.1),
        "border": "1px solid " + this.transparentColor(color, 0.5),
      }
    } else {
      return {};
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
