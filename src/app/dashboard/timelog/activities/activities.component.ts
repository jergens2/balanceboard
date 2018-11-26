import { Component, OnInit } from '@angular/core';
import { ActivitiesService } from './activities.service';
import { CategorizedActivity } from './activity/categorized-activity.model';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  constructor(private activitiesService: ActivitiesService) { }

  private aactivityNameFromForm: string = null;
  private allActivities: CategorizedActivity[] = [];
  private topLevelActivities: CategorizedActivity[] = [];

  ngOnInit() {

    let activityNameFromForm: string = this.activitiesService.activityNameFromActivityForm;
    if (activityNameFromForm != null) {
      this.aactivityNameFromForm = activityNameFromForm;
      this.activitiesService.activityNameFromActivityForm = null;
    } else {
      // no activity name was set on the service
    }

    this.activitiesService.activities.subscribe((activities) => {
      this.allActivities = activities;
      
    })


  }

  
}
