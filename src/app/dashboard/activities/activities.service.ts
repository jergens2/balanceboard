import { Injectable } from '@angular/core';
import { CategorizedActivity } from './categorized-activity.model';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) {
    console.log("activities service constructor");
    authService.authStatus.subscribe((authStatus: AuthStatus) => {
      if (authStatus.isAuthenticated) {
        this.fetchActivities();
      } else {
        this.logout();
      }
    });
    
  }

  private serverUrl: string = serverUrl;
  private _activityNameFromActivityForm: string = null;
  private _activitiesTree$: BehaviorSubject<ActivityTree> = new BehaviorSubject(null);

  findActivityById(treeId: string): CategorizedActivity{
    return this._activitiesTree$.getValue().findActivityById(treeId);
  }



  
  private fetchActivities(){
    const getUrl = this.serverUrl + "/api/activity/get/" + this.authService.authenticatedUser.id;
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
          let allActivities: CategorizedActivity[] = response.data.map((dataObject) => {
            let newActivity: CategorizedActivity = new CategorizedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
            return newActivity
          });
          let tree: ActivityTree = new ActivityTree(allActivities);
          this._activitiesTree$.next(tree);
        }else{
          this.saveDefaultActivities(defaultActivities)
        }
      });
  }

  saveDefaultActivities(defaultActivities: CategorizedActivity[]){
    let userDefaultActivities = defaultActivities.map((activity)=>{
      let newTreeId = this.authService.authenticatedUser.id + "_" + activity.treeId;
      let newParentTreeId = this.authService.authenticatedUser.id + "_" + activity.parentTreeId.replace(" ","_");

      return new CategorizedActivity(activity.id, this.authService.authenticatedUser.id, newTreeId, activity.name, activity.description, newParentTreeId, activity.color);
    })

    const postUrl = this.serverUrl + "/api/activity/createDefault";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string, data: any}>(postUrl, userDefaultActivities, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let newActivity: CategorizedActivity = new CategorizedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
          return newActivity
        })
      }))
      .subscribe((allActivities: CategorizedActivity[])=>{
        let tree: ActivityTree = new ActivityTree(allActivities);
        this._activitiesTree$.next(tree);
      })
  }

  saveActivity(activity: CategorizedActivity){
    let newActivity = activity;
    newActivity.userId = this.authService.authenticatedUser.id;

    /*
      TODO:  Eventually need to add a check in here to make sure that treeIds are unique per user.
    */
    newActivity.treeId = this.authService.authenticatedUser.id + "_" + activity.name.replace(" ", "_");

    const postUrl = this.serverUrl + "/api/activity/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{message: string, data: any}>(postUrl, activity, httpOptions)
      .pipe<CategorizedActivity>(map((response)=>{
        let data = response.data;
        let activity = new CategorizedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return activity;
      }))
      .subscribe((activity: CategorizedActivity)=>{
        let activityTree: ActivityTree = this._activitiesTree$.getValue();
        activityTree.addActivityToTree(activity);
        this._activitiesTree$.next(activityTree);
      })
  }

  updateActivity(unsentActivity: CategorizedActivity){
    const updateUrl = this.serverUrl + "/api/activity/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(updateUrl,unsentActivity, httpOptions)
      .pipe<CategorizedActivity>(map((response: {message: string, data: any})=>{
        let data = response.data;
        let updatedActivity = new CategorizedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return updatedActivity;
      }))
      .subscribe((updatedActivity: CategorizedActivity)=>{
        let activityTree: ActivityTree = this._activitiesTree$.getValue();
        activityTree.pruneActivityFromTree(unsentActivity);
        activityTree.addActivityToTree(updatedActivity);
        this._activitiesTree$.next(activityTree);
      })
  }

  deleteActivity(activity: CategorizedActivity){
    const deleteUrl = this.serverUrl + "/api/activity/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(deleteUrl,activity, httpOptions)
      .subscribe((response: {message: string, status: string, data: any})=>{
        if(response.status == "SUCCESS"){
          let activityTree: ActivityTree = this._activitiesTree$.getValue();
          activityTree.pruneActivityFromTree(activity);
          this._activitiesTree$.next(activityTree);
        }
      })
  }




  get activitiesTree$(): Observable<ActivityTree> {
    return this._activitiesTree$.asObservable();
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
