import { Component, OnInit, Output, EventEmitter, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, fromEvent } from 'rxjs';

import * as moment from 'moment';
import { faCheckCircle, faCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons'; 

import { CategorizedActivity } from '../categorized-activity.model';
import { TimeMark } from '../time-mark.model';
import { TimelogService } from '../timelog.service';

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



  constructor(private timeLogService: TimelogService, private renderer: Renderer2) { }

  private _durationString: string = '';
  private _latestTimeMark: TimeMark;

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  startTimeOptions: ITimeOption[];
  endTimeOptions: ITimeOption[];

  ifPreviousTimeMark: boolean = false;

  ifAddActivityForm: boolean = false;

  startTimeAction: string;
  endTimeAction: string;

  newCategorizedActivity: boolean = false;
  ifAddActivityButton: boolean = true;
  saveTimeMarkDisabled: string = '';

  timeMarkForm: FormGroup;


  
  timeMarkActivities: CategorizedActivity[] = [];

  
  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();


  ngOnInit() {
    this.timeMarkActivities = [];
    this._latestTimeMark = this.timeLogService.latestTimeMark;
    if(this._latestTimeMark != null){
      if(this._latestTimeMark.endTimeISO != null){
        this.ifPreviousTimeMark = true;
      }else{
        this.ifPreviousTimeMark = false;
      }
    }else{
      this.ifPreviousTimeMark = false;
    }
    this.buildTimeOptions();
    this.buildTimeInputs();
    this.setDurationString(this._latestTimeMark.time);
    this.buildTimeMarkForm();
    
  }

  private buildTimeOptions(){
    let options: ITimeOption[] = [];
    if(this.ifPreviousTimeMark){
      this.startTimeAction = "DISPLAY_PREVIOUS";
      options.push({
        "icon":faCheckCircle,
        "iconClass":"color-green",
        "label":"End of previous time mark",
        "action":"SINCE_PREVIOUS",
      });
      options.push({
        "icon":faCircle,
        "iconClass":"",
        "label":"Specify",
        "action":"SPECIFY"
      });
    }else{
      this.startTimeAction = "SPECIFY_TIME";
      options.push({
        "icon":faCheckCircle,
        "iconClass":"color-green",
        "label":"Specify start time",
        "action":"SPECIFY_NO_PREVIOUS"
      });
      options.push({
        "icon":faCircle,
        "iconClass":"",
        "label":"Specify duration (how long ago)",
        "action":"SPECIFY_DURATION"
      });
    }
    this.startTimeOptions = options;
    options = [];

    options.push({
      "icon":faCheckCircle,
      "iconClass":"color-green",
      "label":"Now",
      "action":"NOW"
    });
    options.push({
      "icon":faCircle,
      "iconClass":"",
      "label":"Specify time",
      "action":"SPECIFY_TIME"
    });
    options.push({
      "icon":faCircle,
      "iconClass":"",
      "label":"Specify duration (how long it took)",
      "action":"SPECIFY_DURATION"
    });
    this.endTimeOptions = options;
    this.endTimeAction = "NOW";
  }
  private buildTimeInputs(){

  }

  private setDurationString(previousTime: moment.Moment){
    let duration = moment.duration(moment().diff(previousTime));
    let durationString = '';
    if(duration.days() > 0){
      duration.days() == 1 ? durationString += "1 day " : durationString += (duration.days() + " days ");
    }
    if(duration.hours() > 0){
      duration.hours() == 1 ? durationString += "1 hour " : durationString += (duration.hours() + " hours ");
    }
    // else{
    //   durationString += "0 hours ";
    // }
    if(duration.minutes() > 0){
      duration.minutes() == 1 ? durationString += "1 minute " : durationString += (duration.minutes() + " minutes ");
    }else{
      durationString += "0 minutes";
    }
    this._durationString = durationString;
  }

  get durationString(): string {
    return this._durationString;
  }

  get timeNow(): string{
    return moment().format('HH:mm');
  }

  get timeEndOfPreviousTimeMark(): moment.Moment{
    let previousTimeMark =  this.timeLogService.latestTimeMark;
    if(previousTimeMark.endTimeISO != null){
      let hoursBeforeNow = moment.duration(moment(previousTimeMark.endTimeISO).diff(moment())).asHours();
      if(hoursBeforeNow > 24){
        return null;
      }else{
        return moment(previousTimeMark.endTimeISO);
      }
    }else{
      /*
        2018-11-19
        In previous versions of the model there was no end time property, so in those cases it will always be the case where it is equal to null.
      */
      return null;
    }
  }

  private buildTimeMarkForm() {
    this.timeMarkForm = new FormGroup({
      'startTime': new FormControl({value: moment().format('HH:mm').toString(), disabled: false}),
      'startTimeDate': new FormControl({value: moment().format('YYYY-MM-DD').toString(), disabled: false}),
      'startTimeDurationHours': new FormControl(0, [Validators.max(23), Validators.min(0)]),
      'startTimeDurationMinutes': new FormControl(0, [Validators.max(59), Validators.min(0)]),
      'endTime': new FormControl({value: moment().format('HH:mm').toString(), disabled: true}),
      'endTimeNow': new FormControl({value: moment().format('HH:mm').toString(), disabled: true}),
      'endTimeDate': new FormControl({value: moment().format('YYYY-MM-DD').toString(), disabled: false}),
      'endTimeDurationHours': new FormControl(0, [Validators.max(23), Validators.min(0)]),
      'endTimeDurationMinutes': new FormControl(0, [Validators.max(59), Validators.min(0)]),
      // 'title': new FormControl(),
      'description': new FormControl(),
    });
  }

  onClickStartOption(option: ITimeOption){
    for(let startOption of this.startTimeOptions){
      startOption.icon = faCircle;
      startOption.iconClass = "";
    }
    option.icon = faCheckCircle;
    option.iconClass = "color-green";
    this.startTimeAction = option.action;
    if(option.action == "SINCE_PREVIOUS"){
      this.timeMarkForm.controls['startTime'].disable();
      this.timeMarkForm.controls['startTimeDate'].disable();
      this.timeMarkForm.controls['startTime'].patchValue(moment().format('HH:mm'));
      this.timeMarkForm.controls['startTimeDate'].patchValue(moment().format('YYYY-MM-DD'));
    }else if(option.action == "SPECIFY"){
      //in this case there was a previous time mark, 
      // so we need to ensure that this time does not precede the end of the previous time mark.
      //
      this.timeMarkForm.controls['startTime'].enable();
      this.timeMarkForm.controls['startTimeDate'].enable();
      this.timeMarkForm.controls['startTime'].patchValue(moment().format('HH:mm'));
      this.timeMarkForm.controls['startTimeDate'].patchValue(moment().format('YYYY-MM-DD'));
    }else if(option.action == "SPECIFY_NO_PREVIOUS"){
      this.timeMarkForm.controls['startTime'].enable();
      this.timeMarkForm.controls['startTimeDate'].enable();
      this.timeMarkForm.controls['startTime'].patchValue(moment().format('HH:mm'));
      this.timeMarkForm.controls['startTimeDate'].patchValue(moment().format('YYYY-MM-DD'));
    }else if(option.action == "SPECIFY_DURATION"){
      
    }
  }

  onClickEndOption(option: ITimeOption){
    for(let endOption of this.endTimeOptions){
      endOption.icon = faCircle;
      endOption.iconClass = "";
    }
    option.icon = faCheckCircle;
    option.iconClass = "color-green";
    this.endTimeAction = option.action;
    if(option.action == "NOW"){
      this.timeMarkForm.controls['endTime'].disable();
      this.timeMarkForm.controls['endTimeDate'].disable();
      this.timeMarkForm.controls['endTime'].patchValue(moment().format('HH:mm'));
      this.timeMarkForm.controls['endTimeDate'].patchValue(moment().format('YYYY-MM-DD'));
    }else if(option.action == "SPECIFY_TIME"){
      this.timeMarkForm.controls['endTime'].enable();
      this.timeMarkForm.controls['endTimeDate'].enable();
      this.timeMarkForm.controls['endTime'].patchValue(moment().format('HH:mm'));
      this.timeMarkForm.controls['endTimeDate'].patchValue(moment().format('YYYY-MM-DD'));
    }else if(option.action == "SPECIFY_DURATION"){

    }
  }

  onClickSaveTimeMark() {

    //grabs time from TODAY.  Might need to fix this to resolve cases where the form goes past midnight but then user modifies the time to be like 11:00pm of what they think is "today" but what is now actually yesterday due to passing midnight.
    let time = moment(moment().format('YYYY-MM-DD') + ' ' + this.timeMarkForm.get('startTime').value).toISOString();
    let newTimeMark = new TimeMark(null, null, time, null, null);
    newTimeMark.description = this.timeMarkForm.get('description').value;
    newTimeMark.activities = this.timeMarkActivities;
    let latestTimeMark = this.timeLogService.latestTimeMark;
    if(latestTimeMark){
      newTimeMark.precedingTimeMarkId = latestTimeMark.id;
    }else{
      newTimeMark.precedingTimeMarkId = "NO_PRECEDING_TIME_MARK";
    }
    newTimeMark.followingTimeMarkId = "NO_FOLLOWING_TIME_MARK";

    this.timeLogService.saveTimeMark(newTimeMark);
    this.timeMarkForm.reset();

    this.buildTimeMarkForm();

    this.closeForm.emit(true);
  }


  onKeyUpStartTimeHours(){
    if(this.timeMarkForm.get('startTimeDurationHours').value > 23){
      this.timeMarkForm.controls['startTimeDurationHours'].patchValue(23);
    }else if(this.timeMarkForm.get('startTimeDurationHours').value < 0){
      this.timeMarkForm.controls['startTimeDurationHours'].patchValue(0);
    }
  }
  onKeyUpStartTimeMinutes(){
    if(this.timeMarkForm.get('startTimeDurationMinutes').value > 59){
      this.timeMarkForm.controls['startTimeDurationMinutes'].patchValue(59);
    }else if(this.timeMarkForm.get('startTimeDurationMinutes').value < 0){
      this.timeMarkForm.controls['startTimeDurationMinutes'].patchValue(0);
    }
  }

  onKeyUpEndTimeHours(){
    if(this.timeMarkForm.get('endTimeDurationHours').value > 23){
      this.timeMarkForm.controls['endTimeDurationHours'].patchValue(23);
    }else if(this.timeMarkForm.get('endTimeDurationHours').value < 0){
      this.timeMarkForm.controls['endTimeDurationHours'].patchValue(0);
    }
  }
  onKeyUpEndTimeMinutes(){
    if(this.timeMarkForm.get('endTimeDurationMinutes').value > 59){
      this.timeMarkForm.controls['endTimeDurationMinutes'].patchValue(59);
    }else if(this.timeMarkForm.get('endTimeDurationMinutes').value < 0){
      this.timeMarkForm.controls['endTimeDurationMinutes'].patchValue(0);
    }
  }

  
  onClickCancelTimeMark(){
    this.closeForm.emit(true);
  }


  onClickAddActivity() {
    this.ifAddActivityForm = true;
    this.ifAddActivityButton = false;
    this.saveTimeMarkDisabled = 'disabled';
  }

  onActivitySaved(activity: CategorizedActivity){
    this.timeMarkActivities.push(activity);
    this.onCloseActivityForm(null);
  }

  onCloseActivityForm($event){
    this.ifAddActivityForm = false;
    this.ifAddActivityButton = true;
    this.saveTimeMarkDisabled = '';
  }




}
