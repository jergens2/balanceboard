import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimeMark } from './time-mark.model';
import { CategorizedActivity } from './categorized-activity.model';

import * as moment from 'moment';

import { serverUrl } from '../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../authentication/auth-status.model';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) {
    authService.authStatus.subscribe((authStatus: AuthStatus) => {
      if (authStatus.isAuthenticated) {
        this.fetchTimeMarks(authStatus.user.id, moment().startOf('day').toISOString(), moment().endOf('day').toISOString());
      } else {
        this.logout();
      }
    })
  }

  private serverUrl: string = serverUrl;

  private _timeMarksSubject: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>([]); 
  private _currentDate: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
  private _latestTimeMark: TimeMark;
  
  get timeMarks(): Observable<TimeMark[]> {
    return this._timeMarksSubject.asObservable();
  }
  get currentDate(): Observable<moment.Moment> {
    return this._currentDate.asObservable();
  }
  setCurrentDate(newDate: moment.Moment){
    this._currentDate.next(newDate);
  }
  
  get latestTimeMark(): TimeMark {
    if(this._latestTimeMark){
      return this._latestTimeMark;
    }
    let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
    if(timeMarks){
      let tempTimeMark = timeMarks[0];
      for(let timeMark of timeMarks){
        if(timeMark.timeISO > tempTimeMark.timeISO){
          tempTimeMark = timeMark;
        }
      }
      return tempTimeMark;
    }else{
      return null;
    }
  }
  setLatestTimeMark(latestTimeMark: TimeMark){
    this._latestTimeMark = latestTimeMark;
  }

  saveTimeMark(timeMark: TimeMark) {
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
        let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.timeISO, null, null);
        timeMark.precedingTimeMarkId = response.data.precedingTimeMarkId;
        timeMark.followingTimeMarkId = response.data.followingTimeMarkId;
        timeMark.description = response.data.description;
        timeMark.activities = response.data.activities as CategorizedActivity[];
        return timeMark;
      }))
      .subscribe((timeMark: TimeMark) => {
        let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
        timeMarks.push(timeMark);
        this.setLatestTimeMark(timeMark);
        this._timeMarksSubject.next(timeMarks);
        this.updatePrecedingTimeMark(timeMark);
      })
  }
  private updatePrecedingTimeMark(latestTimeMark: TimeMark){
    /*
      2018-11-11
      The way this is currently designed is that whenever a new timeMark is made, it is first sent to the backend to be saved in the DB.
      When new timeMark is returned to this front end, then this front end then executes this private function to send another request
      to the back end to update the preceding timeMark of our recently saved timeMark, 
      for the purpose of updating its field 'followingTimeMarkId' to point to our recently created timeMark.

      Perhaps it would maybe make more sense to do both updates on the back end at the same time?  I'm not sure.
    */
    let precedingTimeMarkId = latestTimeMark.precedingTimeMarkId;
    let precedingTimeMark: TimeMark;
    let currentTimeMarks = this._timeMarksSubject.getValue();

    precedingTimeMark = currentTimeMarks.find((timeMark)=>{
      return timeMark.id == precedingTimeMarkId;
    });
    precedingTimeMark.followingTimeMarkId = latestTimeMark.id;
    const postUrl = this.serverUrl + "/api/timeMark/update/" + precedingTimeMark.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, precedingTimeMark, httpOptions)
      .pipe<TimeMark>(map((response) => {
        let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.timeISO, null, null);
        timeMark.precedingTimeMarkId = response.data.precedingTimeMarkId;
        timeMark.followingTimeMarkId = response.data.followingTimeMarkId;
        timeMark.description = response.data.description;
        timeMark.activities = response.data.activities as CategorizedActivity[];
        return timeMark;
      }))
      .subscribe((updatedTimeMark: TimeMark) => {
        let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
        let precedingTimeMarkIndex = timeMarks.findIndex((timeMark)=>{
          return timeMark.id == updatedTimeMark.id;
        })
        timeMarks[precedingTimeMarkIndex] = updatedTimeMark;
        this._timeMarksSubject.next(timeMarks);
      })

  }

  deleteTimeMark(timeMark: TimeMark){
    /*
      2018-11-11  
      To do: unresolved issue: if timeMark get's deleted, we need to update other time Marks in the DB?
      For example, there are 3 sequential time marks A, B, C
      A points to next which is B, B points back to A and forward to C, and C points backward to B.

      timeMark B gets deleted(), but A is still pointing to what used to be B but B no longer exists, and similar with C.

      Doesn't really break the app, but does mean that timeMarks are pointing to non-existing items.

      How to fix?  Should A and C just start pointing to each other then?
        What about the time gap that is left now that B has been deleted?  

    */
    // console.log("TimeLogService: deleteTimeMark() function disabled");
    

    const postUrl = this.serverUrl + "/api/timeMark/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, timeMark, httpOptions)
    // .pipe(map((response) => {
    //   let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.timeISO);
    //   timeMark.description = response.data.description;
    //   timeMark.activities = response.data.activities as CategorizedActivity[];
    //   return timeMark;
    // }))
    .subscribe((response) => {
      let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
      timeMarks.splice(timeMarks.indexOf(timeMark),1);
      this.setLatestTimeMark(null);
      this._timeMarksSubject.next(timeMarks);
    })
    
  }

  private fetchTimeMarks(authenticatedUserId: string, startTime: string, endTime: string) {
    const getUrl = this.serverUrl + "/api/timeMark/" + authenticatedUserId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timeMark = new TimeMark(dataObject._id, dataObject.userId, dataObject.timeISO, null, null);
          timeMark.description = dataObject.description;
          timeMark.activities = dataObject.activities as CategorizedActivity[];
          return timeMark;
        })
      }))
      .subscribe((timeMarks: TimeMark[]) => {
        this._timeMarksSubject.next(timeMarks);
      });

  }


  private logout() {
    this._timeMarksSubject.next([]);
  }


}
