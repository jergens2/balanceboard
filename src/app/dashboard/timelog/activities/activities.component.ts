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
  // allActivitiesList: CategorizedActivity[] = [];
  private allActivities: CategorizedActivity[] = [];
  rootActivities: CategorizedActivity[] = [];



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
      console.log("activities subscription:", activities)
      if(activities != null){
        this.allActivities = activities;
        this.rootActivities = this.buildActivityTree(this.allActivities);
        console.log(this.allActivities);
      }
      
    })


  }

  
  private buildActivityTree(allActivities: CategorizedActivity[]): CategorizedActivity[] {
    /*
        Returns an array of root-level activities.  each root-level activity object will have its children property populatated, recursively.
    */
    let rootActivities: CategorizedActivity[] = [];

    for(let activity of allActivities){
      if(activity.parentTreeId.endsWith("TOP_LEVEL")){
        rootActivities.push(activity)
      }
    }

    for(let rootActivity of rootActivities){
      rootActivity = this.findChildActivities(rootActivity, allActivities);
    }

    console.log("root activities: ", rootActivities);

    return rootActivities;
  }

  findChildActivities(activityNode: CategorizedActivity, allActivities: CategorizedActivity[]) : CategorizedActivity{
    for(let activity of allActivities){
      if(activity.parentTreeId == activityNode.treeId){
        activityNode.addChild(activity);
      }
    }
    for(let childNode of activityNode.children){
      this.findChildActivities(childNode, allActivities);
    }
    return activityNode;
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
