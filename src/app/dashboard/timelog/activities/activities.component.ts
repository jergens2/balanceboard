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

  
  ifNewActivityFormButton: boolean;
  ifNewActivityForm: boolean;


  private activityNameFromForm: string = null;
  allActivitiesList: CategorizedActivity[] = [];
  private rootActivities: CategorizedActivity[] = [];




  ngOnInit() {

    this.ifNewActivityFormButton = true;
    this.ifNewActivityForm = false;

    let activityNameFromForm: string = this.activitiesService.activityNameFromActivityForm;
    if (activityNameFromForm != null) {
      this.activityNameFromForm = activityNameFromForm;
      this.activitiesService.activityNameFromActivityForm = null;
    } else {
      // no activity name was set on the service
    }

    this.activitiesService.rootActivities.subscribe((activities) => {
      this.rootActivities = activities;
      
    })


  }

  onClickCreateNewActivity(){
    this.ifNewActivityForm = true;
    this.ifNewActivityFormButton = false;
  }

  onCloseForm(event){
    this.ifNewActivityForm = false;
    this.ifNewActivityFormButton = true;
  }

  
}
