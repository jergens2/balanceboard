import { Component, OnInit, Input } from '@angular/core';
import { UserDefinedActivity } from '../user-defined-activity.model';

@Component({
  selector: 'app-activity-display',
  templateUrl: './activity-display.component.html',
  styleUrls: ['./activity-display.component.css']
})
export class ActivityDisplayComponent implements OnInit {

  constructor() { }

  activity: UserDefinedActivity = null;

  @Input() set selectedActivity(activity: UserDefinedActivity){
    this.activity = activity;
  }
  ngOnInit() {

  }

}
