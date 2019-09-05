import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { map } from 'rxjs/operators';
import { ActivityTree } from './activity-tree.class';
import { Guid } from '../../../shared/utilities/guid.class';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { ActivityCategoryDefinitionHttpShape } from './activity-category-definition-http-shape.interface';
import { DefaultActivityCategoryDefinitions } from './default-activity-category-definitions.class';
@Injectable({
  providedIn: 'root'
})
export class ActivityCategoryDefinitionService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient) { }

  private _serverUrl: string = serverUrl;

  private _authStatus: AuthStatus = null;

  private _activitiesTree: ActivityTree = null;
  private _activitiesTree$: BehaviorSubject<ActivityTree> = new BehaviorSubject<ActivityTree>(null);

  get activitiesTree$(): Observable<ActivityTree> {
    return this._activitiesTree$.asObservable();
  }
  get activitiesTree(): ActivityTree {
    return this._activitiesTree;
  }

  get userId(): string {
    return this._authStatus.user.id;
  }

  /*
  private mergeAndDestroyThisActivity(destroyActivity: ActivityCategoryDefinition, mergeToActivity: ActivityCategoryDefinition){
    //todo: implement
  } 
  
  
  */


  findActivityByTreeId(treeId: string): ActivityCategoryDefinition {
    /*
      2019-01-28
      Warning: 

      there is currently no error handling for a certain case / context

      when I renamed categorizedActivity to userDefinedActivity in the server, then requests were being sent to a newly created table, which did not contain
      all of the already defined activities in the previous table, which was called categorizedActivity.

      When that happened, then when this method tried to find, it was unable to find them in the new table because they did not exist in the new table, 
      and it yielded some hard-to-debug errors.

      This leads me to believe that there may come a time when I come back to this method when I am exieriencing app issues where activities cannot be found by ID.

      Example case:  User creates a new definedActivity, then creates timelogEntrys with that activity, then later deletes this defineActivity.  but the timelog Entry still exists,
      and will try to do a search for this activity even though it doesn't exist.  currently I don't think there is any handling of that case.

      I think the app will need to handle the management of definedActivities so that if you delete one, all of the timelogEntrys know its a deleted activity ?

      this might become a bit of a mess if not managed properly

    */
    // console.log("finding activity by treeId", treeId);
    return this._activitiesTree.findActivityByTreeId(treeId);
  }

  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus) {
    this._authStatus = authStatus;
    this.fetchActivities();
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._activitiesTree$.next(null);
  }




  private fetchActivities() {
    const getUrl = this._serverUrl + "/api/activity-category-definition/get/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: Array<any> }>(getUrl, httpOptions)
      .pipe<ActivityCategoryDefinition[]>(map((response) => {
        return (response.data as any[]).map((dataObject) => {
          return this.buildActivityFromResponse(dataObject);
        });
      }))
      .subscribe((activities: ActivityCategoryDefinition[]) => {

        if (activities.length > 0) {
          this._activitiesTree = new ActivityTree(activities);
          // console.log("nexting ", this._activitiesTree);
          this._activitiesTree$.next(this._activitiesTree);
          this._loginComplete$.next(true);
        } else if (activities.length == 0) {
          // console.log("response data was 0 or less... creating default activities")
          this.saveDefaultActivities(DefaultActivityCategoryDefinitions.defaultActivities(this.userId));
        }

      });
  }

  saveDefaultActivities(defaultActivities: ActivityCategoryDefinition[]) {
    const postUrl = this._serverUrl + "/api/activity-category-definition/createDefault";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, defaultActivities.map((activity)=> {return activity.httpShape; }), httpOptions)
      .pipe<ActivityCategoryDefinition[]>(map((response) => {
        return (response.data as any[]).map((dataObject) => {
          let activity: ActivityCategoryDefinition = this.buildActivityFromResponse(dataObject);
          return activity;
        });
      }))
      .subscribe((allActivities: ActivityCategoryDefinition[]) => {
        this._activitiesTree = new ActivityTree(allActivities);
        this._activitiesTree$.next(this._activitiesTree);
        this._loginComplete$.next(true);
      })
  }


  public saveActivity$(activity: ActivityCategoryDefinition): Observable<ActivityCategoryDefinition> {
    let saveActivityComplete$: Subject<ActivityCategoryDefinition> = new Subject();
    let newActivity = activity;
    newActivity.userId = this._authStatus.user.id;
    newActivity.treeId = this._authStatus.user.id + "_" + Guid.newGuid();
    const postUrl = this._serverUrl + "/api/activity-category-definition/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, newActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response) => {
        return this.buildActivityFromResponse(response.data);
      }))
      .subscribe((activity: ActivityCategoryDefinition) => {
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
        saveActivityComplete$.next(activity);
      })
    return saveActivityComplete$.asObservable();
  }

  saveActivity(activity: ActivityCategoryDefinition) {
    let newActivity = activity;
    newActivity.userId = this._authStatus.user.id;
    newActivity.treeId = this._authStatus.user.id + "_" + Guid.newGuid();
    const postUrl = this._serverUrl + "/api/activity-category-definition/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, newActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response) => {
        return this.buildActivityFromResponse(response.data);
      }))
      .subscribe((activity: ActivityCategoryDefinition) => {
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  updateActivity(unsentActivity: ActivityCategoryDefinition) {
    const updateUrl = this._serverUrl + "/api/activity-category-definition/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(updateUrl, unsentActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response: { message: string, data: any }) => {
        return this.buildActivityFromResponse(response.data);
      }))
      .subscribe((updatedActivity: ActivityCategoryDefinition) => {
        this._activitiesTree.pruneActivityFromTree(unsentActivity);
        this._activitiesTree.addActivityToTree(updatedActivity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  deleteActivity(activity: ActivityCategoryDefinition) {
    const deleteUrl = this._serverUrl + "/api/activity-category-definition/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(deleteUrl, activity.httpShape, httpOptions)
      .subscribe((response: { message: string, status: string, data: any }) => {
        if (response.status == "SUCCESS") {
          this._activitiesTree.pruneActivityFromTree(activity);
          this._activitiesTree$.next(this._activitiesTree);
        }
      })
  }


  private buildActivityFromResponse(data: any): ActivityCategoryDefinition {
    const properties: string[] = [ "_id", "userId", "treeId", "parentTreeId", 
      "name", "description", "color", "icon", "durationSetting", 
      "specifiedDurationMinutes", "targets",
      "scheduleConfiguration", "isRoutine",
      "routineMembersActivityIds", "isConfigured",
    ];
  
    
    let dataErrors: boolean = false;
    properties.forEach(property => {
      if(!(property in data)){
        console.log("Error with activity data object: missing property: " , property); 
        dataErrors = true;
      }
    });
    if(!dataErrors){
      let buildActivityHttpShape: ActivityCategoryDefinitionHttpShape = {
        _id: data._id,
        userId: data.userId,
        treeId: data.treeId,
        parentTreeId: data.parentTreeId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        durationSetting: data.durationSetting,
        specifiedDurationMinutes: data.specifiedDurationMinutes,
        targets: data.targets,
        isConfigured: data.isConfigured,
        scheduleConfiguration: data.scheduleConfiguration,
        isRoutine: data.isRoutine,
        routineMembersActivityIds: data.routineMembersActivityIds,
      }
      return new ActivityCategoryDefinition(buildActivityHttpShape);
    }else{
      console.log("Activity is not built because of missing property.");
      return null;
    }
  }

}
