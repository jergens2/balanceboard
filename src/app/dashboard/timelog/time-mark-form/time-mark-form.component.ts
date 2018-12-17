import { Component, OnInit, Output, EventEmitter, Renderer2, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, fromEvent } from 'rxjs';

import * as moment from 'moment';
import { faCheckCircle, faCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';

import { CategorizedActivity } from '../activities/categorized-activity.model';
import { TimeMark } from '../time-mark.model';
import { TimelogService } from '../timelog.service';
import { TimeMarkActivity } from '../time-mark-activity.model';
import { ActivitiesService } from '../activities/activities.service';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';

export interface ITimeOption {
  icon: IconDefinition,
  iconClass: string,
  label: string,
  action: string
}

@Component({
  selector: 'app-time-mark-form',
  templateUrl: './time-mark-form.component.html',
  styleUrls: ['./time-mark-form.component.css']
})


export class TimeMarkFormComponent implements OnInit {



  constructor(private timeLogService: TimelogService, private activitiesService: ActivitiesService) { }

  private _durationString: string = '';

  // latestTimeMark: TimeMark;

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;


  faCog = faCog;
  faTimes = faTimes;


  startTimeOptions: ITimeOption[];
  endTimeOptions: ITimeOption[];

  // ifPreviousTimeMark: boolean = false;

  ifAddActivityForm: boolean = false;

  // startTimeAction: string;
  // endTimeAction: string;

  newCategorizedActivity: boolean = false;
  ifAddActivityButton: boolean = true;
  saveTimeMarkDisabled: string = '';

  timeMarkForm: FormGroup;

  latestTimeMark: TimeMark;
  calculatedStartTime: moment.Moment;

  timeMarkActivities: TimeMarkActivity[] = [];


  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
    this.timeMarkActivities = [];
    this.latestTimeMark = this.timeLogService.latestTimeMark;


    this.calculatedStartTime = this.calculateStartTime(this.latestTimeMark);
    console.log("Latest time mark on form:", this.latestTimeMark);
    console.log("the calculated time is", this.calculatedStartTime);
    
    // this.buildTimeOptions();
    // this.buildTimeInputs();
    this.buildTimeMarkForm();
    // this.updateDuration();
  }

  calculateStartTime(latestTimeMark: TimeMark): moment.Moment {
    if (this.latestTimeMark == null) {
      //no previous time mark exists
      // DO:  create time mark form as a new time mark, since there is no previous time mark

      // set the start time to the default start of day.
      if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
        return moment();
      } else {
        return moment(this.timeLogService.userDefinedStartTimeOfDay);
      }

    } else if (this.latestTimeMark != null) {
      if (moment(this.latestTimeMark.endTime).isBefore((moment().subtract(24, 'hours')))) {
        // previous time mark (end time) is more than 24 hours ago
        // DO:  create time mark form as a new time mark, as if there is no previous time mark.
        if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
          return moment();
        } else {
          return moment(this.timeLogService.userDefinedStartTimeOfDay);
        }

      } else {
        if (moment(this.latestTimeMark.endTime).isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
          /*   case:  last time mark was some time in the evening of yesterday, for example 7pm
                      and it is now 3pm the next day
  
                in this case, it means that either you've been sleeping since 7pm and now just waking up at 3pm the next day, but more realistically,
                this case is for when the user is not inputting all of their time, so they missed some time.
  
                DO:  create a new time mark where the start time is at the 'beginning' of the day, where 'beginning' is a defined time such as 8am or 7am. 
                      this app should have the user define their wake time and their bed time.
                      part of the strategy of the app should be for those kinds of people who do not follow a strict bed time but should, who do not follow a strict 
                      wake up time, but should.
  
                      the app can set defaults such as 7am to 10pm.  The number of hours of sleep required for a person changes as they age.
          */

          if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
            console.log("it is before the start of the day")
            if (moment().isAfter(moment(this.timeLogService.userDefinedStartTimeOfDay).subtract(2,'hours'))) {
              console.log("it is before the start of the day minus 2 hours")
              // it is possible that this block yields inaccurate time.  it is here in case, say a persons start time is 8am but they woke up early that day,
              // and did some stuff at 7am.  so a 2 hour window has been added here to try and catch this.
              return moment();
            }else{
              console.log("it is before the start of the day, but after midnight?");
              // in this case, it is some time in the morning like 3 or 4am
              return moment(this.latestTimeMark.endTime);
            }
          } else {
            return moment(this.timeLogService.userDefinedStartTimeOfDay);
          }

        } else {
          return moment(this.latestTimeMark.endTime);

        }
      }
    }

  }

  get durationString(): string {
    return this._durationString;
  }

  get timeNow(): string {
    return moment().format('HH:mm');
  }

  private buildTimeMarkForm() {

    this.timeMarkForm = new FormGroup({
      'startTime': new FormControl( this.calculatedStartTime.format('HH:mm'), Validators.required ),
      'startTimeDate': new FormControl( this.calculatedStartTime.format('YYYY-MM-DD'), Validators.required ),
      'endTime': new FormControl( moment().format('HH:mm').toString(), Validators.required),
      'endTimeDate': new FormControl( moment().format('YYYY-MM-DD'), Validators.required ),

      'description': new FormControl(),
    });
  }




  /*

    TEMPLATE FUNCTIONS
    
  */

  now(): moment.Moment{
    return moment();
  }

  ifSpecifyStartTime: boolean = false;
  onClickSpecifyStartTime(){
    this.ifSpecifyStartTime = !this.ifSpecifyStartTime;
  }
  ifSpecifyEndTime: boolean = false;
  onClickSpecifyEndTime(){
    this.ifSpecifyEndTime = !this.ifSpecifyEndTime;
  }










  onClickSaveTimeMark() {
    let startTime = moment(this.timeMarkForm.get('startTimeDate').value + ' ' + this.timeMarkForm.get('startTime').value).toISOString();
    let endTime = moment(this.timeMarkForm.get('endTimeDate').value + ' ' + this.timeMarkForm.get('endTime').value);
    console.log("endTime", endTime)

    let newTimeMark = new TimeMark(null, null, startTime, endTime.toISOString());
    newTimeMark.description = this.timeMarkForm.get('description').value;
    newTimeMark.activities = this.timeMarkActivities;
    if (this.latestTimeMark != null) {
      newTimeMark.precedingTimeMarkId = this.latestTimeMark.id;
    } else {
      newTimeMark.precedingTimeMarkId = "NO_PRECEDING_TIME_MARK";
    }

    newTimeMark.followingTimeMarkId = "NO_FOLLOWING_TIME_MARK";



    console.log("sending timemark to service to save, ", newTimeMark);
    this.timeLogService.saveTimeMark(newTimeMark);
    this.timeMarkForm.reset();

    this.buildTimeMarkForm();

    this.closeForm.emit(true);
  }


  onClickCancelTimeMark() {
    this.closeForm.emit(true);
  }


  onClickAddActivity() {
    this.ifAddActivityForm = true;
    this.ifAddActivityButton = false;
    this.saveTimeMarkDisabled = 'disabled';
  }

  onActivitySaved(activity: TimeMarkActivity) {
    this.timeMarkActivities.push(activity);
    this.onCloseActivityForm(null);
  }

  onCloseActivityForm($event) {
    this.ifAddActivityForm = false;
    this.ifAddActivityButton = true;
    this.saveTimeMarkDisabled = '';
  }

  onClickUpdateTimeMarkActivity(activity: TimeMarkActivity) {

  }

  onClickDeleteTimeMarkActivity(activity: TimeMarkActivity) {
    this.timeMarkActivities.splice(this.timeMarkActivities.indexOf(activity), 1);
  }


}
