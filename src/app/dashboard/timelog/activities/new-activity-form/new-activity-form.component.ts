import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategorizedActivity } from '../categorized-activity.model';
import { ActivitiesService } from '../activities.service';
import { Subscription, fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-new-activity-form',
  templateUrl: './new-activity-form.component.html',
  styleUrls: ['./new-activity-form.component.css']
})
export class NewActivityFormComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  ifShowParentCategories: boolean;
  ifMouseIsInParentCategoriesArea: boolean = false;
  showParentCategoriesSubscription: Subscription;


  activityForm: FormGroup;
  colorPickerValue: string;
  selectedParentCategory: CategorizedActivity;

  saveAction: string = "NEW";

  get selectedParentCategoryName(): string {
    if (this.selectedParentCategory != null) {
      return this.selectedParentCategory.name
    } else {
      return "";
    }
  }

  private _formParentCategories: CategorizedActivity[];

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('activitiesList') set formParentCategories(activities: CategorizedActivity[]) {
    // this._formParentCategories = this.buildActivitiesList(activities);
    this._formParentCategories = activities;
  }
  @Input() modifyActivity: CategorizedActivity;

  get formParentCategories(): CategorizedActivity[] {
    return this._formParentCategories;
  }


  ngOnInit() {

    this.showParentCategoriesSubscription = new Subscription();
    this.ifShowParentCategories = false;

    if (this.modifyActivity) {
      this.activityForm = this.modifyActivityForm(this.modifyActivity);
      this.saveAction = "MODIFY";
    } else {
      this.activityForm = this.newActivityForm();
    }





    // delete this
    this.activityForm.valueChanges.subscribe((stuff) => {
      console.log("form value changes: ", stuff);
    })
  }


  modifyActivityForm(activity: CategorizedActivity): FormGroup {
    let modifyForm: FormGroup = new FormGroup({
      'name': new FormControl(activity.name, Validators.required),
      'description': new FormControl(activity.description, Validators.required)
    });
    this.colorPickerValue = activity.color;
    this.selectedParentCategory = this.findActivityParent(activity, this.formParentCategories);
    return modifyForm;
  }

  newActivityForm(): FormGroup {
    this.colorPickerValue = "#c0c0c0";
    return new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required)
    });
  }

  findActivityParent(childActivity: CategorizedActivity, parents: CategorizedActivity[]): CategorizedActivity {
    for (let activity of parents) {
      if (activity.treeId == childActivity.parentTreeId) {
        return activity;
      } else {
        if (activity.children.length > 0) {
          let parent = this.findActivityParent(childActivity, activity.children);
          if(parent){
            return parent;
          }
        }
      }
    }
    return null;
  }

  buildActivitiesList(activities: CategorizedActivity[]) {
    let list: CategorizedActivity[] = [];
    let children: CategorizedActivity[] = [];
    for (let activity of activities) {
      if (activity.children.length > 0) {
        children = children.concat(this.buildActivitiesList(activity.children));
      }
      list.push(activity)
    }
    list = list.concat(children);
    return list;
  }

  onMouseLeaveParentCategoriesArea() {
    this.ifMouseIsInParentCategoriesArea = false;
  }
  onMouseEnterParentCategoriesArea() {
    this.ifMouseIsInParentCategoriesArea = true;
  }

  onClickParentCategory() {
    this.showParentCategoriesSubscription.unsubscribe();
    if (this.ifShowParentCategories) {
      this.ifShowParentCategories = false;
    } else {
      this.ifShowParentCategories = true;

      let documentClickListener: Observable<Event> = fromEvent(document, 'click');
      this.showParentCategoriesSubscription = documentClickListener.subscribe((click) => {
        if (!this.ifMouseIsInParentCategoriesArea) {
          this.ifShowParentCategories = false;
        }
      })

    }

  }
  onClickSelectedCategory(category: CategorizedActivity) {
    this.selectedParentCategory = category;
    this.colorPickerValue = category.color;
    this.ifShowParentCategories = false;
  }

  onClickSaveActivity(saveAction: string) {
    if (this.activityForm.valid && this.selectedParentCategory != null) {
      if(saveAction == "NEW"){
        let newActivity = new CategorizedActivity("", "", "", this.activityForm.get('name').value, this.activityForm.get('description').value, this.selectedParentCategory.treeId, this.colorPickerValue);
        this.activitiesService.saveActivity(newActivity);
      }else if(saveAction == "MODIFY"){
        let modifiedActivity = new CategorizedActivity(this.modifyActivity.id, this.modifyActivity.userId, this.modifyActivity.treeId, this.activityForm.get('name').value, this.activityForm.get('description').value, this.selectedParentCategory.treeId, this.colorPickerValue);
        this.activitiesService.updateActivity(modifiedActivity);
      }

      
      this.closeForm.emit(true);
    }
    else {
      console.log("form is invalid.");
    }

  }

  onClickCancel() {
    this.closeForm.emit(true);
  }


}

