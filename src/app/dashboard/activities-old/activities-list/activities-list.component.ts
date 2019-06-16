import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinitionService } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityTree } from '../../../shared/document-definitions/activity-category-definition/activity-tree.class';
import { IActivityTile } from '../activity-tile.interface';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService) { }

  activityTree: ActivityTree = null
  rootActivityTiles: IActivityTile[] = [];

  @Output() activitySelected: EventEmitter<ActivityCategoryDefinition> = new EventEmitter();

  ngOnInit() {
    this.updateTree(this.activityCategoryDefinitionService.activitiesTree);
    this.activityCategoryDefinitionService.activitiesTree$.subscribe((changedTree)=>{
      this.updateTree(changedTree);
    });
  }

  private updateTree(changedTree: ActivityTree){
    this.activityTree = changedTree;
    this.rootActivityTiles = this.activityTree.rootActivities.map((activity) => {
      return { activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false };
    });
  }

  onActivitySelected(selectedActivity: ActivityCategoryDefinition){
    this.activitySelected.emit(selectedActivity);
  }

}
