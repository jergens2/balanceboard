import { Component, OnInit, Input } from '@angular/core';
import { IActivityInstance } from '../activity-instance.interface';
import { ActivityCategoryDefinition } from '../../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';

@Component({
  selector: 'app-instances-list',
  templateUrl: './instances-list.component.html',
  styleUrls: ['./instances-list.component.css']
})
export class InstancesListComponent implements OnInit {


  private _activityInstances: IActivityInstance[];
  private _activity: ActivityCategoryDefinition;

  @Input() set activityInstances(activityInstances: IActivityInstance[]) {
    this._activityInstances = activityInstances;
  }
  @Input() set activity(activity: ActivityCategoryDefinition) {
    this._activity = activity;
  }

  constructor() { }

  ngOnInit() {
  }

}
