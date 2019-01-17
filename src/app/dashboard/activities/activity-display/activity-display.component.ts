import { Component, OnInit, Input } from '@angular/core';
import { CategorizedActivity } from '../categorized-activity.model';

@Component({
  selector: 'app-activity-display',
  templateUrl: './activity-display.component.html',
  styleUrls: ['./activity-display.component.css']
})
export class ActivityDisplayComponent implements OnInit {

  constructor() { }

  activity: CategorizedActivity = null;

  @Input() set selectedActivity(activity: CategorizedActivity){
    this.activity = activity;
  }
  ngOnInit() {

  }

}
