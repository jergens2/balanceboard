import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../../shared/document-definitions/activity-category-definition/activity-category-definition.class';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  constructor() { }

  @Input() activity: ActivityCategoryDefinition;

  ngOnInit() {
  }

}
