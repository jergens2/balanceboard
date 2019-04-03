import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs';
import { TimeSegment } from './time-segment-tile/time-segment.model';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';

import * as moment from 'moment';

import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { TimeSegmentActivity } from './time-segment-activity.model';
import { ActivitiesService } from '../../activities/activities.service';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  private _authStatus: AuthStatus = null;
  login(authStatus: AuthStatus){
    this._authStatus = authStatus;
    this.fetchTimeSegmentsByRange(moment().startOf('day').subtract(1,'days'), moment().endOf('day').add(1,'days'));
  }

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService) {
  }

  private _serverUrl: string = serverUrl;


  private _timeSegments: TimeSegment[] = [];
  private _timeSegments$: Subject<TimeSegment[]> = new Subject();
  public get timeSegments$(): Observable<TimeSegment[]> { 
    return this._timeSegments$.asObservable();
  }
  public get timeSegments(): TimeSegment[] {
    return this._timeSegments;
  }





  updateTimeSegment(timeSegment: TimeSegment){
    console.log("Updating time segment: ", timeSegment);
    let updatedTimeSegment: TimeSegment = timeSegment;
    let trimmedActivities = updatedTimeSegment.activities.map((activity: TimeSegmentActivity)=>{
      return {activityTreeId: activity.activityTreeId, duration: activity.duration, description: activity.description }
    })
    
    updatedTimeSegment.activities = trimmedActivities as TimeSegmentActivity[];
    const postUrl = this._serverUrl + "/api/timeSegment/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    console.log("Updating timesegment:", updatedTimeSegment)
    this.httpClient.post<{ message: string, data: any }>(postUrl, updatedTimeSegment, httpOptions)
      .pipe<TimeSegment>(map((response) => {
        let timeSegment = new TimeSegment(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO, response.data.description);
        // timeSegment.precedingTimeSegmentId = response.data.precedingTimeSegmentId;
        // timeSegment.followingTimeSegmentId = response.data.followingTimeSegmentId;
        timeSegment.description = response.data.description;
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities);
        return timeSegment;
      }))
      .subscribe((returnedTimeSegment: TimeSegment) => {
        console.log("returned time segment is ", returnedTimeSegment);
        let timeSegments: TimeSegment[] = this._timeSegments;
        for(let timeSegment of timeSegments){
          if(timeSegment.id == returnedTimeSegment.id){
            timeSegments.splice(timeSegments.indexOf(timeSegment), 1, returnedTimeSegment)
          }
        }
        this._timeSegments = Object.assign([],timeSegments);
        this._timeSegments$.next(this._timeSegments);
      });
  }

  saveTimeSegment(timeSegment: TimeSegment) {
    console.log("Saving new timeSegment", timeSegment);
    let newTimeSegment: TimeSegment = timeSegment;
    newTimeSegment.userId = this._authStatus.user.id;

    //the following line exists to remove the activity data from the object
    let trimmedActivities = newTimeSegment.activities.map((activity: TimeSegmentActivity)=>{
      return {activityTreeId: activity.activityTreeId, duration: activity.duration, description: activity.description };
    })
    newTimeSegment.activities = trimmedActivities as TimeSegmentActivity[];
    const postUrl = this._serverUrl + "/api/timeSegment/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    
    this.httpClient.post<{ message: string, data: any }>(postUrl, newTimeSegment, httpOptions)
      .pipe<TimeSegment>(map((response) => {
        let timeSegment = new TimeSegment(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO, response.data.description);
        // timeSegment.precedingTimeSegmentId = response.data.precedingTimeSegmentId;
        // timeSegment.followingTimeSegmentId = response.data.followingTimeSegmentId;
        timeSegment.description = response.data.description;
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities);
        return timeSegment;
      }))
      .subscribe((timeSegment: TimeSegment) => {
        console.log("saved time segment was ", timeSegment);
        let timeSegments: TimeSegment[] = this._timeSegments;
        timeSegments.push(timeSegment);
        this._timeSegments = Object.assign([], timeSegments);
        this._timeSegments$.next(this._timeSegments);
      })
  }

  private buildTimeSegmentActivities(activitiesData: Array<{activityTreeId: string, duration: number, description: string }>): TimeSegmentActivity[]{
    // console.log("building time segment activities");
    return activitiesData.map((activity) =>{
      let timeSegmentActivity: TimeSegmentActivity = new TimeSegmentActivity(this.activitiesService.findActivityByTreeId(activity.activityTreeId), activity.duration, activity.description);
      return timeSegmentActivity;
    })
  }


  

  deleteTimeSegment(timeSegment: TimeSegment) {
    const postUrl = this._serverUrl + "/api/timeSegment/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, timeSegment, httpOptions)
      .subscribe((response) => {
        let timeSegments: TimeSegment[] = this._timeSegments;
        timeSegments.splice(timeSegments.indexOf(timeSegment), 1);
        
        this._timeSegments = Object.assign([], timeSegments);
        this._timeSegments$.next(timeSegments);
      })

  }

  

  fetchTimeSegmentsByRange(startTime: moment.Moment, endTime: moment.Moment) {
    const getUrl = this._serverUrl + "/api/timeSegment/" + this._authStatus.user.id + "/" + startTime.toISOString() + "/" + endTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description);
          if(dataObject.timeISO){
            /* 
              2018-11-23
              This check is here for previous versions of the timeSegment where there used to be a property called timeISO.
            */
           timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
          }
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if(activities.length > 0){ 
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if(activities[0].activityTreeId != null){
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            }else{
              timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }

          
          return timeSegment;
        })
      }))
      .subscribe((timeSegments: TimeSegment[]) => {
        this._timeSegments$.next(timeSegments);
      });

  }


  logout() {
    this._authStatus = null;
    this._timeSegments$.next([]);
  }


}
