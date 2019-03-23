import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { UserDefinedActivity } from '../../user-defined-activity.model';

@Component({
  selector: 'app-instances-list',
  templateUrl: './instances-list.component.html',
  styleUrls: ['./instances-list.component.css']
})
export class InstancesListComponent implements OnInit {


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
  }

}
