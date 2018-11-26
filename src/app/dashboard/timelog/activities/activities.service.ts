import { Injectable } from '@angular/core';
import { CategorizedActivity } from './activity/categorized-activity.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { defaultActivities } from './default-activities';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {


  private _activityNameFromActivityForm: string = null;
  private _activities: BehaviorSubject<CategorizedActivity[]> = new BehaviorSubject(this.setActivities());
  

  constructor() {
  }

  private setActivities(): CategorizedActivity[]{
    let activities: CategorizedActivity[] = this.fetchActivities();
    if(activities == null){
      //no activities from server
      return this.buildActivityTree(defaultActivities);
    }else{
      return activities;
    }
  }

  private buildActivityTree(activities: CategorizedActivity[]): CategorizedActivity[] {
    //builds tree and returns the top-level elements
    let topLevelActivities: CategorizedActivity[] = [];

    for (let activity of activities) {
      if (activity.parentActivityId == 'TOP_LEVEL') {
        let topLevelActivity = activity;
        topLevelActivity = this.buildChildActivity(topLevelActivity, activities);
        topLevelActivities.push(topLevelActivity);
      }
    }
    return topLevelActivities;
  }

  private buildChildActivity(activityTreeNode: CategorizedActivity, allActivities: CategorizedActivity[]): CategorizedActivity {
    for (let activity of allActivities) {
      for (let activityId of activityTreeNode.childActivityIds) {
        if (activity.id == activityId) {
          activityTreeNode.addChild(activity);
        }
      }
    }
    if(activityTreeNode.children){
      for(let childNode of activityTreeNode.children){
        childNode = this.buildChildActivity(childNode, allActivities);
      }
    }

    return activityTreeNode;
  }


  private fetchActivities(): CategorizedActivity[]{
    //get activities from backend api
    return null;
  }




  get activities(): Observable<CategorizedActivity[]> {
    return this._activities.asObservable();
  }

  set activityNameFromActivityForm(name: string){
    this._activityNameFromActivityForm = name;
  } 

  get activityNameFromActivityForm(){
    return this._activityNameFromActivityForm;
  }

}
