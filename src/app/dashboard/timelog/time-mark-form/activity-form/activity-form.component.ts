import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategorizedActivity } from '../../categorized-activity.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  constructor() { }

  faCheckCircle = faCheckCircle;
  faCircle = faCircle;

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

  activityForm: FormGroup;

  activityInputKeyUpSubscription: Subscription = new Subscription();

  activityNameInputValue: string = '';

  @Output() closeActivityForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() activitySaved: EventEmitter<CategorizedActivity> = new EventEmitter();

  ngOnInit() {
    this.buildActivityForm();
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
    let activity: CategorizedActivity = new CategorizedActivity();
    //Get form data and build the object.
    activity.name = this.activityForm.get('name').value;
    activity.description = this.activityForm.get('description').value;
    activity.color = this.activityForm.get('color').value
    // activity.childCategoryIds = [];
    // activity.parentId = "";
    activity.icon = "";


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

  }


}
