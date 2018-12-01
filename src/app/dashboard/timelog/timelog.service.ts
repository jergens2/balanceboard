import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimeMark } from './time-mark.model';
import { CategorizedActivity } from './activities/activity/categorized-activity.model';

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
        this.currentDate$.subscribe((date: moment.Moment)=>{
          console.log("date has changed")
          let start = moment(date).startOf('day').toISOString();
          let end = moment(date).endOf('day').toISOString();
          this.fetchTimeMarks(authStatus.user.id, start, end);
        })
      } else {
        this.logout();
      }
    })
  }

  private serverUrl: string = serverUrl;

  private _timeMarksSubject: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>(null);
  // private _timeMarksMonthSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private _currentDate: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  // get timeMarksOfMonth$(){
  //   return this._timeMarksMonthSubject.asObservable();
  // }

  get timeMarks$(): Observable<TimeMark[]> {
    return this._timeMarksSubject.asObservable();
  }

  get currentDate$(): Observable<moment.Moment> {
    return this._currentDate.asObservable();
  }
  get latestTimeMark(): TimeMark {
    let timeMarks = this._timeMarksSubject.getValue();
    if (timeMarks.length > 0) {
      let tempTimeMark = timeMarks[0];
      for (let timeMark of timeMarks) {
        if (timeMark.endTimeISO > tempTimeMark.endTimeISO) {
          tempTimeMark = timeMark;
        }
      }
      return tempTimeMark;
    } else {
      return null;
    }
  }
  setCurrentDate(newDate: moment.Moment) {
    this._currentDate.next(newDate);
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
        let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO);
        timeMark.precedingTimeMarkId = response.data.precedingTimeMarkId;
        timeMark.followingTimeMarkId = response.data.followingTimeMarkId;
        timeMark.description = response.data.description;
        timeMark.activities = response.data.activities as CategorizedActivity[];
        return timeMark;
      }))
      .subscribe((timeMark: TimeMark) => {
        let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
        timeMarks.push(timeMark);

        this._timeMarksSubject.next(timeMarks);
        this.updatePrecedingTimeMark(timeMark);
      })
  }
  private updatePrecedingTimeMark(latestTimeMark: TimeMark) {
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

    precedingTimeMark = currentTimeMarks.find((timeMark) => {
      return timeMark.id == precedingTimeMarkId;
    });
    if (precedingTimeMark) {
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
          let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO);
          timeMark.precedingTimeMarkId = response.data.precedingTimeMarkId;
          timeMark.followingTimeMarkId = response.data.followingTimeMarkId;
          timeMark.description = response.data.description;
          timeMark.activities = response.data.activities as CategorizedActivity[];
          return timeMark;
        }))
        .subscribe((updatedTimeMark: TimeMark) => {
          let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
          let precedingTimeMarkIndex = timeMarks.findIndex((timeMark) => {
            return timeMark.id == updatedTimeMark.id;
          })
          timeMarks[precedingTimeMarkIndex] = updatedTimeMark;
          this._timeMarksSubject.next(timeMarks);
        })
    }
  }

  deleteTimeMark(timeMark: TimeMark) {
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
        timeMarks.splice(timeMarks.indexOf(timeMark), 1);
        // this.setLatestTimeMark(null);
        this._timeMarksSubject.next(timeMarks);
      })

  }

  fetchMonthsTimeMarks(startTime: string): Observable<{ message: string, data: any }>{
    let authenticatedUserId = this.authService.authenticatedUser.id;
    const getUrl = this.serverUrl + "/api/timeMark/month/" + authenticatedUserId + "/" + startTime;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)


  }

  private fetchTimeMarks(authenticatedUserId: string, startTime: string, endTime: string) {
    const getUrl = this.serverUrl + "/api/timeMark/" + authenticatedUserId + "/" + startTime + "/" + endTime;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timeMark = new TimeMark(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO);
          if(dataObject.timeISO){
            /* 
              2018-11-23
              This check is here for previous versions of the timeMark where there used to be a property called timeISO.
            */
           timeMark.endTimeISO = dataObject.timeISO;
           timeMark.startTimeISO = dataObject.timeISO;
          }
          timeMark.description = dataObject.description;
          timeMark.activities = dataObject.activities as CategorizedActivity[];
          return timeMark;
        })
      }))
      .subscribe((timeMarks: TimeMark[]) => {
        this._timeMarksSubject.next(timeMarks);
      });

  }

  timeMarkUpdatesInterval(startTime, endTime){
    // this.fetchMonthsTimeMarks(this.authService.authenticatedUser.id, startTime);
    this.fetchTimeMarks(this.authService.authenticatedUser.id, startTime, endTime);
  }
  


  private logout() {
    this._timeMarksSubject.next([]);
  }


}
