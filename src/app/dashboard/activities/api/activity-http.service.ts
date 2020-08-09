import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './activity-category-definition.class';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ActivityTree } from './activity-tree.class';
import { Guid } from '../../../shared/utilities/guid.class';
import { ActivityBuilder } from './activity-builder.class';

@Injectable({
  providedIn: 'root'
})
export class ActivityHttpService {

  constructor(private httpClient: HttpClient) { }

  private _userId: string = '';
  private _activityTree$: BehaviorSubject<ActivityTree> = new BehaviorSubject(null);

  public get userId(): string { return this._userId; }
  public get activityTree(): ActivityTree { return this._activityTree$.getValue(); }
  public get activityTree$(): Observable<ActivityTree> { return this._activityTree$.asObservable(); }
  public findActivityByTreeId(id: string) { return this.activityTree.findActivityByTreeId(id); }

  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    const isComplete$: Subject<boolean> = new Subject();
    this._fetchActivitiesHttp$(this._userId)
      .subscribe({
        next: activities => {
          this._activityTree$.next(new ActivityTree(activities));
          isComplete$.next(true);
        },
        error: e => console.log("Error", e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }
  public logout() {
    this._userId = '';
    this._activityTree$.next(null);
  }

  private _fetchActivitiesHttp$(userId): Observable<ActivityCategoryDefinition[]> {
    const getUrl = serverUrl + "/api/activity-category-definition/get/" + userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: Array<any> }>(getUrl, httpOptions)
      .pipe<ActivityCategoryDefinition[]>(map((response) => {
        return (response.data as any[]).map((dataObject) => {
          return this._buildActivityFromResponse(dataObject);
        });
      }));
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
        const tree = this.activityTree;
        tree.addActivityToTree(activity);
        this._activityTree$.next(tree);
        saveActivityComplete$.next(activity);
      });
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
        const tree = this.activityTree;
        tree.addActivityToTree(activity);
        this._activityTree$.next(tree);
      });
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
        const tree = this.activityTree;
        tree.pruneActivityFromTree(unsentActivity);
        tree.addActivityToTree(updatedActivity);
        this._activityTree$.next(tree);
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
        const tree = this.activityTree;
        tree.pruneActivityFromTree(activity);
        this._activityTree$.next(tree);
      } else {
        console.log("Error with deleting activity definition.");
      }
      isComplete$.next(true);
    });
    return isComplete$.asObservable();
  }


  private _buildActivityFromResponse(data: any): ActivityCategoryDefinition { return new ActivityBuilder(data).constructedActivity; }

}
