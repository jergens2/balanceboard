import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategorizedActivity } from '../../activities/activity/categorized-activity.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../activities/activities.service';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  constructor(private router: Router, private activitiesService: ActivitiesService) { }

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

  categorizedActivities: CategorizedActivity[] = [];
  categorizedActivitiesSearchResults: CategorizedActivity[] = [];

  activityForm: FormGroup;

  activityInputKeyUpSubscription: Subscription = new Subscription();

  activityNameInputValue: string = '';

  private _activity: CategorizedActivity;

  get activity(){
    return this._activity;
  }
  set activity(activity: CategorizedActivity){
    this._activity = activity;
  }

  @Output() closeActivityForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activitySaved: EventEmitter<CategorizedActivity> = new EventEmitter();

  ngOnInit() {
    this.buildActivityForm();
    this.activitiesService.activitiesTree$.subscribe((activities: CategorizedActivity[])=>{
      this.categorizedActivities = activities;
    })
  }


  buildActivityForm() {

    this.activityForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null),
      'color': new FormControl('blue'),
      'duration': new FormControl(0, Validators.required)
    })
  }

  onClickCancelActivity() {
    this.closeActivityForm.emit(true);
  }
  onClickSaveActivity() {
    /*
      Note: remember, this method is not to create a new kind of categorized activity, 
      this form is to save an instance of an already defined activity.

      The purpose of this form, therefore, is to simply define a collection of activities performed and how long time was spent on them
    */
    let id = '';
    let userId = '';
    let name = this.activityForm.get('name').value;;
    let description = this.activityForm.get('description').value;
    let parentActivityId = '';
    let color = this.activityForm.get('color').value

    let activity: CategorizedActivity = new CategorizedActivity(id,userId, '', name, description, parentActivityId, color);

    this.activitySaved.emit(activity);
  }


  onKeyUpActivityName(event: KeyboardEvent) {
    let inputValue = this.activityForm.get('name').value;
    this.activityInputKeyUpSubscription.unsubscribe();
    this.searchForCategorizedActivities(inputValue);
  }

  private searchForCategorizedActivities(inputValue: string) {
    let searchResults: CategorizedActivity[] = [];
    if (inputValue !== null && inputValue !== "") {
      for (let activity of this.categorizedActivities) {
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
      this.activityInputKeyUpSubscription.unsubscribe();
    }
    if (searchResults.length > 0) {
      this.activityInputKeyUpSubscription = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {

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
        if (event.key == "ArrowUp") {
          tabIndex < this.categorizedActivitiesSearchResults.length - 1 ? tabIndex++ : tabIndex = this.categorizedActivitiesSearchResults.length;
        } else if (event.key == "ArrowDown") {
          tabIndex > 0 ? tabIndex-- : tabIndex = 0;
        } else if (event.key == "Escape") {
          // searchResults = [];
          // this.renderer.selectRootElement("#activity_name_input").blur();
        }

        // this.renderer.selectRootElement("#activity_name_input").blur();

      });
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

  onClickMakeNewCategoryButton(){
    //click make new category button
    // navigate to a new page where you can manage categories
    this.activitiesService.activityNameFromActivityForm = this.activityForm.get('name').value;
    this.router.navigate(['/timelog-activities']);
  }


}
