import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { TimelogService } from '../../daybook/time-log/timelog.service';
import { Subscription } from 'rxjs';
import { TimelogEntry } from '../../daybook/time-log/timelog-entry-tile/timelog-entry.model';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { IActivityData } from './activity-data.interface';
import { TimelogEntryActivity } from '../../daybook/time-log/timelog-entry-activity.model';
import { UserDefinedActivity } from '../user-defined-activity.model';

@Component({
  selector: 'app-activities-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.css']
})
export class ActivitiesDefaultViewComponent implements OnInit {

  constructor(private timelogService: TimelogService) { }

  faSpinner = faSpinner;


  daysOfWeek: any[] = null;
  lastPeriod: IActivityData = null;


  @Output() newActivity: EventEmitter<boolean> = new EventEmitter();

  private timelogEntrySubscription: Subscription = new Subscription();
  private _timelogEntrys: TimelogEntry[] = [];

  ngOnInit() {

    let periodLengthDays: number = 7;
    let periodStartDay: number = 0; // 0 == SUNDAY

    let periodStart: moment.Moment = moment().startOf("day").day(periodStartDay).subtract(periodLengthDays, "days");
    let periodEnd: moment.Moment = moment(periodStart).add(periodLengthDays, "days");

    this.timelogEntrySubscription = this.timelogService.fetchTimelogEntrysByRange$(periodStart, periodEnd).subscribe((timelogEntrys: TimelogEntry[]) => {
      if (timelogEntrys.length > 0) {
        this._timelogEntrys = timelogEntrys;
        this.buildDaysOfRow(periodStart, periodEnd, timelogEntrys);
        this.buildLastPeriod(periodStart, periodEnd, timelogEntrys);
      } else {

      }

    });



  }

  private extractActivityData(startTime: moment.Moment, endTime: moment.Moment, timelogEntrys: TimelogEntry[]): IActivityData {
    let activities: {
      activity: UserDefinedActivity,
      durationMinutes: number
    }[] = [];

    // console.log("    extracting data for: " + startTime.format('YYYY-MM-DD hh:mm a') + "  to  " + endTime.format('YYYY-MM-DD hh:mm a'));

    for (let timelogEntry of timelogEntrys) {
      let durationMinutes: number = 0;
      if (moment(timelogEntry.startTime).isBefore(startTime) && moment(timelogEntry.endTime).isAfter(startTime)) {
        durationMinutes = moment(timelogEntry.endTime).diff(startTime, "minutes");
      } else if (moment(timelogEntry.startTime).isSameOrAfter(startTime) && moment(timelogEntry.endTime).isSameOrBefore(endTime)) {
        durationMinutes = moment(timelogEntry.endTime).diff(timelogEntry.startTime, "minutes");
      } else if (moment(timelogEntry.startTime).isBefore(endTime) && moment(timelogEntry.endTime).isAfter(endTime)) {
        durationMinutes = moment(endTime).diff(moment(timelogEntry.startTime), "minutes");
      }

      if (durationMinutes <= 0) {
        // console.log("Duration minutes is " + durationMinutes);
      } else {
        if (timelogEntry.activities.length > 0) {
          let alreadyExists: boolean = false;
          timelogEntry.activities.forEach((tsActivity: TimelogEntryActivity) => {
            activities.forEach((activity: {
              activity: UserDefinedActivity,
              durationMinutes: number
            }) => {

              if (activity.activity.treeId  == tsActivity.activity.treeId) {
                alreadyExists = true;
                activity.durationMinutes += (durationMinutes / timelogEntry.activities.length);
              }

            });
            if (!alreadyExists) {
              activities.push({
                activity: tsActivity.activity,
                durationMinutes: 0 + durationMinutes / timelogEntry.activities.length
              });
            }
          });



        } else {
          // console.log("timelogEntry has no activities");
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
      startTime: moment(startTime),
      endTime: moment(endTime),
      totalMinutes: totalMinutes,
      totalHours: totalHours,
      hours: hours,
      minutes: minutes,
      activities: activities
    }

    return activityData;
  }

  private buildDaysOfRow(periodStart: moment.Moment, periodEnd: moment.Moment, timelogEntrys: TimelogEntry[]) {




    let daysOfWeek: any[] = [];


    let currentDay: moment.Moment = moment(periodStart).startOf("day");
    while (currentDay.isBefore(periodEnd)) {
      // console.log("Current day is " + currentDay.format('YYYY-MM-DD hh:mm a'));




      // console.log("start of current day is " + currentDay.startOf("day").format('YYYY-MM-DD hh:mm a'))

      let dayOfWeek = {
        date: currentDay.format('YYYY-MM-DD'),
        activityData: this.extractActivityData(moment(currentDay.startOf("day")), moment(currentDay.endOf("day")), timelogEntrys)

      }
      daysOfWeek.push(dayOfWeek);
      currentDay = moment(currentDay).add(1, "days").startOf("day");
    }


    // console.log(this.extractActivityData(moment(periodStart), moment(periodEnd), timelogEntrys))

    this.daysOfWeek = daysOfWeek;
  }

  private buildLastPeriod(periodStart: moment.Moment, periodEnd: moment.Moment, timelogEntrys: TimelogEntry[]) {

    let activityData: IActivityData = this.extractActivityData(periodStart, periodEnd, timelogEntrys);
    this.lastPeriod = activityData;
  }



  onClickCreateNewActivity() {
    this.newActivity.emit();
  }







}
