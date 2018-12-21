import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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

  // @Input('updateActivity') updateActivity: IUpdateTimeMarkActivityTile;

  ngOnInit() {
    this.buildActivityForm();
    this.activitiesService.activitiesTree$.subscribe((activities: ActivityTree)=>{
      this.activityTree = activities;
    })
  }


  buildActivityForm() {
    // if(this.updateActivity){
    //   this.activityForm = new FormGroup({
    //     'activityTreeId': new FormControl(this.updateActivity.timeMarkActivity.activityTreeId, Validators.required),
    //     'description': new FormControl(this.updateActivity.timeMarkActivity.description),
    //     'duration': new FormControl(this.updateActivity.timeMarkActivity.duration, Validators.required)
    //   })
    // }else{
      this.activityForm = new FormGroup({
        'activityTreeId': new FormControl(null, Validators.required),
        'description': new FormControl(null),
        'duration': new FormControl(0, Validators.required)
      })
    // }
    
  }

  onClickCancelActivity() {
    
    // if(this.updateActivity){
    //   this.updateActivity.ifShowActivity = false;
    // }else{
      this.closeActivityForm.emit(true);
    // }

  }
  onClickSaveActivity() {
    if(this.activityForm.valid){
      let activity: CategorizedActivity = this.activityTree.allActivities.find(activity => activity.treeId === this.activityForm.get('activityTreeId').value);
  
      let timeMarkActivity: TimeMarkActivity = new TimeMarkActivity(activity, this.activityForm.value.duration, this.activityForm.value.description);
      // console.log(timeMarkActivity);
  
      // if(this.updateActivity){
      //   this.updateActivity.timeMarkActivity = timeMarkActivity;
      //   this.updateActivity.ifShowActivity = false;
      // }else{
        this.activitySaved.emit(timeMarkActivity);
      // }
      
    }else{
      console.log("form is invalid");
    }

  }

  getUpdateActivityName(): string{ 
    // if( this.updateActivity ){ 
    //   return this.updateActivity.timeMarkActivity.activity.name
    // }else{
      return "";
    // }
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
