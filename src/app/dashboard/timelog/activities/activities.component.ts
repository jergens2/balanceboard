import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { CategorizedActivity } from './categorized-activity.model';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  private _activityNameFromForm: string = null;
  activities: CategorizedActivity[] = [];

  ngOnInit() {

    let activityNameFromForm: string = this.activitiesService.activityNameFromActivityForm;
    if(activityNameFromForm != null){
      this._activityNameFromForm = activityNameFromForm;
      this.activitiesService.activityNameFromActivityForm = null;
    }else{
      console.log("activity name was NULL BITCH");
    }

    this.activitiesService.activities.subscribe((activities)=>{
      this.activities = activities;
    })
    

  }

}
