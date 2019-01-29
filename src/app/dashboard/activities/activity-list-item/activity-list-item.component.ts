import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes, faCog } from '@fortawesome/free-solid-svg-icons';
import { UserDefinedActivity } from '../user-defined-activity.model';
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

  @Input() set activity(activity: UserDefinedActivity){
    this.activityTile = {activity: activity, ifShowActivityDelete: false, ifShowActivityModify: false};
  };


  @Output() activitySelected: EventEmitter<UserDefinedActivity> = new EventEmitter<UserDefinedActivity>();

  ngOnInit() {

  }


  onActivitySelected(activity:UserDefinedActivity){
    this.activitySelected.emit(activity);
  }

  onClickActivity(activity: UserDefinedActivity){
    this.activitySelected.emit(activity);
  }

}
