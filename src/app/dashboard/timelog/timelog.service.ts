import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimeMark } from './time-mark.model';
import { CategorizedActivity } from './activities/categorized-activity.model';

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

      } else {
        this.logout();
      }
    })
  }

  private serverUrl: string = serverUrl;

  private _currentDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
  

  get currentDate(): moment.Moment{
    return this._currentDate$.getValue();
  }
  get currentDate$(): Observable<moment.Moment>{
    return this._currentDate$.asObservable();
  }
  set currentDate(date: moment.Moment){
    this._currentDate$.next(date);
    /*
      Do a check here to see if the new date is still in the range.  If not, then perform a GET request to update the master variable
      otherwise, simply update thisDaysTimeMarks
    */
    let outOfRange: boolean = false;
    for(let timeMark of this._timeMarksSubject$.getValue()){
      // at this time, we're just pretending like the time range is always fixed by month.  In the future, we can change this from month to any set variable range,
      // for example a six week period.
      if(moment(date).month() != moment(timeMark.startTime).month()){
        outOfRange = true;
        break;
      }
    }

    if(outOfRange){
      this.fetchTimeMarksByRange(this.authService.authenticatedUser.id, moment(date).startOf('month'), moment(date).endOf('month'));
    }else{
      this._thisDaysTimeMarks.next((this.getThisDaysTimeMarks(this._timeMarksSubject$.getValue(), date)));
    }
  }

  private _timeMarksSubject$: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>(null);
  private _thisDaysTimeMarks: Subject<TimeMark[]> = new Subject();
  private thisDaysTimeMarksSubscription: Subscription = this._timeMarksSubject$.subscribe((timeMarks: TimeMark[])=>{
    this._thisDaysTimeMarks.next(this.getThisDaysTimeMarks(timeMarks, this.currentDate));
  })
  
  private getThisDaysTimeMarks(allTimeMarks: TimeMark[], currentDate: moment.Moment): TimeMark[]{
    let thisDaysTimeMarks: TimeMark[] = [];
    if(allTimeMarks != null){
      for(let timeMark of allTimeMarks){
        if(moment(timeMark.startTime).dayOfYear() == currentDate.dayOfYear() || moment(timeMark.endTime).dayOfYear() == currentDate.dayOfYear())
        thisDaysTimeMarks.push(timeMark);
      }
    }
    return thisDaysTimeMarks;
  }


  get timeMarks$(): Observable<TimeMark[]> {
    return this._timeMarksSubject$.asObservable();
  }

  get thisDaysTimeMarks(): Observable<TimeMark[]>{
    return this._thisDaysTimeMarks;
  }



  get latestTimeMark(): TimeMark {
    let timeMarks = this._timeMarksSubject$.getValue();
    if (timeMarks.length > 0) {
      let latestTimeMark = timeMarks[0];
      for (let timeMark of timeMarks) {
        if (timeMark.endTimeISO > latestTimeMark.endTimeISO) {
          latestTimeMark = timeMark;
        }
      }
      return latestTimeMark;
    } else {
      return null;
    }
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
        let timeMarks: TimeMark[] = this._timeMarksSubject$.getValue();
        timeMarks.push(timeMark);

        this._timeMarksSubject$.next(timeMarks);
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
    let currentTimeMarks = this._timeMarksSubject$.getValue();

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
          let timeMarks: TimeMark[] = this._timeMarksSubject$.getValue();
          let precedingTimeMarkIndex = timeMarks.findIndex((timeMark) => {
            return timeMark.id == updatedTimeMark.id;
          })
          timeMarks[precedingTimeMarkIndex] = updatedTimeMark;
          this._timeMarksSubject$.next(timeMarks);
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
        let timeMarks: TimeMark[] = this._timeMarksSubject$.getValue();
        timeMarks.splice(timeMarks.indexOf(timeMark), 1);
        // this.setLatestTimeMark(null);
        this._timeMarksSubject$.next(timeMarks);
      })

  }

  private fetchTimeMarksByRange(authenticatedUserId: string, startTime: moment.Moment, endTime: moment.Moment) {
    
    const getUrl = this.serverUrl + "/api/timeMark/" + authenticatedUserId + "/" + startTime.toISOString() + "/" + endTime.toISOString();
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
        this._timeMarksSubject$.next(timeMarks);
      });

  }

  scanForChanges(){
    
  }

  onTimeLogComponentInit(date: moment.Moment){
    /*
      This will do a fetch for timeMarks in a range of a month.  We could mimic this behavior and define any time range, not just 1 month
    */
    let startTime: moment.Moment = moment(date).startOf('month');
    let endTime: moment.Moment = moment(date).endOf('month');
    this.fetchTimeMarksByRange(this.authService.authenticatedUser.id, startTime, endTime);
  }
  


  private logout() {
    this._timeMarksSubject$.next([]);
  }


}
