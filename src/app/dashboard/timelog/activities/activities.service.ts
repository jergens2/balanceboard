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
  private _allUserActivities$: BehaviorSubject<CategorizedActivity[]> = new BehaviorSubject(null);



  
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
          this._allUserActivities$.next(allActivities);
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
        this._allUserActivities$.next(activities);
      })
  }

  saveActivity(activity: CategorizedActivity){
    console.log(activity)
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

    // this.httpClient.post<any>(postUrl, activity, httpOptions)
    //   .subscribe((httpRequest)=>{
    //     console.log("from http post request, ", httpRequest)
    //   })
    /*
let newTimeMark: TimeMark = timeMark;
    newTimeMark.userId = this.authService.authenticatedUser.id;
    const postUrl = this.serverUrl + "/api/timeMark/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, newTimeMark, httpOptions)
      .pipe<TimeMark>(map((response) => {
        let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO);
        timeMark.precedingTimeMarkId = response.data.precedingTimeMarkId;
        timeMark.followingTimeMarkId = response.data.followingTimeMarkId;
        timeMark.description = response.data.description;
        timeMark.activities = response.data.activities as CategorizedActivity[];
        return timeMark;
      }))
      .subscribe((timeMark: TimeMark) => {
        let timeMarks: TimeMark[] = this._timeMarksSubject$.getValue();
        timeMarks.push(timeMark);

        this._timeMarksSubject$.next(timeMarks);
        this.updatePrecedingTimeMark(timeMark);
      })

    */
  }




  get rootActivities(): Observable<CategorizedActivity[]> {
    return this._allUserActivities$.asObservable();
  }

  set activityNameFromActivityForm(name: string){
    this._activityNameFromActivityForm = name;
  } 

  get activityNameFromActivityForm() : string{
    return this._activityNameFromActivityForm;
  }

  
  private logout() {
    this._allUserActivities$.next([]);
  }

}
