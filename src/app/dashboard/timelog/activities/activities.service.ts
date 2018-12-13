import { Injectable } from '@angular/core';
import { CategorizedActivity } from './activity/categorized-activity.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { defaultActivities } from './default-activities';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../../authentication/authentication.service';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) {
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
  private _activitiesTree$: BehaviorSubject<CategorizedActivity[]> = new BehaviorSubject(null);

  
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
          this._activitiesTree$.next(this.buildActivityTree(allActivities));
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
      .subscribe((activities: CategorizedActivity[])=>{
        this._activitiesTree$.next(this.buildActivityTree(activities));
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
        let activities: CategorizedActivity[] = this._activitiesTree$.getValue();
        activities.push(activity);
        this._activitiesTree$.next(this.buildActivityTree(activities));
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
          let activities = this._activitiesTree$.getValue();
          activities = this.removeActivityFromTree(activity, activities);

          this._activitiesTree$.next(activities);
        }
      })
  }

  private removeActivityFromTree(activityRemove: CategorizedActivity, tree: CategorizedActivity[]): CategorizedActivity[]{
    for(let rootActivity of tree){
      rootActivity.removeChild(activityRemove);
    }
    return tree;
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

    // console.log("tree build activities: ", newActivities);

    return rootActivities;
  }

  findChildActivities(activityNode: CategorizedActivity, allActivities: CategorizedActivity[]) : CategorizedActivity{
    for(let activity of allActivities){
      if(activity.parentTreeId == activityNode.treeId){
        activityNode.addChild(activity);
      }
    }
    for(let childNode of activityNode.children){
      childNode = this.findChildActivities(childNode, allActivities);
    }
    return activityNode;
  }


  get activitiesTree$(): Observable<CategorizedActivity[]> {
    return this._activitiesTree$.asObservable();
  }

  set activityNameFromActivityForm(name: string){
    this._activityNameFromActivityForm = name;
  } 

  get activityNameFromActivityForm() : string{
    return this._activityNameFromActivityForm;
  }

  
  private logout() {
    this._activitiesTree$.next([]);
  }

}
