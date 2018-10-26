import { Component, OnInit } from '@angular/core';
import { TimelogService } from './timelog.service';
import { TimeMark } from './time-mark.model';
import { FormGroup, FormControl } from '@angular/forms';

import * as moment from 'moment';
import { CategorizedActivity } from './categorized-activity.model';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})
export class TimelogComponent implements OnInit {

  constructor(private timeLogService: TimelogService) { }

  loadingTimeMarks: boolean = true;
  addTimeMarkForm: boolean = false;
  ifAddActivity: boolean = true;
  timeMarks: TimeMark[];
  timeMarkForm: FormGroup;
  newActivityForm: FormGroup;

  newCategorizedActivity: boolean = false;
  timeMarkActivities: CategorizedActivity[] = [];


  /*
      public name: string;
      public description: string;
  
      public userId: string;
      public parentId: string;
  
      public childCategoryIds: string[];
      public color: string;
      public icon: string;
  
  */

    
  /*
    Note about time versus ISO time
    Pacific Standard Time (PST) is UTC-8 on standard time, which is between November and March, 
    Pacific Daylight Time (PDT) is UTC-7 (also known as Daylight Savings Time), between March and November

    So depending on when you are checking, from the perspective in this time zone, the UTC time is always either 7 or 8 hours ahead, or more accurrately we are 7 or 8 hours behind.

    UTC                           - PDT
    "2018-10-25T07:00:00.000Z"    - 2018-10-25 00:00
    "2018-10-25T08:00:00.000Z"    - 2018-10-25 01:00
    "2018-10-25T09:00:00.000Z"    - 2018-10-25 02:00
    "2018-10-25T10:00:00.000Z"    - 2018-10-25 03:00
    "2018-10-25T11:00:00.000Z"    - 2018-10-25 04:00
    "2018-10-25T12:00:00.000Z"    - 2018-10-25 05:00
    "2018-10-25T13:00:00.000Z"    - 2018-10-25 06:00
    "2018-10-25T14:00:00.000Z"    - 2018-10-25 07:00
    "2018-10-25T15:00:00.000Z"    - 2018-10-25 08:00
    "2018-10-25T16:00:00.000Z"    - 2018-10-25 09:00
    "2018-10-25T17:00:00.000Z"    - 2018-10-25 10:00
    "2018-10-25T18:00:00.000Z"    - 2018-10-25 11:00
    "2018-10-25T19:00:00.000Z"    - 2018-10-25 12:00
    "2018-10-25T20:00:00.000Z"    - 2018-10-25 13:00
    "2018-10-25T21:00:00.000Z"    - 2018-10-25 14:00
    "2018-10-25T22:00:00.000Z"    - 2018-10-25 15:00
    "2018-10-25T23:00:00.000Z"    - 2018-10-25 16:00
    "2018-10-26T00:00:00.000Z"    - 2018-10-25 17:00
    "2018-10-26T01:00:00.000Z"    - 2018-10-25 18:00
    "2018-10-26T02:00:00.000Z"    - 2018-10-25 19:00
    "2018-10-26T03:00:00.000Z"    - 2018-10-25 20:00
    "2018-10-26T04:00:00.000Z"    - 2018-10-25 21:00
    "2018-10-26T05:00:00.000Z"    - 2018-10-25 22:00
    "2018-10-26T06:00:00.000Z"    - 2018-10-25 23:00

    all values stored in DB are in UTC time and when retreived come in UTC time.

    So our function must know this, in order to properly display "Todays time entries" meaning the 24 hour period which refers to the same single day number of the month, relative to the user.

    Client side gets moment() to get todays date.
    we are then looking for all time marks which would be between the hours of 00:00 and 23:59:59.9999 for the relative date of the client.

    Ultimately would we not want to store the timezone data in the DB as well and just do the conversion clientside?

    



  */




  ngOnInit() {
    this.buildForms();
    this.timeLogService.timeMarks.subscribe((timeMarks: TimeMark[]) => {
      this.timeMarks = this.todaysTimeMarks(timeMarks);
      this.loadingTimeMarks = false;
    });

  }

  private todaysTimeMarks(timeMarks: TimeMark[]): TimeMark[]{
    
    const today = moment().format('YYYY-MM-DD');
    // const utcOffsetMinutes = moment().utcOffset();

    // const utcOffsetStart = moment(today).hour(0).minute(utcOffsetMinutes).second(0).millisecond(0);
    // const utcOffsetEnd =   moment(today).hour(23).minute(59+utcOffsetMinutes).second(59).millisecond(999);

    let todaysTimeMarks: TimeMark[] = [];
    for(let timeMark of timeMarks){
      if(moment(timeMark.timeISO).local().format('YYYY-MM-DD') == moment(today).format('YYYY-MM-DD')){
        todaysTimeMarks.push(timeMark);
      }
    }
    return todaysTimeMarks;
  }

  buildForms(){
    this.timeMarkForm = new FormGroup({
      'time': new FormControl(moment().format('HH:mm').toString()),
      // 'title': new FormControl(),
      'description': new FormControl(),
    });
    this.newActivityForm = new FormGroup({
      'name': new FormControl('Overwatch'),
      'description': new FormControl('Overwatch PC video game'),
      'color': new FormControl('blue')
    })
  }

  toggleTimeMarkForm() {
    this.addTimeMarkForm = !this.addTimeMarkForm;
  }

  onClickAddActivity() {
    this.newCategorizedActivity = true;
    this.ifAddActivity = false;
  }

  onClickCancelActivity() {
    this.newCategorizedActivity = false;
    this.ifAddActivity = true;
  }
  onClickSaveActivity() {
    let activity: CategorizedActivity = new CategorizedActivity();
    //Get form data and build the object.
    activity.name = "Overwatch";
    activity.description = "Overwatch PC video game";
    activity.color = "silver"
    activity.childCategoryIds = [];
    activity.parentId = "";
    activity.icon = "";
    this.timeMarkActivities.push(activity);
    this.newCategorizedActivity = false;
    this.ifAddActivity = true;
  }

  onClickSaveTimeMark() {
    let time = moment(moment().format('YYYY-MM-DD') + ' ' + this.timeMarkForm.get('time').value).toISOString();
    let newTimeMark = new TimeMark(null, null, time);
    newTimeMark.description = this.timeMarkForm.get('description').value;
    newTimeMark.activities = this.timeMarkActivities;


    this.timeLogService.saveTimeMark(newTimeMark);
    this.toggleTimeMarkForm();
    this.timeMarkForm.reset();
    this.buildForms();

  }

  onClickDeleteTimeMark(timeMark: TimeMark) {
    this.timeLogService.deleteTimeMark(timeMark);
    
  }

}
