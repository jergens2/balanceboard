import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { map } from 'rxjs/operators';
import { ActivityTree } from './activity-tree.class';
import { Guid } from '../../../shared/utilities/guid.class';
import { ServiceAuthenticates } from '../../../authentication/service-authentication-garbage/service-authenticates.interface';
import { ActivityCategoryDefinitionHttpShape } from './activity-category-definition-http-shape.interface';
import { DefaultActivityCategoryDefinitions } from './default-activity-category-definitions.class';
import { ServiceAuthenticationAttempt } from '../../../authentication/service-authentication-garbage/service-authentication-attempt.interface';
@Injectable({
  providedIn: 'root'
})
export class ActivityCategoryDefinitionService  {

  constructor(private httpClient: HttpClient) { }

  private _serverUrl: string = serverUrl;

  private _userId: string = "";

  private _activitiesTree: ActivityTree = null;
  private _activitiesTree$: BehaviorSubject<ActivityTree> = new BehaviorSubject<ActivityTree>(null);

  get activitiesTree$(): Observable<ActivityTree> {
    return this._activitiesTree$.asObservable();
  }
  get activitiesTree(): ActivityTree {
    return this._activitiesTree;
  }

  get userId(): string {
    return this._userId;
  }

  /*
  private mergeAndDestroyThisActivity(destroyActivity: ActivityCategoryDefinition, mergeToActivity: ActivityCategoryDefinition){
    //todo: implement
  } 
  
  
  */


  findActivityByTreeId(treeId: string): ActivityCategoryDefinition {
    return this._activitiesTree.findActivityByTreeId(treeId);
  }

  public loginComplete$: Subject<boolean> = new Subject();

  public synchronousLogin(userId: string) { return false; }
  login$(userId: string): Observable<boolean> {
    this._userId = userId;
    // this._loginComplete$.next({
    //   authenticated: true,
    //   message: 'Successfully logged in to DaybookHttpRequestService',
    // });
    // return this._loginComplete$.asObservable();

    this.fetchActivities();
    return this.loginComplete$.asObservable();
  }

  logout() {
    this._userId = null;
    this._activitiesTree$.next(null);
  }




  private fetchActivities() {
    const getUrl = this._serverUrl + "/api/activity-category-definition/get/" + this._userId;
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
          this.loginComplete$.next(true);
        } else if (activities.length == 0) {
          // console.log("response data was 0 or less... creating default activities")
          this.saveDefaultActivities(DefaultActivityCategoryDefinitions.defaultActivities(this.userId));
        }

      },(error)=>{
        console.log("Error fetching activities", error);
        this.loginComplete$.next(false);
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
        this.loginComplete$.next(true);
      })
  }


  public saveActivity$(activity: ActivityCategoryDefinition): Observable<ActivityCategoryDefinition> {
    let saveActivityComplete$: Subject<ActivityCategoryDefinition> = new Subject();
    let newActivity = activity;
    newActivity.userId = this._userId;
    newActivity.treeId = this._userId + "_" + Guid.newGuid();
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
    newActivity.userId = this._userId;
    newActivity.treeId = this._userId + "_" + Guid.newGuid();
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
      });
  }


  private buildActivityFromResponse(data: any): ActivityCategoryDefinition {
    const properties: string[] = [ 
        "_id", 
        "userId", 
        "treeId", 
        "parentTreeId", 
        "name", 
        "description", 
        "color", 
        "icon", 
        "isRootLevel",
        "isSleepActivity",
        "canDelete",
        "durationSetting", 
        "specifiedDurationMinutes", 
        "scheduleRepititions",
        "currentPointsConfiguration", 
        "pointsConfigurationHistory",
        "isRoutine",
        "routineMembersActivityIds", 
        "isConfigured",
    ];
  
    
    let dataErrors: boolean = false;
    properties.forEach(property => {
      if(!(property in data)){
        console.log("Error with activity data object: missing property: " , property); 
        dataErrors = true;
      }
    });
    // console.log("Warning: manual overriding")
    // dataErrors = false;
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
        isRootLevel: data.isRootLevel,
        isSleepActivity: data.isSleepActivity,
        canDelete: data.canDelete,
        durationSetting: data.durationSetting,
        specifiedDurationMinutes: data.specifiedDurationMinutes,
        scheduleRepititions: data.scheduleRepititions,
        currentPointsConfiguration: data.currentPointsConfiguration,
        pointsConfigurationHistory: data.pointsConfigurationHistory,
        isConfigured: data.isConfigured,
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
