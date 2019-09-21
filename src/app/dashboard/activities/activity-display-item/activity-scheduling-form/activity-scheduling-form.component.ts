import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { ActivityScheduleConfiguration } from '../../api/activity-schedule-configuration.interface';

@Component({
  selector: 'app-activity-scheduling-form',
  templateUrl: './activity-scheduling-form.component.html',
  styleUrls: ['./activity-scheduling-form.component.css']
})
export class ActivitySchedulingFormComponent implements OnInit {

  constructor() { }

  @Input() activity: ActivityCategoryDefinition;

  public get scheduleConfiguration(): ActivityScheduleConfiguration{
    return this.activity.scheduleConfiguration
  }

  ngOnInit() {
    console.log("Schedule configuration: ", this.scheduleConfiguration);
  }

}
