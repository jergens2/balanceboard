import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

@Component({
  selector: 'app-activity-scheduling-form',
  templateUrl: './activity-scheduling-form.component.html',
  styleUrls: ['./activity-scheduling-form.component.css']
})
export class ActivitySchedulingFormComponent implements OnInit {

  constructor() { }

  @Input() activity: ActivityCategoryDefinition;

  ngOnInit() {
    
  }

}
