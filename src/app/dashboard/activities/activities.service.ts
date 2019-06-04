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
import { TimelogEntry } from '../daybook/time-log/timelog-entry/timelog-entry.class';
import { TimelogEntryActivityZZ } from '../daybook/time-log/timelog-entry/timelog-entry-activity.class';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

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
  private mergeAndDestroyThisActivity(destroyActivity: UserDefinedActivity, mergeToActivity: UserDefinedActivity){
    //todo: implement
  } 
  
  
  */
  
  
  // getActivityData(activity: UserDefinedActivity): Observable<TimelogEntry[]> {
  //   /*
  //     This method grabs activity data from the server to display over a period of time, 
  //     e.g. over a six week view.
  //   */
  //   const getUrl = this._serverUrl + "/api/timelogEntry/activity_data/" + activity.treeId;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //       // 'Authorization': 'my-auth-token'  
  //     })
  //   };
  //   return this.httpClient.get<{ message: string, data: Array<any> }>(getUrl, httpOptions)
  //     .pipe<TimelogEntry[]>(
  //       map((response) => {
  //         return response.data.map((dataObject) => {
  //           let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description, this);
  //           timelogEntry.activities = this.buildTimelogEntryActivities(dataObject.activities);
  //           return timelogEntry;
  //         })
  //       })
  //     );
  // }

  // private buildTimelogEntryActivities(activitiesData: Array<{ activityTreeId: string, duration: number, description: string }>): TimelogEntryActivityZZ[] {
  //   return activitiesData.map((activity) => {
  //     let timelogEntryActivity: TimelogEntryActivityZZ = new TimelogEntryActivityZZ(this.findActivityByTreeId(activity.activityTreeId), activity.description);
  //     return timelogEntryActivity;
  //   })
  // }


  findActivityByTreeId(treeId: string): UserDefinedActivity {
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

  login$(authStatus: AuthStatus) {
    this._authStatus = authStatus;
    this.fetchActivities();
    return this.activitiesTree$;
  }

  logout() {
    this._authStatus = null;
    this._activitiesTree$.next(null);
  }


  private fetchActivities() {
    const getUrl = this._serverUrl + "/api/activity/get/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: Array<any> }>(getUrl, httpOptions)
      .subscribe((response: any) => {
        // console.log("response is ", response);
        let responseData = response.data;
        if (responseData.length > 0) {
          let allActivities: UserDefinedActivity[] = response.data.map((dataObject) => {
            let newActivity: UserDefinedActivity = new UserDefinedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
            return newActivity
          });
          this._activitiesTree = new ActivityTree(allActivities);
          // console.log("nexting ", this._activitiesTree);
          this._activitiesTree$.next(this._activitiesTree);
        } else {
          // console.log("response data was 0 or less... creating default activities")
          this.saveDefaultActivities(defaultActivities)
        }
      });
  }

  saveDefaultActivities(defaultActivities: UserDefinedActivity[]) {
    let userDefaultActivities = defaultActivities.map((activity) => {
      let newTreeId = this._authStatus.user.id + "_" + activity.treeId;
      let newParentTreeId = this._authStatus.user.id + "_" + activity.parentTreeId.replace(" ", "_");

      return new UserDefinedActivity(activity.id, this._authStatus.user.id, newTreeId, activity.name, activity.description, newParentTreeId, activity.color);
    })

    const postUrl = this._serverUrl + "/api/activity/createDefault";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, userDefaultActivities, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let newActivity: UserDefinedActivity = new UserDefinedActivity(dataObject._id, dataObject.userId, dataObject.treeId, dataObject.name, dataObject.description, dataObject.parentTreeId, dataObject.color)
          return newActivity
        })
      }))
      .subscribe((allActivities: UserDefinedActivity[]) => {
        this._activitiesTree = new ActivityTree(allActivities);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  saveActivity(activity: UserDefinedActivity) {
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

    this.httpClient.post<{ message: string, data: any }>(postUrl, activity, httpOptions)
      .pipe<UserDefinedActivity>(map((response) => {
        let data = response.data;
        let activity = new UserDefinedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return activity;
      }))
      .subscribe((activity: UserDefinedActivity) => {
        this._activitiesTree.addActivityToTree(activity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  updateActivity(unsentActivity: UserDefinedActivity) {
    const updateUrl = this._serverUrl + "/api/activity/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(updateUrl, unsentActivity, httpOptions)
      .pipe<UserDefinedActivity>(map((response: { message: string, data: any }) => {
        let data = response.data;
        let updatedActivity = new UserDefinedActivity(data._id, data.userId, data.treeId, data.name, data.description, data.parentTreeId, data.color);
        return updatedActivity;
      }))
      .subscribe((updatedActivity: UserDefinedActivity) => {
        this._activitiesTree.pruneActivityFromTree(unsentActivity);
        this._activitiesTree.addActivityToTree(updatedActivity);
        this._activitiesTree$.next(this._activitiesTree);
      })
  }

  deleteActivity(activity: UserDefinedActivity) {
    const deleteUrl = this._serverUrl + "/api/activity/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(deleteUrl, activity, httpOptions)
      .subscribe((response: { message: string, status: string, data: any }) => {
        if (response.status == "SUCCESS") {
          this._activitiesTree.pruneActivityFromTree(activity);
          this._activitiesTree$.next(this._activitiesTree);
        }
      })
  }


}
