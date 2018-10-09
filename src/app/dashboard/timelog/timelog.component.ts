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

  ngOnInit() {
    this.timeMarkForm = new FormGroup({
      'time': new FormControl(moment().format('HH:mm').toString()),
      'title': new FormControl(),
      'description': new FormControl(),
    });
    this.newActivityForm = new FormGroup({
      'name': new FormControl('Overwatch'),
      'description': new FormControl('Overwatch PC video game'),
      'color': new FormControl('blue')
    })
    this.timeLogService.timeMarks.subscribe((timeMarks: TimeMark[])=>{
      this.timeMarks = timeMarks;
      this.loadingTimeMarks = false;  
    });

  }

  toggleTimeMarkForm(){
    this.addTimeMarkForm = !this.addTimeMarkForm;
  }

  onClickAddActivity(){
    this.newCategorizedActivity = true;
    this.ifAddActivity = false;
  }

  onClickCancelActivity(){
    this.newCategorizedActivity = false;
    this.ifAddActivity = true;
  }
  onClickSaveActivity(){
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

  onClickSaveTimeMark(){

  }

}
