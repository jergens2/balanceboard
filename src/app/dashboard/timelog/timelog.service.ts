import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeMark } from './time-mark.model';
import { CategorizedActivity } from './categorized-activity.model';

import { serverUrl } from '../../serverurl';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  private serverUrl: string = serverUrl;

  private _timeMarksSubject: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>([]);
  // private _activitiesSubject: BehaviorSubject<CategorizedActivity> = new BehaviorSubject<CategorizedActivity>(null);

  get timeMarks(): Observable<TimeMark[]>{
    return this._timeMarksSubject.asObservable();
  }
  // get activities(): Observable<CategorizedActivity>{
  //   return this._activitiesSubject.asObservable();
  // }

  saveTimeMark(timeMark: TimeMark){
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
        console.log(timeMark);
        let timeMarks: TimeMark[] = this._timeMarksSubject.getValue();
        timeMarks.push(timeMark);
        this._timeMarksSubject.next(timeMarks);
      })

  } 



}
