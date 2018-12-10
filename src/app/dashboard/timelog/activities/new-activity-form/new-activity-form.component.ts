import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategorizedActivity } from '../activity/categorized-activity.model';
import { ActivitiesService } from '../activities.service';

@Component({
  selector: 'app-new-activity-form',
  templateUrl: './new-activity-form.component.html',
  styleUrls: ['./new-activity-form.component.css']
})
export class NewActivityFormComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  ifShowParentCategories: boolean;

  createActivityForm: FormGroup;
  colorPickerValue: string;

  _formParentCategories: CategorizedActivity[]

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('activitiesList') set formParentCategories(activities: CategorizedActivity[]){
    console.log("received input:", activities)
    this._formParentCategories = activities;
  }
  get formParentCategories(): CategorizedActivity[]{
    return this._formParentCategories;
  }

  ngOnInit() {

    this.ifShowParentCategories = false;
    this.colorPickerValue = "#c0c0c0";
    this.createActivityForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'parentCategoryId': new FormControl(null),
      // 'icon': new FormControl(null),
    });

    this.createActivityForm.valueChanges.subscribe((stuff) => {
      console.log(stuff);
    })
  }

  onClickParentCategory(){
    this.ifShowParentCategories = true;
  }

  onClickSaveActivity(){
    if(this.createActivityForm.valid){
      let newActivity: CategorizedActivity = new CategorizedActivity("",this.createActivityForm.get('name').value, this.createActivityForm.get('description').value, this.createActivityForm.get('parentCategoryId').value, [], this.colorPickerValue);
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




/*

public id: string;
    public name: string;
    public description: string;

    public userId: string;

    public parentActivityId: string;
    public childActivityIds: string[];

    private _parent: CategorizedActivity;
    private _children: CategorizedActivity[];

    public color: string;
    public icon: string;

*/