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
import { DaybookService } from '../daybook.service';
import { Day } from '../day/day.model';
import { ITimeSegmentDataItem } from '../day/time-segment-data.interface';
import { IActivityDataItem } from '../day/activity-data-item.interface';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  private _authStatus: AuthStatus = null;
  private _loginComplete$: Subject<boolean> = new Subject();
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.fetchTimeSegmentsByRange(moment().startOf('day').subtract(1, 'days'), moment().endOf('day').add(1, 'days'));
    return this._loginComplete$.asObservable();
  }

  public get userId(): string{
    return this._authStatus.user.id;
  }

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService, private daybookService: DaybookService) {
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

  public get mostRecentTimelogEntry(): TimeSegment {
    if(this._timeSegments.length > 0){
      let timeSegments = this._timeSegments.sort((ts1, ts2)=>{
        if(ts1.startTime.isAfter(ts2.startTime)){
          return -1;
        }
        if(ts1.startTime.isBefore(ts2.startTime)){
          return 1;
        }
        return 0;
      })
      return timeSegments[0];
    }else{
      return null;
    }
    
  } 



  updateTimeSegment(timeSegment: TimeSegment) {
    console.log("Updating time segment: ", timeSegment);
    let updatedTimeSegment: TimeSegment = timeSegment;
    let trimmedActivities = updatedTimeSegment.activities.map((activity: TimeSegmentActivity) => {
      return { activityTreeId: activity.activityTreeId, description: activity.description }
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
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities, timeSegment.startTime, timeSegment.endTime);
        return timeSegment;
      }))
      .subscribe((returnedTimeSegment: TimeSegment) => {

        console.log("returned time segment is ", returnedTimeSegment);
        let timeSegments: TimeSegment[] = this._timeSegments;
        for (let timeSegment of timeSegments) {
          if (timeSegment.id == returnedTimeSegment.id) {

            timeSegments.splice(timeSegments.indexOf(timeSegment), 1, returnedTimeSegment)
          }
        }
        this._timeSegments = Object.assign([], timeSegments);
        this._timeSegments$.next(this._timeSegments);
        this.updateDayData(timeSegment.startTime, timeSegment.endTime);
      });
  }

  saveTimeSegment(timeSegment: TimeSegment) {
    console.log("Saving new timeSegment", timeSegment);
    let newTimeSegment: TimeSegment = timeSegment;
    newTimeSegment.userId = this._authStatus.user.id;

    //the following line exists to remove the activity data from the object
    let trimmedActivities = newTimeSegment.activities.map((activity: TimeSegmentActivity) => {
      return { activityTreeId: activity.activityTreeId, description: activity.description };
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
        timeSegment.activities = this.buildTimeSegmentActivities(response.data.activities, timeSegment.startTime, timeSegment.endTime);
        return timeSegment;
      }))
      .subscribe((timeSegment: TimeSegment) => {
        console.log("saved time segment was ", timeSegment);
        let timeSegments: TimeSegment[] = this._timeSegments;
        timeSegments.push(timeSegment);
        this._timeSegments = Object.assign([], timeSegments);
        this._timeSegments$.next(this._timeSegments);
        this.updateDayData(timeSegment.startTime, timeSegment.endTime);
      })
  }

  private buildTimeSegmentActivities(activitiesData: Array<{ activityTreeId: string, duration: number, description: string }>, startTime: moment.Moment, endTime: moment.Moment): TimeSegmentActivity[] {

    let duration: number = endTime.diff(startTime, "minutes") / activitiesData.length;


    return activitiesData.map((activity) => {
      let timeSegmentActivity: TimeSegmentActivity = new TimeSegmentActivity(this.activitiesService.findActivityByTreeId(activity.activityTreeId), activity.description);
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
        this.updateDayData(timeSegment.startTime, timeSegment.endTime);
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
          if (dataObject.timeISO) {
            /* 
              2018-11-23
              This check is here for previous versions of the timeSegment where there used to be a property called timeISO.
            */
            timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
          }
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timeSegment.activities = this.buildTimeSegmentActivities(activities, timeSegment.startTime, timeSegment.endTime);
            } else {
              timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }


          return timeSegment;
        })
      }))
      .subscribe((timeSegments: TimeSegment[]) => {
        this._timeSegments = timeSegments;
        this._timeSegments$.next(this._timeSegments);
        this._loginComplete$.next(true);
      });

  }

  public fetchTimeSegmentsByRange$(startTime: moment.Moment, endTime: moment.Moment): Observable<TimeSegment[]> {
    const getUrl = this._serverUrl + "/api/timeSegment/" + this._authStatus.user.id + "/" + startTime.toISOString() + "/" + endTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<TimeSegment[]>(map((response) => {
        return response.data.map((dataObject) => {
          let timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description);
          if (dataObject.timeISO) {
            /* 
              2018-11-23
              This check is here for previous versions of the timeSegment where there used to be a property called timeISO.
            */
            console.log("this shit must be old");
            timeSegment = new TimeSegment(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
            return;
          }
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timeSegment.activities = this.buildTimeSegmentActivities(activities, timeSegment.startTime, timeSegment.endTime);
            } else {
              console.log("this shit must be old");
              // timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
              return;
            }
          }


          return timeSegment;
        })
      }))
  }

  private updateDayData(startTime: moment.Moment, endTime: moment.Moment) {



    if (startTime.format('YYYY-MM-DD') == endTime.format('YYYY-MM-DD')) {

    } else {
      console.log("Start time and end time are not the same, this is unhandled.");
      //need to make sure we update both days of year.
    }

    let date: moment.Moment = moment(startTime);
    // console.log(this.daybookService.last365Days)
    let foundDay: Day = this.daybookService.last365Days.find((day) => {
      return day.dateYYYYMMDD == date.format('YYYY-MM-DD');
    });
    // console.log("Found day is ", foundDay);



    let timeSegmentData: ITimeSegmentDataItem[] = [];
    let activityData: IActivityDataItem[] = [];

    let timeSegments: TimeSegment[] = this.timeSegments;

    timeSegments.filter((timeSegment) => {
      if (timeSegment.startTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD') || timeSegment.endTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {
        return timeSegment;
      }
    });



    timeSegments.forEach((timeSegment) => {
      timeSegmentData.push({
        timeSegmentId: timeSegment.id,
        description: timeSegment.description,
        seconds: timeSegment.duration*60
      });

      timeSegment.activities.forEach((timeSegmentActivity: TimeSegmentActivity)=>{
        let seconds:number = 0;

        if(timeSegment.startTime.isBefore(date.startOf('day')) && timeSegment.endTime.isAfter(date.startOf('day'))){
          seconds = timeSegment.endTime.diff((date.startOf('day')),"seconds") / timeSegment.activities.length;
        }else if(timeSegment.startTime.isSameOrAfter(date.startOf('day')) && timeSegment.endTime.isSameOrBefore(date.endOf('day'))){
          seconds = timeSegment.endTime.diff(timeSegment.startTime,"seconds") / timeSegment.activities.length;
        }else if(timeSegment.startTime.isBefore(date.endOf('day')) && timeSegment.endTime.isAfter(date.endOf('day'))){
          seconds = date.endOf("day").diff(timeSegment.startTime,"seconds") / timeSegment.activities.length;
        }


        let alreadyIn: boolean = false;
        activityData.forEach((activityDataItem)=>{
          if(activityDataItem.activityTreeId == timeSegmentActivity.activityTreeId){
            activityDataItem.seconds += seconds;
            alreadyIn = true;

          }
        });
        if(!alreadyIn){
          activityData.push({
            activityTreeId: timeSegmentActivity.activityTreeId,
            seconds: seconds
          })

        }
      });

    });
    activityData.sort((a1, a2)=>{
      if(a1.seconds > a2.seconds){
        return -1;
      }
      if(a1.seconds < a2.seconds){
        return 1;
      }
      return 0;
    });

    let day: Day;
    if (foundDay) {
      foundDay.activityData = activityData;
      foundDay.timeSegmentData = timeSegmentData;
      day = foundDay;

    } else {
      //Create new day
      day = new Day('', this._authStatus.user.id, moment(date).format('YYYY-MM-DD'));
      day.activityData = activityData;
      day.timeSegmentData = timeSegmentData;
      
    }

    this.daybookService.saveDayHTTP(day);
    // let this.daybookService.last365Days
  }


  logout() {
    this._authStatus = null;
    this._timeSegments = [];
    this._timeSegments$.next(this._timeSegments);
  }


}
