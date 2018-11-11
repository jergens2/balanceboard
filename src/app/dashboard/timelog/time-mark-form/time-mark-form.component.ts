import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategorizedActivity } from '../categorized-activity.model';
import { FormGroup, FormControl } from '@angular/forms';

import * as moment from 'moment';
import { TimeMark } from '../time-mark.model';
import { TimelogService } from '../timelog.service';


@Component({
  selector: 'app-time-mark-form',
  templateUrl: './time-mark-form.component.html',
  styleUrls: ['./time-mark-form.component.css']
})
export class TimeMarkFormComponent implements OnInit {



  constructor(private timeLogService: TimelogService) { }

  activityNameInputValue: string = '';



  newCategorizedActivity: boolean = false;

  timeMarkForm: FormGroup;
  newActivityForm: FormGroup;

  categorizedActivities: CategorizedActivity[] = [
    {
      id: '',
      name: "Overwatch",
      description: "Overwatch PC video game",
      color: "#f8a01b",
      icon: ''
    },
    {
      id: '',
      name: "Reddit",
      description: "Browse Reddit",
      color: "#ff6435",
      icon: ''
    },
    {
      id: '',
      name: "CSC - NSD",
      description: "Working for Correctional Service of Canada - National IT Service Desk",
      color: "#2f54f9",
      icon: ''
    },
    {
      id: '',
      name: "Walk Dogs",
      description: "Take the dogs for a walk",
      color: "#1da529",
      icon: ''
    }
  ];
  categorizedActivitiesSearchResults: CategorizedActivity[] = [];
  timeMarkActivities: CategorizedActivity[] = [];

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();


  ngOnInit() {
    console.log("ngOnInt() called on Time Mark Form Component");
    this.timeMarkActivities = [];
    this.buildTimeMarkForm();
  }


  buildActivityForm() {

    this.newActivityForm = new FormGroup({
      'name': new FormControl(null),
      'description': new FormControl(null),
      'color': new FormControl('blue')
    })
  }

  buildTimeMarkForm() {
    this.timeMarkForm = new FormGroup({
      'time': new FormControl(moment().format('HH:mm').toString()),
      // 'title': new FormControl(),
      'description': new FormControl(),
    });
  }



  onClickAddActivity() {
    this.newCategorizedActivity = true;

    this.buildActivityForm();
  }

  onClickCancelActivity() {
    this.newCategorizedActivity = false;

  }
  onClickSaveActivity() {
    let activity: CategorizedActivity = new CategorizedActivity();
    //Get form data and build the object.
    activity.name = this.newActivityForm.get('name').value;
    activity.description = this.newActivityForm.get('description').value;
    activity.color = this.newActivityForm.get('color').value
    // activity.childCategoryIds = [];
    // activity.parentId = "";
    activity.icon = "";
    this.timeMarkActivities.push(activity);
    this.newCategorizedActivity = false;
  }


  onKeyUpActivityName(event){
    let inputValue = this.newActivityForm.get('name').value;
    this.searchForCategorizedActivities(inputValue);
  } 

  private searchForCategorizedActivities(inputValue: string){
    let searchResults: CategorizedActivity[] = [];
    
    if(inputValue != ""){
      for(let activity of this.categorizedActivities){
        if(activity.name.toLowerCase().match(inputValue.toLowerCase())){
          searchResults.push(activity);
        }
      }
      if(searchResults.length > 0){
        this.activityNameInputValue = "";
      }else{
        this.activityNameInputValue = inputValue;
      }
    }else{
      this.activityNameInputValue = "";
    }
    this.categorizedActivitiesSearchResults = searchResults;
  }

  onClickSaveTimeMark() {

    //grabs time from TODAY.  Might need to fix this to resolve cases where the form goes past midnight but then user modifies the time to be like 11:00pm of what they think is "today" but what is now actually yesterday due to passing midnight.
    let time = moment(moment().format('YYYY-MM-DD') + ' ' + this.timeMarkForm.get('time').value).toISOString();
    let newTimeMark = new TimeMark(null, null, time);
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

    this.buildActivityForm();
    this.buildTimeMarkForm();

    this.closeForm.emit(true);
  }
  onClickCancelTimeMark(){
    this.closeForm.emit(true);
  }



  getActivityNameInputStyle(activity: CategorizedActivity){
    return {'background-color': activity.color};
  }
  onClickActivityNameDropdownItem(activity: CategorizedActivity){
    this.newActivityForm.patchValue({'name':activity.name});
    this.searchForCategorizedActivities('');
  }

  onClickMakeNewCategoryButton(){
    //click make new category button
    // navigate to a new page where you can manage categories

  }

}
