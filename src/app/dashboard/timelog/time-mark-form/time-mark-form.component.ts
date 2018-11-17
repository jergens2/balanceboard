import { Component, OnInit, Output, EventEmitter, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, fromEvent } from 'rxjs';

import * as moment from 'moment';
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'; 

import { CategorizedActivity } from '../categorized-activity.model';
import { TimeMark } from '../time-mark.model';
import { TimelogService } from '../timelog.service';



@Component({
  selector: 'app-time-mark-form',
  templateUrl: './time-mark-form.component.html',
  styleUrls: ['./time-mark-form.component.css']
})
export class TimeMarkFormComponent implements OnInit {



  constructor(private timeLogService: TimelogService, private renderer: Renderer2) { }

  //variable for the template
  activityNameInputValue: string = '';
  private _durationString: string = '';

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  newCategorizedActivity: boolean = false;
  ifAddActivityButton: boolean = true;
  saveTimeMarkDisabled: string = '';

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

  activityInputKeyUpSubscription: Subscription = new Subscription();

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();


  ngOnInit() {
    this.timeMarkActivities = [];
    this.buildTimeMarkForm();
    this.setDurationString(this.timeLogService.latestTimeMark.time);

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

  buildActivityForm() {

    this.newActivityForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null),
      'color': new FormControl('blue'),
      'duration': new FormControl(0, Validators.required)
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

    /*
      Build an observable.fromEvent subscription that listens for keyboard ESCAPE key in order to cancel the search / close the dropdown for categorizedActivity search
      
    */


    this.buildActivityForm();
    this.ifAddActivityButton = false;
    this.saveTimeMarkDisabled = 'disabled';
  }

  onClickCancelActivity() {
    this.newCategorizedActivity = false;
    this.ifAddActivityButton = true;
    this.saveTimeMarkDisabled = '';
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
    this.ifAddActivityButton = true;
    this.saveTimeMarkDisabled = '';
  }


  onKeyUpActivityName(event: KeyboardEvent){
    let inputValue = this.newActivityForm.get('name').value;
    this.activityInputKeyUpSubscription.unsubscribe();
    this.searchForCategorizedActivities(inputValue);
  } 

  private searchForCategorizedActivities(inputValue: string){
    let searchResults: CategorizedActivity[] = [];
    if(inputValue !== null && inputValue !== ""){
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
      this.activityInputKeyUpSubscription.unsubscribe();
    }
    if(searchResults.length > 0){
      this.activityInputKeyUpSubscription = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent)=>{

        //
        // The intention of this subscription is to be able to pick up the users arrow key inputs (up and down) and navigate through the list or results
        // I might just have to scrap this functionality if it is too cumbersome to implement.
        //
        let tabIndex = 0;

        /*
          2018-11-14
          Apparently there does not seem to be an appropriate method in Angular to play with the DOM in this way w/ respect to focus and blur.
          https://github.com/angular/angular/issues/15674

          as of right now this code block doesn't really do anything.

        */
        if(event.key == "ArrowUp"){
          tabIndex < this.categorizedActivitiesSearchResults.length-1 ? tabIndex++ : tabIndex = this.categorizedActivitiesSearchResults.length;
        }else if(event.key == "ArrowDown"){
          tabIndex > 0 ? tabIndex-- : tabIndex = 0;
        }else if(event.key == "Escape"){
          // searchResults = [];
          // this.renderer.selectRootElement("#activity_name_input").blur();
        }

        // this.renderer.selectRootElement("#activity_name_input").blur();

      });
    }
    this.categorizedActivitiesSearchResults = searchResults;
  }

  onClickSaveTimeMark() {

    //grabs time from TODAY.  Might need to fix this to resolve cases where the form goes past midnight but then user modifies the time to be like 11:00pm of what they think is "today" but what is now actually yesterday due to passing midnight.
    let time = moment(moment().format('YYYY-MM-DD') + ' ' + this.timeMarkForm.get('time').value).toISOString();
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
