import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategorizedActivity } from '../../activities/categorized-activity.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../activities/activities.service';
import { ActivityTree } from '../../activities/activity-tree.model';
import { TimeMarkActivity } from '../../time-mark-activity.model';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  constructor(private router: Router, private activitiesService: ActivitiesService) { }

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  activityTree: ActivityTree;
  categorizedActivitiesSearchResults: CategorizedActivity[] = [];

  activityForm: FormGroup;
  // activityInputKeyUpSubscription: Subscription = new Subscription();

  activityNameInputValue: string = '';

  // private _activity: CategorizedActivity;

  // get activity(){
  //   return this._activity;
  // }
  // set activity(activity: CategorizedActivity){
  //   this._activity = activity;
  // }

  @Output() closeActivityForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activitySaved: EventEmitter<TimeMarkActivity> = new EventEmitter();

  ngOnInit() {
    this.buildActivityForm();
    this.activitiesService.activitiesTree$.subscribe((activities: ActivityTree)=>{
      this.activityTree = activities;
    })
  }


  buildActivityForm() {

    this.activityForm = new FormGroup({
      'activityTreeId': new FormControl(null, Validators.required),
      'description': new FormControl(null),
      'duration': new FormControl(0, Validators.required)
    })
  }

  onClickCancelActivity() {
    this.closeActivityForm.emit(true);
  }
  onClickSaveActivity() {

    if(this.activityForm.valid){
      let activity: CategorizedActivity = this.activityTree.allActivities.find(activity => activity.treeId === this.activityForm.get('activityTreeId').value);
  
      let timeMarkActivity: TimeMarkActivity = new TimeMarkActivity(activity);
      timeMarkActivity.duration = 0;
  
      this.activitySaved.emit(timeMarkActivity);
    }else{
      console.log("form is invalid");
    }

  }


  onKeyUpActivityName(event: KeyboardEvent) {
    let inputValue = this.activityForm.get('name').value;
    // this.activityInputKeyUpSubscription.unsubscribe();
    this.searchForCategorizedActivities(inputValue);
  }

  private searchForCategorizedActivities(inputValue: string) {
    let searchResults: CategorizedActivity[] = [];

    let activities = this.activityTree.allActivities;
    //
    // need to convert activity tree here to list of activities.  could be a method of said tree.
    //
    //


    if (inputValue !== null && inputValue !== "") {
      for (let activity of activities) {
        if (activity.name.toLowerCase().match(inputValue.toLowerCase())) {
          searchResults.push(activity);
        }
      }
      if (searchResults.length > 0) {
        this.activityNameInputValue = "";
      } else {
        this.activityNameInputValue = inputValue;
      }
    } else {
      this.activityNameInputValue = "";
      // this.activityInputKeyUpSubscription.unsubscribe();
    }
    if (searchResults.length > 0) {
      // this.activityInputKeyUpSubscription = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {

      //   //
      //   // The intention of this subscription is to be able to pick up the users arrow key inputs (up and down) and navigate through the list or results
      //   // I might just have to scrap this functionality if it is too cumbersome to implement.
      //   //
      //   let tabIndex = 0;

      //   /*
      //     2018-11-14
      //     Apparently there does not seem to be an appropriate method in Angular to play with the DOM in this way w/ respect to focus and blur.
      //     https://github.com/angular/angular/issues/15674

      //     as of right now this code block doesn't really do anything.

      //   */
      //   if (event.key == "ArrowUp") {
      //     tabIndex < this.categorizedActivitiesSearchResults.length - 1 ? tabIndex++ : tabIndex = this.categorizedActivitiesSearchResults.length;
      //   } else if (event.key == "ArrowDown") {
      //     tabIndex > 0 ? tabIndex-- : tabIndex = 0;
      //   } else if (event.key == "Escape") {
      //     // searchResults = [];
      //     // this.renderer.selectRootElement("#activity_name_input").blur();
      //   }

      //   // this.renderer.selectRootElement("#activity_name_input").blur();

      // });
    }
    this.categorizedActivitiesSearchResults = searchResults;
  }

  getActivityNameInputStyle(activity: CategorizedActivity){
    return {'background-color': activity.color};
  }
  onClickActivityNameDropdownItem(activity: CategorizedActivity){
    this.activityForm.patchValue({'name':activity.name});
    this.searchForCategorizedActivities('');
  }

  onClickCreateNewCategory(){
    //click make new category button
    // navigate to a new page where you can manage categories
    this.activitiesService.activityNameFromActivityForm = this.activityForm.get('name').value;
    this.router.navigate(['/timelog-activities']);
  }

  onActivitySelectionChanged($event){
    let activityId = $event.target.value;
    if(activityId == ""){
      this.activityForm.controls['activityTreeId'].setValue(null);
    }else{
      this.activityForm.controls['activityTreeId'].setValue(activityId);
    }

  }

}
