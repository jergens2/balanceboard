import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToolboxService } from '../../../toolbox-menu/toolbox.service';
import { ActivityTree } from '../api/activity-tree.class';
import { ActivityCategoryDefinitionService } from '../api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {

  public faPlus = faPlus;

  constructor(private toolboxService: ToolboxService, private activityService: ActivityCategoryDefinitionService) { }

  private _activityTree: ActivityTree;
  public get rootActivities(): ActivityCategoryDefinition[] { return this._activityTree.rootActivities; }
  public get trashedActivities(): ActivityCategoryDefinition[] { return this._activityTree.allTrashed; }
  @Output() public activityOpened: EventEmitter<ActivityCategoryDefinition> = new EventEmitter();
  
  ngOnInit(): void {
    this._activityTree = this.activityService.activitiesTree;
    
  }


  public onClickNewActivity() {
    console.log("New activity: method disabled.")
    //open the toolbox
  }

  public onActivityOpened(activity: ActivityCategoryDefinition){
    this.activityOpened.emit(activity);
  }

}
