import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimeSegment } from './time-segment.model';
import { CategorizedActivity } from '../activities/categorized-activity.model';

import * as moment from 'moment';

import { serverUrl } from '../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../authentication/auth-status.model';
import { TimeSegmentActivity } from './time-segment-activity.model';
import { ActivitiesService } from '../activities/activities.service';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService, private activitiesService: ActivitiesService) {
    authService.authStatus.subscribe((authStatus: AuthStatus) => {
      if (authStatus.isAuthenticated) {
        this.activitiesService.activitiesTree$.subscribe((tree)=>{
          if(tree != null){
            this.initiateService();
          }
        })
      } else {
        this.logout();
      }
    })
  }


  initiateService(){
    this.thisDaysTimeSegmentsSubscription = this._timeSegmentsSubject$.subscribe((timeSegments: TimeSegment[])=>{
      this._thisDaysTimeSegments.next(this.getThisDaysTimeSegments(timeSegments, this.currentDate));
    })

    let startTime: moment.Moment = moment().startOf('month');
    let endTime: moment.Moment = moment().endOf('month');
    this.fetchTimeSegmentsByRange(this.authService.authenticatedUser.id, startTime, endTime);
  }


  private serverUrl: string = serverUrl;

  private _currentDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
  private _timeSegmentsSubject$: BehaviorSubject<TimeSegment[]> = new BehaviorSubject(null);

  private _thisDaysTimeSegments: BehaviorSubject<TimeSegment[]> = new BehaviorSubject(null);

  private thisDaysTimeSegmentsSubscription: Subscription;


  // 2018-12-16:  these 2 following variables are statically defined here in this service, but eventually will be modifyable by the user which will change the behavior of the app
  private _userDefinedStartTimeOfDay: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
  private _userDefinedEndTimeOfDay: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
  get userDefinedStartTimeOfDay(): moment.Moment { return this._userDefinedStartTimeOfDay; }
  get userDefinedEndTimeOfDay(): moment.Moment { return this._userDefinedEndTimeOfDay; }

  get currentDate(): moment.Moment{
    return this._currentDate$.getValue();
  }
  set currentDate(date: moment.Moment){
    this._userDefinedStartTimeOfDay = moment(date).hour(7).minute(0).second(0).millisecond(0);
    this._userDefinedEndTimeOfDay= moment(date).hour(22).minute(0).second(0).millisecond(0);
    this._currentDate$.next(date);
    /*
      Do a check here to see if the new date is still in the range.  If not, then perform a GET request to update the master variable
      otherwise, simply update thisDaysTimeSegments
    */
    let outOfRange: boolean = false;
    for(let timeSegment of this._timeSegmentsSubject$.getValue()){
      // at this time, we're just pretending like the time range is always fixed by month.  In the future, we can change this from month to any set variable range,
      // for example a six week period.
      if(moment(date).month() != moment(timeSegment.startTime).month()){
        outOfRange = true;
        break;
      }
    }

    if(outOfRange){
      this.fetchTimeSegmentsByRange(this.authService.authenticatedUser.id, moment(date).startOf('month'), moment(date).endOf('month'));
    }else{
      this._thisDaysTimeSegments.next((this.getThisDaysTimeSegments(this._timeSegmentsSubject$.getValue(), date)));
    }
  }
  get currentDate$(): Observable<moment.Moment>{
    return this._currentDate$.asObservable();
  }



  
  private getThisDaysTimeSegments(allTimeSegments: TimeSegment[], currentDate: moment.Moment): TimeSegment[]{
    let thisDaysTimeSegments: TimeSegment[] = [];
    if(allTimeSegments != null){
      for(let timeSegment of allTimeSegments){
        // console.log("time segment of all timeSegments", timeSegment);
        // console.log("startTime, endTime, DayofYear", timeSegment.startTimeISO, timeSegment.endTimeISO, moment(timeSegment.startTimeISO).dayOfYear(), moment(timeSegment.endTimeISO).dayOfYear())

        if(moment(timeSegment.startTimeISO).dayOfYear() != moment(timeSegment.endTimeISO).dayOfYear()){
          console.log("timeSegment start time and end time are not the same day of year.")
          // this happens when UTC time rolls over 23:59
        }


        if(moment(timeSegment.startTime).dayOfYear() == currentDate.dayOfYear() || moment(timeSegment.endTime).dayOfYear() == currentDate.dayOfYear())
        thisDaysTimeSegments.push(timeSegment);
      }
    }
    return thisDaysTimeSegments;
  }


  get timeSegments$(): Observable<TimeSegment[]> {
    return this._timeSegmentsSubject$.asObservable();
  }

  get thisDaysTimeSegments(): Observable<TimeSegment[]>{
    return this._thisDaysTimeSegments;
  }



  get latestTimeSegment(): TimeSegment {
    let timeSegments = this._timeSegmentsSubject$.getValue();
    if (timeSegments.length > 0) {
      let latestTimeSegment = timeSegments[0];
      for (let timeSegment of timeSegments) {
        if (timeSegment.endTimeISO > latestTimeSegment.endTimeISO) {
          latestTimeSegment = timeSegment;
        }
      }
      console.log("Service: latest time segment is ", latestTimeSegment);
      return latestTimeSegment;
    } else {
      return null;
    }
  }

  updateTimeSegment(timeSegment: TimeSegment){
    let updatedTimeSegment: TimeSegment = timeSegment;
    let trimmedActivities = updatedTimeSegment.activities.map((activity: TimeSegmentActivity)=>{
      return {activityTreeId: activity.activityTreeId, duration: activity.duration }
    })
    
    updatedTimeSegment.activities = trimmedActivities as TimeSegmentActivity[];
    const postUrl = this.serverUrl + "/api/timeSegment/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    
    this.httpClient.post<{ message: string, data: any }>(postUrl, updatedTimeSegment, httpOptions)
      .pipe<TimeSegment>(map((response) => {
        let timeSegment = new TimeSegment(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO);
        timeSegment.precedingTimeSegmentId = response.data.precedingTimeSegmentId;
        timeSegment.followingTimeSegmentId = response.data.followingTimeSegmentId;
        timeSegment.description = response.data.description;
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities);
        return timeSegment;
      }))
      .subscribe((returnedTimeSegment: TimeSegment) => {
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        for(let timeSegment of timeSegments){
          if(timeSegment.id == returnedTimeSegment.id){
            timeSegments.splice(timeSegments.indexOf(timeSegment), 1, returnedTimeSegment)
          }
        }
        this._timeSegmentsSubject$.next(timeSegments);
      })
  }

  saveTimeSegment(timeSegment: TimeSegment) {
    let newTimeSegment: TimeSegment = timeSegment;
    newTimeSegment.userId = this.authService.authenticatedUser.id;

    //the following line exists to remove the activity data from the object
    let trimmedActivities = newTimeSegment.activities.map((activity: TimeSegmentActivity)=>{
      return {activityTreeId: activity.activityTreeId, duration: activity.duration, description: activity.description };
    })
    newTimeSegment.activities = trimmedActivities as TimeSegmentActivity[];
    const postUrl = this.serverUrl + "/api/timeSegment/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    
    this.httpClient.post<{ message: string, data: any }>(postUrl, newTimeSegment, httpOptions)
      .pipe<TimeSegment>(map((response) => {
        let timeSegment = new TimeSegment(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO);
        timeSegment.precedingTimeSegmentId = response.data.precedingTimeSegmentId;
        timeSegment.followingTimeSegmentId = response.data.followingTimeSegmentId;
        timeSegment.description = response.data.description;
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities);
        return timeSegment;
      }))
      .subscribe((timeSegment: TimeSegment) => {
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        timeSegments.push(timeSegment);

        this._timeSegmentsSubject$.next(timeSegments);
        // this.updatePrecedingTimeSegment(timeSegment);
      })
  }

  private buildTimeSegmentActivities(activitiesData: Array<{activityTreeId: string, duration: number, description: string }>): TimeSegmentActivity[]{
    return activitiesData.map((activity) =>{
      let timeSegmentActivity: TimeSegmentActivity = new TimeSegmentActivity(this.activitiesService.findActivityById(activity.activityTreeId), activity.duration, activity.description);
      return timeSegmentActivity;
    })
  }


  

  deleteTimeSegment(timeSegment: TimeSegment) {
    /*
      2018-11-11  
      To do: unresolved issue: if timeSegment get's deleted, we need to update other time Segments in the DB?
      For example, there are 3 sequential time segments A, B, C
      A points to next which is B, B points back to A and forward to C, and C points backward to B.

      timeSegment B gets deleted(), but A is still pointing to what used to be B but B no longer exists, and similar with C.

      Doesn't really break the app, but does mean that timeSegments are pointing to non-existing items.

      How to fix?  Should A and C just start pointing to each other then?
        What about the time gap that is left now that B has been deleted?  

    */
    // console.log("TimeLogService: deleteTimeSegment() function disabled");


    const postUrl = this.serverUrl + "/api/timeSegment/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, timeSegment, httpOptions)
      // .pipe(map((response) => {
      //   let timeSegment = new TimeSegment(response.data._id, response.data.userId, response.data.timeISO);
      //   timeSegment.description = response.data.description;
      //   timeSegment.activities = response.data.activities as CategorizedActivity[];
      //   return timeSegment;
      // }))
      .subscribe((response) => {
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        timeSegments.splice(timeSegments.indexOf(timeSegment), 1);
        // this.setLatestTimeSegment(null);
        this._timeSegmentsSubject$.next(timeSegments);
      })

  }

  fetchTimeSegmentsByDay(date: moment.Moment){
    const getUrl = this.serverUrl + "/api/timeSegment/" + this.authService.authenticatedUser.id + "/" + moment(date).startOf('day').toISOString() + "/" + moment(date).endOf('day').toISOString();

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO);
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if(activities.length > 0){ 
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if(activities[0].activityTreeId != null){
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            }else{
              timeSegment.receiveOldActivities(dataObject.activities as CategorizedActivity[])
            }
          }
          return timeSegment;
        })
      }))


  }

  private fetchTimeSegmentsByRange(authenticatedUserId: string, startTime: moment.Moment, endTime: moment.Moment) {
    
    const getUrl = this.serverUrl + "/api/timeSegment/" + authenticatedUserId + "/" + startTime.toISOString() + "/" + endTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO);
          if(dataObject.timeISO){
            /* 
              2018-11-23
              This check is here for previous versions of the timeSegment where there used to be a property called timeISO.
            */
           timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO);
          }
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if(activities.length > 0){ 
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if(activities[0].activityTreeId != null){
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            }else{
              timeSegment.receiveOldActivities(dataObject.activities as CategorizedActivity[])
            }
          }

          
          return timeSegment;
        })
      }))
      .subscribe((timeSegments: TimeSegment[]) => {
        this._timeSegmentsSubject$.next(timeSegments);
      });

  }

  scanForChanges(){
    
  }

  // onTimeLogComponentInit(date: moment.Moment){
  //   /*
  //     This will do a fetch for timeSegments in a range of a month.  We could mimic this behavior and define any time range, not just 1 month
  //   */
  //   let startTime: moment.Moment = moment(date).startOf('month');
  //   let endTime: moment.Moment = moment(date).endOf('month');
  //   this.fetchTimeSegmentsByRange(this.authService.authenticatedUser.id, startTime, endTime);
  // }
  


  private logout() {
    this._timeSegmentsSubject$.next([]);
    this.thisDaysTimeSegmentsSubscription.unsubscribe();
  }


}
