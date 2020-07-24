import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ActivityTree } from './activity-tree.class';
import { Guid } from '../../../shared/utilities/guid.class';
import { ActivityCategoryDefinitionHttpShape } from './activity-category-definition-http-shape.interface';
import { DefaultActivityCategoryDefinitions } from './default-activity-category-definitions.class';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ActivityBuilder } from './activity-builder.class';
@Injectable({
  providedIn: 'root'
})
export class ActivityCategoryDefinitionService {

  constructor(private httpClient: HttpClient) { }

  private _userId: string = "";
  private _activitiesTree: ActivityTree = null;
  private _activitiesTree$: Subject<ActivityTree> = new Subject<ActivityTree>();

  private _loginComplete$: Subject<boolean> = new Subject();


  get activitiesTree$(): Observable<ActivityTree> {return this._activitiesTree$.asObservable();}
  get activitiesTree(): ActivityTree {return this._activitiesTree;}
  get userId(): string {return this._userId;}

  /*
  private mergeAndDestroyThisActivity(destroyActivity: ActivityCategoryDefinition, mergeToActivity: ActivityCategoryDefinition){
    //todo: implement
  } 
  
  
  */


  public findActivityByTreeId(treeId: string): ActivityCategoryDefinition {
    return this._activitiesTree.findActivityByTreeId(treeId);
  }



  public synchronousLogin(userId: string) { return false; }
  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    // this._loginComplete$.next({
    //   authenticated: true,
    //   message: 'Successfully logged in to DaybookHttpRequestService',
    // });
    // return this._loginComplete$.asObservable();

    this._fetchActivities();
    return this._loginComplete$.asObservable();
  }

  public logout() {
    this._userId = null;
    this._activitiesTree$.next(null);
  }




  private _fetchActivities() {
    const getUrl = serverUrl + "/api/activity-category-definition/get/" + this._userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: Array<any> }>(getUrl, httpOptions)
      .pipe<ActivityCategoryDefinition[]>(map((response) => {
        return (response.data as any[]).map((dataObject) => {
          return this._buildActivityFromResponse(dataObject);
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

      }, (error) => {
        console.log("Error fetching activities", error);
        this._loginComplete$.next(false);
      });
  }

  public saveDefaultActivities(defaultActivities: ActivityCategoryDefinition[]) {
    const postUrl = serverUrl + "/api/activity-category-definition/createDefault";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, defaultActivities.map((activity) => { return activity.httpShape; }), httpOptions)
      .pipe<ActivityCategoryDefinition[]>(map((response) => {
        return (response.data as any[]).map((dataObject) => {
          let activity: ActivityCategoryDefinition = this._buildActivityFromResponse(dataObject);
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
    newActivity.userId = this._userId;
    newActivity.treeId = this._userId + "_" + Guid.newGuid();
    const postUrl = serverUrl + "/api/activity-category-definition/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, newActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response) => {
        return this._buildActivityFromResponse(response.data);
      }))
      .subscribe((activity: ActivityCategoryDefinition) => {
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
        saveActivityComplete$.next(activity);
      })
    return saveActivityComplete$.asObservable();
  }

  public saveActivity(activity: ActivityCategoryDefinition) {
    let newActivity = activity;
    newActivity.userId = this._userId;
    newActivity.treeId = this._userId + "_" + Guid.newGuid();
    const postUrl = serverUrl + "/api/activity-category-definition/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, newActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response) => {
        return this._buildActivityFromResponse(response.data);
      }))
      .subscribe((activity: ActivityCategoryDefinition) => {
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  public updateActivity$(unsentActivity: ActivityCategoryDefinition): Observable<boolean> {
    const updateUrl = serverUrl + "/api/activity-category-definition/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const isComplete$: Subject<boolean> = new Subject();
    this.httpClient.post(updateUrl, unsentActivity.httpShape, httpOptions)
      .pipe<ActivityCategoryDefinition>(map((response: { message: string, data: any }) => {
        return this._buildActivityFromResponse(response.data);
      }))
      .subscribe((updatedActivity: ActivityCategoryDefinition) => {
        this._activitiesTree.pruneActivityFromTree(unsentActivity);
        this._activitiesTree.addActivityToTree(updatedActivity);
        this._activitiesTree$.next(this._activitiesTree);
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }



  /**
    2020-07-18
    
    Warning: this method works but there is a flaw:  if this activity has children, only this activity is deleted, and not its children
    what happens then is that the children still exist as objects in the database because they were not explicitly destroyed.  
    then every time all activities for a user are fetched, those parentless child activities are fetched but never displayed and are unusable and inaccessible.
    
    as a temporary solution, the front end prevents the deletion of any activity that has children - the delete button is only available if the activity has no children.

*/
  public permanentlyDeleteActivity$(activity: ActivityCategoryDefinition): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const deleteUrl = serverUrl + "/api/activity-category-definition/permanently-delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, success: boolean, data: any }>(deleteUrl, activity.httpShape, httpOptions).subscribe((response) => {
      if (response.success === true) {
        this._activitiesTree.pruneActivityFromTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
      } else {
        console.log("Error with deleting activity definition.");
      }
      isComplete$.next(true);
    });
    return isComplete$.asObservable();
  }


  private _buildActivityFromResponse(data: any): ActivityCategoryDefinition { return new ActivityBuilder(data).constructedActivity; }

}
