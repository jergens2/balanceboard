import { Injectable } from '@angular/core';
import { CategorizedActivity } from './categorized-activity.model';
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
      activities = defaultActivities;
    }else{
      console.log("successfully retreieved activities from server");
      return activities;
    }
    console.log("returning", activities);
    return activities;
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
