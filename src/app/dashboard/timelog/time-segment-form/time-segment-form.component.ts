import { Component, OnInit, Output, EventEmitter, Renderer2, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, fromEvent } from 'rxjs';

import * as moment from 'moment';
import { faCheckCircle, faCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';

import { TimeSegment } from '../time-segment.model';
import { TimelogService } from '../timelog.service';
import { TimeSegmentActivity } from '../time-segment-activity.model';
import { ActivitiesService } from '../../activities/activities.service';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ITimeSegmentTile } from '../timelog-list/time-segment-tile.interface';


@Component({
  selector: 'app-time-segment-form',
  templateUrl: './time-segment-form.component.html',
  styleUrls: ['./time-segment-form.component.css']
})


export class TimeSegmentFormComponent implements OnInit {



  constructor(private timeLogService: TimelogService, private activitiesService: ActivitiesService) { }

  private _durationString: string = '';

  // latestTimeSegment: TimeSegment;

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;


  faCog = faCog;
  faTimes = faTimes;



  // ifPreviousTimeSegment: boolean = false;

  ifAddActivityForm: boolean = false;

  // startTimeAction: string;
  // endTimeAction: string;

  newCategorizedActivity: boolean = false;
  ifAddActivityButton: boolean = true;
  saveTimeSegmentDisabled: string = '';

  timeSegmentForm: FormGroup;

  latestTimeSegment: TimeSegment;
  calculatedStartTime: moment.Moment;

  timeSegmentActivities: TimeSegmentActivity[] = [];


  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() updatedTimeSegment: ITimeSegmentTile;
  @Input() updateTimeSegment: ITimeSegmentTile;

  ngOnInit() {
    this.timeSegmentActivities = [];
    if(this.updateTimeSegment){
      for(let activity of this.updateTimeSegment.timeSegment.activities){
        let newActivity = new TimeSegmentActivity(activity.activity, activity.duration, activity.description);
        // console.log("activity that was in the time segment, to be updated:", newActivity);
        this.timeSegmentActivities.push(newActivity);
      }
    }
    this.latestTimeSegment = this.timeLogService.latestTimeSegment;


    this.calculatedStartTime = this.calculateStartTime(this.latestTimeSegment);

    // this.buildTimeOptions();
    // this.buildTimeInputs();
    this.buildTimeSegmentForm();
    // this.updateDuration();
  }

