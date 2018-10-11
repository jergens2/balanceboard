import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
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
  // private _activitiesSubject: BehaviorSubject<CategorizedActivity> = new BehaviorSubject<CategorizedActivity>(null);

  get timeMarks(): Observable<TimeMark[]> {
    return this._timeMarksSubject.asObservable();
  }
  // get activities(): Observable<CategorizedActivity>{
  //   return this._activitiesSubject.asObservable();
  // }

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
      .pipe(map((response) => {
        let timeMark = new TimeMark(response.data._id, response.data.userId, response.data.timeISO);
        timeMark.description = response.data.description;
        timeMark.activities = response.data.activities as CategorizedActivity[];
        return timeMark;
      }))
      .subscribe((timeMark: TimeMark) => {
        let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
        timeMarks.push(timeMark);
        this._timeMarksSubject.next(timeMarks);
      })
  }

  deleteTimeMark(timeMark: TimeMark){
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
      timeMarks.splice(timeMarks.indexOf(timeMark));
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
          let timeMark = new TimeMark(dataObject._id, dataObject.userId, dataObject.timeISO);
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
