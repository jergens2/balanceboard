import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivitiesService } from '../activities.service';
import { ActivityTree } from '../activity-tree.model';
import { IActivityTile } from '../activity-tile.interface';
import { UserDefinedActivity } from '../user-defined-activity.model';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  activityTree: ActivityTree = null
  rootActivityTiles: IActivityTile[] = [];

  @Output() activitySelected: EventEmitter<UserDefinedActivity> = new EventEmitter();

  ngOnInit() {
    this.updateTree(this.activitiesService.activitiesTree);
    this.activitiesService.activitiesTree$.subscribe((changedTree)=>{
      this.updateTree(changedTree);
    });
  }

  private updateTree(changedTree: ActivityTree){
    this.activityTree = changedTree;
    this.rootActivityTiles = this.activityTree.rootActivities.map((activity) => {
      return { activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false };
    });
  }

  onActivitySelected(selectedActivity: UserDefinedActivity){
    this.activitySelected.emit(selectedActivity);
  }

}
