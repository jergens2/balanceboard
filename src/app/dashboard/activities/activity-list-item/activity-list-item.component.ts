import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes, faCog } from '@fortawesome/free-solid-svg-icons';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';
import { IActivityTile } from '../activity-tile.interface';

@Component({
  selector: 'app-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrls: ['./activity-list-item.component.css']
})
export class ActivityListItemComponent implements OnInit {

  constructor() { }

  faTimes = faTimes;
  faCog = faCog;

  activityTile: IActivityTile = null;

  @Input() set activity(activity: ActivityCategoryDefinition){
    this.activityTile = {activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false};
  };


  @Output() activitySelected: EventEmitter<ActivityCategoryDefinition> = new EventEmitter<ActivityCategoryDefinition>();

  ngOnInit() {

  }


  onActivitySelected(activity:ActivityCategoryDefinition){
    this.activitySelected.emit(activity);
  }

  onClickActivity(activity: ActivityCategoryDefinition){
    this.activitySelected.emit(activity);
  }

}