  calculateStartTime(latestTimeSegment: TimeSegment): moment.Moment {
    if (this.latestTimeSegment == null) {
      //no previous time segment exists
      // DO:  create time segment form as a new time segment, since there is no previous time segment

      // set the start time to the default start of day.
      if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
        return moment();
      } else {
        return moment(this.timeLogService.userDefinedStartTimeOfDay);
      }

    } else if (this.latestTimeSegment != null) {
      if (moment(this.latestTimeSegment.endTime).isBefore((moment().subtract(24, 'hours')))) {
        // previous time segment (end time) is more than 24 hours ago
        // DO:  create time segment form as a new time segment, as if there is no previous time segment.
        if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
          return moment();
        } else {
          return moment(this.timeLogService.userDefinedStartTimeOfDay);
        }

      } else {
        if (moment(this.latestTimeSegment.endTime).isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
          /*   case:  last time segment was some time in the evening of yesterday, for example 7pm
                      and it is now 3pm the next day
  
                in this case, it means that either you've been sleeping since 7pm and now just waking up at 3pm the next day, but more realistically,
                this case is for when the user is not inputting all of their time, so they missed some time.
  
                DO:  create a new time segment where the start time is at the 'beginning' of the day, where 'beginning' is a defined time such as 8am or 7am. 
                      this app should have the user define their wake time and their bed time.
                      part of the strategy of the app should be for those kinds of people who do not follow a strict bed time but should, who do not follow a strict 
                      wake up time, but should.
  
                      the app can set defaults such as 7am to 10pm.  The number of hours of sleep required for a person changes as they age.
          */

          if (moment().isBefore(moment(this.timeLogService.userDefinedStartTimeOfDay))) {
            // console.log("it is before the start of the day")
            if (moment().isAfter(moment(this.timeLogService.userDefinedStartTimeOfDay).subtract(2, 'hours'))) {
              // console.log("it is before the start of the day minus 2 hours")
              // it is possible that this block yields inaccurate time.  it is here in case, say a persons start time is 8am but they woke up early that day,
              // and did some stuff at 7am.  so a 2 hour window has been added here to try and catch this.
              return moment();
            } else {
              // console.log("it is before the start of the day, but after midnight?");
              // in this case, it is some time in the morning like 3 or 4am
              return moment(this.latestTimeSegment.endTime);
            }
          } else {
            return moment(this.timeLogService.userDefinedStartTimeOfDay);
          }

        } else {
          return moment(this.latestTimeSegment.endTime);

        }
      }
    }

  }

  get durationString(): string {
    return this._durationString;
  }


  private buildTimeSegmentForm() {
    if (this.updateTimeSegment) {
      // console.log("Building update form.  ", this.updateTimeSegment)
      // console.log(this.updateTimeSegment.timeSegment.startTime);
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(moment(this.updateTimeSegment.timeSegment.startTime).format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.startTime).format('YYYY-MM-DD'), Validators.required),
        'endTime': new FormControl(moment(this.updateTimeSegment.timeSegment.endTime).format('HH:mm').toString(), Validators.required),
        'endTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.endTime).format('YYYY-MM-DD'), Validators.required),

        'description': new FormControl(this.updateTimeSegment.timeSegment.description),
      });
    } else {
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(this.calculatedStartTime.format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(this.calculatedStartTime.format('YYYY-MM-DD'), Validators.required),
        'endTime': new FormControl(moment().format('HH:mm').toString(), Validators.required),
        'endTimeDate': new FormControl(moment().format('YYYY-MM-DD'), Validators.required),

        'description': new FormControl(),
      });
    }

  }




  /*

    TEMPLATE FUNCTIONS
    
  */

  get action(): string {
    if (this.updateTimeSegment) {
      return "Update";
    } else {
      return "New";
    }
  }

  now(): moment.Moment {
    return moment();
  }

  get udateTimeSegmentEndTime(): string { 
    return moment(this.updateTimeSegment.timeSegment.endTime).format('hh:mm a')
  }

  get udateTimeSegmentStartTime(): string { 
    return moment(this.updateTimeSegment.timeSegment.startTime).format('hh:mm a')
  }

  ifSpecifyStartTime: boolean = false;
  onClickSpecifyStartTime() {
    this.ifSpecifyStartTime = !this.ifSpecifyStartTime;
  }
  ifSpecifyEndTime: boolean = false;
  onClickSpecifyEndTime() {
    this.ifSpecifyEndTime = !this.ifSpecifyEndTime;
  }










  onClickSaveTimeSegment() {
    let startTime = moment(this.timeSegmentForm.get('startTimeDate').value + ' ' + this.timeSegmentForm.get('startTime').value).toISOString();
    let endTime = moment(this.timeSegmentForm.get('endTimeDate').value + ' ' + this.timeSegmentForm.get('endTime').value);

    let newTimeSegment: TimeSegment;
    if (this.updateTimeSegment) {
      newTimeSegment = new TimeSegment(this.updateTimeSegment.timeSegment.id, this.updateTimeSegment.timeSegment.userId, startTime, endTime.toISOString());
      newTimeSegment.description = this.timeSegmentForm.get('description').value;
      for(let activity of this.timeSegmentActivities){
        // console.log("pushing activity", activity);
        newTimeSegment.activities.push(activity)
      }
      // newTimeSegment.activities = this.timeSegmentActivities;
      // this.updateTimeSegment.timeSegment = Object.assign({}, newTimeSegment);
      // console.log("updating time segment", newTimeSegment);
      this.timeLogService.updateTimeSegment(newTimeSegment);
    } else {
      newTimeSegment = new TimeSegment(null, null, startTime, endTime.toISOString());
      newTimeSegment.description = this.timeSegmentForm.get('description').value;
      newTimeSegment.activities = this.timeSegmentActivities;

      
      this.timeLogService.saveTimeSegment(newTimeSegment);
      // this.timeSegmentForm.reset();

      // this.buildTimeSegmentForm();

    }
    this.closeForm.emit(true);
  }


  onClickCancelTimeSegment() {
    this.closeForm.emit(true);
  }


  onClickAddActivity() {
    this.ifAddActivityForm = true;
    this.ifAddActivityButton = false;
    this.saveTimeSegmentDisabled = 'disabled';
  }

  onActivitySaved(activity: TimeSegmentActivity) {
    // console.log("saving activity", activity);
    this.timeSegmentActivities.push(activity);

    // console.log(this.timeSegmentActivities);
    this.onCloseActivityForm(null);
  }

  onCloseActivityForm($event) {
    this.ifAddActivityForm = false;
    this.ifAddActivityButton = true;
    this.saveTimeSegmentDisabled = '';
  }

  onClickUpdateTimeSegmentActivity(activity: TimeSegmentActivity) {
    // console.log("updating activity", activity);
  }

  onClickDeleteTimeSegmentActivity(activity: TimeSegmentActivity) {
    this.timeSegmentActivities.splice(this.timeSegmentActivities.indexOf(activity), 1);
  }


}
