import { Component, OnInit, Output, EventEmitter, Renderer2, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, fromEvent } from 'rxjs';

import * as moment from 'moment';
import { faCheckCircle, faCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons'; 

import { CategorizedActivity } from '../activities/categorized-activity.model';
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
  
  // latestTimeMark: TimeMark;

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  startTimeOptions: ITimeOption[];
  endTimeOptions: ITimeOption[];

  // ifPreviousTimeMark: boolean = false;

  ifAddActivityForm: boolean = false;

  startTimeAction: string;
  endTimeAction: string;

  newCategorizedActivity: boolean = false;
  ifAddActivityButton: boolean = true;
  saveTimeMarkDisabled: string = '';

  timeMarkForm: FormGroup;


  
  timeMarkActivities: CategorizedActivity[] = [];

  
  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() latestTimeMark: TimeMark;

  ngOnInit() {
    this.timeMarkActivities = [];
    console.log("Latest time mark on form:", this.latestTimeMark);


    this.buildTimeOptions();
    this.buildTimeInputs();
    this.buildTimeMarkForm();
    this.updateDuration();
  }

  private buildTimeOptions(){
    let options: ITimeOption[] = [];
    if(this.latestTimeMark != null){
      this.startTimeAction = "SINCE_PREVIOUS";
      options.push({
        "icon":faCheckCircle,
        "iconClass":"color-green",
        "label":"End of previous time mark",
        "action":"SINCE_PREVIOUS",
      });
      // options.push({
      //   "icon":faCircle,
      //   "iconClass":"",
      //   "label":"Specify",
      //   "action":"SPECIFY"
      // });
    }else{
      this.startTimeAction = "SPECIFY_NO_PREVIOUS";
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
    // options.push({
    //   "icon":faCircle,
    //   "iconClass":"",
    //   "label":"Specify duration (how long it took)",
    //   "action":"SPECIFY_DURATION"
    // });
    this.endTimeOptions = options;
    this.endTimeAction = "NOW";
  }
  private buildTimeInputs(){

  }

  private updateDuration(){
    /*
      2018-11-20
      TO DO:
      Need to validate that start time is in fact before end time.
      Need to validate that end time does not exceed the time right now.


    */
    let startTime: moment.Moment = moment();
    if(this.startTimeAction == "SPECIFY" || this.startTimeAction == "SPECIFY_NO_PREVIOUS"){
      let date = this.timeMarkForm.get('startTimeDate').value;
      let time = this.timeMarkForm.get('startTime').value;
      startTime = moment(date + ' ' + time);
    }else if(this.startTimeAction == "SPECIFY_DURATION"){
      let hours = this.timeMarkForm.get('startTimeDurationHours').value;
      let totalMinutes = this.timeMarkForm.get('startTimeDurationMinutes').value + (hours*60);
      startTime = moment().subtract(totalMinutes,'minutes');
    }else if(this.startTimeAction == "SINCE_PREVIOUS"){
      startTime = this.latestTimeMark.endTime;
    }

    let endTime: moment.Moment = moment();
    if(this.endTimeAction == "NOW"){
      endTime = moment();
    }else if(this.endTimeAction == "SPECIFY_DURATION"){
      let hours = this.timeMarkForm.get('endTimeDurationHours').value;
      let totalMinutes = this.timeMarkForm.get('endTimeDurationMinutes').value + (hours*60);
      endTime = moment(startTime).add(totalMinutes, 'minutes');
    }else if(this.endTimeAction == "SPECIFY_TIME"){
      let date = this.timeMarkForm.get('endTimeDate').value;
      let time = this.timeMarkForm.get('endTime').value;
      endTime = moment(date + ' ' + time);
    }
    let duration = moment.duration(endTime.diff(startTime));
    if(duration.asSeconds() < 0){
      this.timeMarkForm.controls['endTime'].setValue(startTime.format('HH:mm'));
      this.timeMarkForm.controls['endTimeDate'].setValue(startTime.format('YYYY-MM-DD'))
    }
    let durationString = '';
    if(duration.hours() > 0){
      duration.hours() == 1 ? durationString += "1 hour " : durationString += (duration.hours() + " hours ");
    }
    if(duration.minutes() > 0){
      duration.minutes() == 1 ? durationString += "1 minute " : durationString += (Math.round(duration.minutes()) + " minutes ");
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

  private buildTimeMarkForm() {
    let startTime = moment().format('HH:mm').toString();
    let startTimeDate = moment().format('YYYY-MM-DD').toString();
    if(this.startTimeAction == "SINCE_PREVIOUS"){
      startTime = this.latestTimeMark.endTime.format('HH:mm');
      startTimeDate = this.latestTimeMark.endTime.format('YYYY-MM-DD');
    }

    this.timeMarkForm = new FormGroup({
      'startTime': new FormControl({value: startTime, disabled: false}),
      'startTimeDate': new FormControl({value: startTimeDate, disabled: false}),
      'startTimeDurationHours': new FormControl(0, [Validators.max(23), Validators.min(0)]),
      'startTimeDurationMinutes': new FormControl(0, [Validators.max(59), Validators.min(0)]),
      'endTime': new FormControl({value: moment().format('HH:mm').toString(), disabled: true}),
      // 'endTimeNow': new FormControl({value: moment().format('HH:mm').toString(), disabled: true}),
      'endTimeDate': new FormControl({value: moment().format('YYYY-MM-DD').toString(), disabled: true}),
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
      // this.timeMarkForm.controls['startTime'].disable();
      // this.timeMarkForm.controls['startTimeDate'].disable();
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
    this.updateDuration();
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
    this.updateDuration();
  }

  onClickSaveTimeMark() {
    let startTime = moment(this.timeMarkForm.get('startTimeDate').value + ' ' + this.timeMarkForm.get('startTime').value).toISOString();
    let endTime = moment(this.timeMarkForm.get('endTimeDate').value + ' ' + this.timeMarkForm.get('endTime').value).toISOString();

    let newTimeMark = new TimeMark(null, null, startTime, endTime);
    newTimeMark.description = this.timeMarkForm.get('description').value;
    newTimeMark.activities = this.timeMarkActivities;
    if(this.latestTimeMark != null){
      newTimeMark.precedingTimeMarkId = this.latestTimeMark.id;
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
    let hours = 0
    if(this.timeMarkForm.get('startTimeDurationHours').value > 23){
      hours = 23;
    }else if(this.timeMarkForm.get('startTimeDurationHours').value < 0){
      hours = 0;
    }else{
      hours = this.timeMarkForm.get('startTimeDurationHours').value;
    }
    this.timeMarkForm.controls['startTimeDurationHours'].patchValue(hours);
    let date = this.timeMarkForm.get('startTimeDate').value;
    let time = this.timeMarkForm.get('startTime').value;
    let startTime = moment(date + ' ' + time).subtract(hours, 'hours');
    this.timeMarkForm.controls['startTimeDate'].setValue(startTime.format('YYYY-MM-DD'));
    this.timeMarkForm.controls['startTime'].setValue(startTime.format('HH:mm'));
    this.updateDuration();
  }
  onKeyUpStartTimeMinutes(){
    let minutes = 0;
    if(this.timeMarkForm.get('startTimeDurationMinutes').value > 59){
      minutes = 59.9999;
    }else if(this.timeMarkForm.get('startTimeDurationMinutes').value < 0){
      minutes = 0;
    }else{
      minutes = this.timeMarkForm.get('startTimeDurationMinutes').value;
    }
    this.timeMarkForm.controls['startTimeDurationMinutes'].patchValue(minutes);
    let date = this.timeMarkForm.get('startTimeDate').value;
    let time = this.timeMarkForm.get('startTime').value;
    let startTime = moment(date + ' ' + time).subtract(minutes, 'minutes');
    this.timeMarkForm.controls['startTimeDate'].setValue(startTime.format('YYYY-MM-DD'));
    this.timeMarkForm.controls['startTime'].setValue(startTime.format('HH:mm'));
    this.updateDuration();
  }

  onKeyUpEndTimeHours(){
    if(this.timeMarkForm.get('endTimeDurationHours').value > 23){
      this.timeMarkForm.controls['endTimeDurationHours'].patchValue(23);


    }else if(this.timeMarkForm.get('endTimeDurationHours').value < 0){
      this.timeMarkForm.controls['endTimeDurationHours'].patchValue(0);


    }
    this.updateDuration();
  }
  onKeyUpEndTimeMinutes(){
    if(this.timeMarkForm.get('endTimeDurationMinutes').value > 59){
      this.timeMarkForm.controls['endTimeDurationMinutes'].patchValue(59);


    }else if(this.timeMarkForm.get('endTimeDurationMinutes').value < 0){
      this.timeMarkForm.controls['endTimeDurationMinutes'].patchValue(0);
    }

    this.updateDuration();
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
