import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategorizedActivity } from '../activity/categorized-activity.model';
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


  createActivityForm: FormGroup;
  colorPickerValue: string;
  selectedParentCategory: CategorizedActivity;

  get selectedParentCategoryName(): string {
    if(this.selectedParentCategory != null){
      return this.selectedParentCategory.name
    }else{
      return "";
    }
  }

  _formParentCategories: CategorizedActivity[];

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('activitiesList') set formParentCategories(activities: CategorizedActivity[]){
    // this._formParentCategories = this.buildActivitiesList(activities);
    this._formParentCategories = activities;
  }
  get formParentCategories(): CategorizedActivity[]{
    return this._formParentCategories;
  }

  ngOnInit() {

    this.showParentCategoriesSubscription = new Subscription();
    this.ifShowParentCategories = false;
    this.colorPickerValue = "#c0c0c0";
    this.createActivityForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required)
    });

    this.createActivityForm.valueChanges.subscribe((stuff) => {
      console.log("form value changes: ", stuff);
    })
  }

  buildActivitiesList(activities: CategorizedActivity[]){
    let list: CategorizedActivity[] = [];
    let children: CategorizedActivity[] = [];
    for(let activity of activities){
      if(activity.children.length > 0 ){ 
        children = children.concat(this.buildActivitiesList(activity.children));
      }
      list.push(activity)
    }
    list = list.concat(children);
    return list;
  }

  onMouseLeaveParentCategoriesArea(){
    this.ifMouseIsInParentCategoriesArea = false;
  }
  onMouseEnterParentCategoriesArea(){
    this.ifMouseIsInParentCategoriesArea = true;
  }

  onClickParentCategory(){
    this.showParentCategoriesSubscription.unsubscribe();
    if(this.ifShowParentCategories){
      this.ifShowParentCategories = false;
    }else{
      this.ifShowParentCategories = true;

      let documentClickListener: Observable<Event> = fromEvent(document, 'click');
      this.showParentCategoriesSubscription = documentClickListener.subscribe((click)=>{  
        if(!this.ifMouseIsInParentCategoriesArea){
          this.ifShowParentCategories = false; 
        }
      })
  
    }
    
  }
  onClickSelectedCategory(category: CategorizedActivity){
    this.selectedParentCategory = category;
    this.ifShowParentCategories = false;
  }

  onClickSaveActivity(){
    if(this.createActivityForm.valid && this.selectedParentCategory != null){
      let newActivity: CategorizedActivity = new CategorizedActivity("","", "", this.createActivityForm.get('name').value, this.createActivityForm.get('description').value, this.selectedParentCategory.id, this.colorPickerValue);
      this.activitiesService.saveActivity(newActivity);
    }
    else{
      console.log("form is invalid.");
    }

  }

  onClickCancel(){
    this.closeForm.emit(true);
  }


}

