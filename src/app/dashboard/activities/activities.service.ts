import { Injectable } from '@angular/core';
import { UserDefinedActivity } from './user-defined-activity.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { defaultActivities } from './default-activities';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AuthStatus } from '../../authentication/auth-status.model';
import { map } from 'rxjs/operators';
import { ActivityTree } from './activity-tree.model';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  constructor(private httpClient: HttpClient) {}

  private _serverUrl: string = serverUrl;

  private _authStatus: AuthStatus = null;

  private _activityNameFromActivityForm: string = null;

  private _activitiesTree: ActivityTree = null;
  private _activitiesTree$: Subject<ActivityTree> = new Subject();
  get activitiesTree$(): Observable<ActivityTree> {
    return this._activitiesTree$.asObservable();
  }

  


  
  findActivityById(treeId: string): UserDefinedActivity{
    /*
      2019-01-28
      Warning: 

      there is currently no error handling for a certain case / context

      when I renamed categorizedActivity to userDefinedActivity in the server, then requests were being sent to a newly created table, which did not contain
      all of the already defined activities in the previous table, which was called categorizedActivity.

      When that happened, then when this method tried to find, it was unable to find them in the new table because they did not exist in the new table, 
      and it yielded some hard-to-debug errors.

      This leads me to believe that there may come a time when I come back to this method when I am exieriencing app issues where activities cannot be found by ID.

      Example case:  User creates a new definedActivity, then creates timeSegments with that activity, then later deletes this defineActivity.  but the timesegment still exists,
      and will try to do a search for this activity even though it doesn't exist.  currently I don't think there is any handling of that case.

      I think the app will need to handle the management of definedActivities so that if you delete one, all of the timeSegments know its a deleted activity ?

      this might become a bit of a mess if not managed properly

    */
    return this._activitiesTree.findActivityById(treeId);
  }

  login$(authStatus: AuthStatus){
    this._authStatus = authStatus;
    this.fetchActivities();
    return this.activitiesTree$;
  }

  
  private fetchActivities(){
    const getUrl = this._serverUrl + "/api/activity/get/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{message: string, data: Array<any>}>(getUrl, httpOptions)
      .subscribe((response: any) => {
        let responseData = response.data;
        if(responseData.length > 0){
          let allActivities: UserDefinedActivity[] = response.data.map((dataObject) => {
            let newActivity: UserDefinedActivity = new UserDefinedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
            return newActivity
          });
          this._activitiesTree = new ActivityTree(allActivities);
          this._activitiesTree$.next(this._activitiesTree);
        }else{
          this.saveDefaultActivities(defaultActivities)
        }
      });
  }

  saveDefaultActivities(defaultActivities: UserDefinedActivity[]){
    let userDefaultActivities = defaultActivities.map((activity)=>{
      let newTreeId = this._authStatus.user.id + "_" + activity.treeId;
      let newParentTreeId = this._authStatus.user.id + "_" + activity.parentTreeId.replace(" ","_");

      return new UserDefinedActivity(activity.id, this._authStatus.user.id, newTreeId, activity.name, activity.description, newParentTreeId, activity.color);
    })

    const postUrl = this._serverUrl + "/api/activity/createDefault";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string, data: any}>(postUrl, userDefaultActivities, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let newActivity: UserDefinedActivity = new UserDefinedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
          return newActivity
        })
      }))
      .subscribe((allActivities: UserDefinedActivity[])=>{
        this._activitiesTree = new ActivityTree(allActivities);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  saveActivity(activity: UserDefinedActivity){
    let newActivity = activity;
    newActivity.userId = this._authStatus.user.id;

    /*
      TODO:  Eventually need to add a check in here to make sure that treeIds are unique per user.
    */
    newActivity.treeId = this._authStatus.user.id + "_" + activity.name.replace(" ", "_");

    const postUrl = this._serverUrl + "/api/activity/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{message: string, data: any}>(postUrl, activity, httpOptions)
      .pipe<UserDefinedActivity>(map((response)=>{
        let data = response.data;
        let activity = new UserDefinedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return activity;
      }))
      .subscribe((activity: UserDefinedActivity)=>{
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  updateActivity(unsentActivity: UserDefinedActivity){
    const updateUrl = this._serverUrl + "/api/activity/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(updateUrl,unsentActivity, httpOptions)
      .pipe<UserDefinedActivity>(map((response: {message: string, data: any})=>{
        let data = response.data;
        let updatedActivity = new UserDefinedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return updatedActivity;
      }))
      .subscribe((updatedActivity: UserDefinedActivity)=>{
        this._activitiesTree.pruneActivityFromTree(unsentActivity);
        this._activitiesTree.addActivityToTree(updatedActivity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  deleteActivity(activity: UserDefinedActivity){
    const deleteUrl = this._serverUrl + "/api/activity/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(deleteUrl,activity, httpOptions)
      .subscribe((response: {message: string, status: string, data: any})=>{
        if(response.status == "SUCCESS"){
          this._activitiesTree.pruneActivityFromTree(activity);
          this._activitiesTree$.next(this._activitiesTree);
        }
      })
  }




  set activityNameFromActivityForm(name: string){
    this._activityNameFromActivityForm = name;
  } 

  get activityNameFromActivityForm() : string{
    return this._activityNameFromActivityForm;
  }

  
  private logout() {
    this._activitiesTree$.next(null);
  }

}
