import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { CategorizedActivity } from './activity/categorized-activity.model';
import { IActivityTile } from './activity-tile.interface';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  
  ifNewActivityFormButton: boolean;
  ifNewActivityForm: boolean;


  private activityNameFromForm: string = null;
  rootActivityTiles: IActivityTile[] = [];
  rootActivities: CategorizedActivity[];

  modifyActivity: CategorizedActivity;


  ngOnInit() {

    this.ifNewActivityFormButton = true;
    this.ifNewActivityForm = false;

    let activityNameFromForm: string = this.activitiesService.activityNameFromActivityForm;
    if (activityNameFromForm != null) {
      this.activityNameFromForm = activityNameFromForm;
      this.activitiesService.activityNameFromActivityForm = null;
    } else {
      // no activity name was set on the service
    }

    this.activitiesService.activitiesTree$.subscribe((activities) => {
      if(activities != null){
        this.rootActivities = activities;
        this.rootActivityTiles = activities.map((activity)=>{
          return {activity: activity, ifShowActivityControls: false};
        });
      }
    })


  }





  onClickCreateNewActivity(){
    this.ifNewActivityForm = true;
    this.ifNewActivityFormButton = false;
  }

  onCloseForm(event){
    this.ifNewActivityForm = false;
    this.ifNewActivityFormButton = true;
    this.modifyActivity = null;
  }

  onClickDeleteActivity(activity: CategorizedActivity){
    this.activitiesService.deleteActivity(activity);
  }
  onClickModifyActivity(activity: CategorizedActivity){
    this.modifyActivity = activity;
    this.onClickCreateNewActivity();
  }



  
}
