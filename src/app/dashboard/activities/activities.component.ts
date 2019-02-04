import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { UserDefinedActivity } from './user-defined-activity.model';
import { IActivityTile } from './activity-tile.interface';
import { ActivityTree } from './activity-tree.model';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  
  ifNewActivityFormButton: boolean;
  ifNewActivityForm: boolean;

  ifDisplayActivity: boolean = false;
  displayedActivity: UserDefinedActivity = null;

  private activityNameFromForm: string = null;
  rootActivityTiles: IActivityTile[] = [];
  rootActivities: UserDefinedActivity[];

  activityTree: ActivityTree = null;

  modifyActivity: UserDefinedActivity;


  ngOnInit() {

    this.ifNewActivityFormButton = true;
    this.ifNewActivityForm = false;

    // let activityNameFromForm: string = this.activitiesService.activityNameFromActivityForm;
    // if (activityNameFromForm != null) {
    //   this.activityNameFromForm = activityNameFromForm;
    //   this.activitiesService.activityNameFromActivityForm = null;
    // } else {
    //   // no activity name was set on the service
    // }

    this.activitiesService.activitiesTree$.subscribe((tree) => {
      // console.log("subscribing to tree", tree)
      if(tree != null){
        this.activityTree = tree;
        // console.log("activity tree:", this.activityTree);
        this.rootActivities = this.activityTree.rootActivities;
        this.rootActivityTiles = this.rootActivities.map((activity)=>{
          return {activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false};
        });

        // console.log(this.rootActivityTiles);
      }
    })


  }



  onActivitySelected(activity: UserDefinedActivity){
    this.ifDisplayActivity = false;
    this.displayedActivity = activity;
    this.ifDisplayActivity = true;

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

  onClickDeleteActivity(activity: UserDefinedActivity){
    this.activitiesService.deleteActivity(activity);
  }
  onClickModifyActivity(activity: UserDefinedActivity){
    this.modifyActivity = activity;
    this.onClickCreateNewActivity();
  }



  
}
