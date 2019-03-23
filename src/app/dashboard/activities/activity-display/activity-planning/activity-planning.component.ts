import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { UserDefinedActivity } from '../../user-defined-activity.model';

@Component({
  selector: 'app-activity-planning',
  templateUrl: './activity-planning.component.html',
  styleUrls: ['./activity-planning.component.css']
})
export class ActivityPlanningComponent implements OnInit {


  private _activityInstances: IActivityInstance[];
  private _activity: UserDefinedActivity;

  @Input() set activityInstances(activityInstances: IActivityInstance[]) {
    this._activityInstances = activityInstances;
  }
  @Input() set activity(activity: UserDefinedActivity) {
    this._activity = activity;
  }

  constructor() { }

  ngOnInit() {
    console.log("this.instances is ", this._activityInstances);
  }

}
