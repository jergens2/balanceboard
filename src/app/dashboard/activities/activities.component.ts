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



  action: string = "default";
  formAction: string = "new";

  displayedActivity: UserDefinedActivity = null;

  private activityNameFromForm: string = null;
  rootActivityTiles: IActivityTile[] = [];
  rootActivities: UserDefinedActivity[];

  activityTree: ActivityTree = null;

  modifyActivity: UserDefinedActivity;


  ngOnInit() {
    this.activityTree = this.activitiesService.activitiesTree;

    this.rootActivities = this.activityTree.rootActivities;
    this.rootActivityTiles = this.rootActivities.map((activity) => {
      return { activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false };
    });

    // console.log(this.rootActivityTiles);
  }

  onDisplayClosed() {
    this.action = "default";
  }
  onFormClosed(){
    this.action = "default";
  }

  onActivitySelected(activity: UserDefinedActivity) {
    this.displayedActivity = activity;
    this.action = "display";
  }

  onClickCreateNewActivity() {
    this.formAction = "new";
    this.action = "form";
  }



}
