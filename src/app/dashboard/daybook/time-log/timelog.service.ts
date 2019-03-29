import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../../authentication/authentication.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { TimeSegment } from './time-segment.model';
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

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService) {
  }

  login$(authStatus: AuthStatus): Observable<TimeSegment[]> {
    this._authStatus = authStatus;
    /*
      The following function just uses this.currentDate, which will always default to today.  but there may be times when, for example, 
      maybe the user navigates to a specific day, and then quits the app, and then returns at another time, and maybe wants to return to that specific day ?
    */
    return this.fetchTimeSegmentsByDay(this.currentDate);
  }


  private _serverUrl: string = serverUrl;

  private _currentDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
  private _timeSegmentsSubject$: BehaviorSubject<TimeSegment[]> = new BehaviorSubject([]);

  private _thisDaysTimeSegmentsSubscription: Subscription = new Subscription();


  // 2018-12-16:  these 2 following variables are statically defined here in this service, but eventually will be modifyable by the user which will change the behavior of the app
  private _userDefinedStartTimeOfDay: moment.Moment = moment().hour(7).minute(30).second(0).millisecond(0);
  private _userDefinedEndTimeOfDay: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
  get userDefinedStartTimeOfDay(): moment.Moment { return this._userDefinedStartTimeOfDay; }
  get userDefinedEndTimeOfDay(): moment.Moment { return this._userDefinedEndTimeOfDay; }

  get currentDate(): moment.Moment {
    return this._currentDate$.getValue();
  }
  set currentDate(date: moment.Moment) {
    this._userDefinedStartTimeOfDay = moment(date).hour(7).minute(0).second(0).millisecond(0);
    this._userDefinedEndTimeOfDay = moment(date).hour(22).minute(0).second(0).millisecond(0);
    this._currentDate$.next(date);
    /*
      Do a check here to see if the new date is still in the range.  If not, then perform a GET request to update the master variable
      otherwise, simply update thisDaysTimeSegments
    */
    let outOfRange: boolean = false;
    for (let timeSegment of this._timeSegmentsSubject$.getValue()) {
      // at this time, we're just pretending like the time range is always fixed by month.  In the future, we can change this from month to any set variable range,
      // for example a six week period.
      if (moment(date).month() != moment(timeSegment.startTime).month()) {
        outOfRange = true;
        break;
      }
    }

    if (outOfRange) {
      this.fetchTimeSegmentsByRange(this._authStatus.user.id, moment(date).startOf('month'), moment(date).endOf('month'));
    } else {
      // this._thisDaysTimeSegments.next((this.getThisDaysTimeSegments(this._timeSegmentsSubject$.getValue(), date)));
    }
  }
  get currentDate$(): Observable<moment.Moment> {
    return this._currentDate$.asObservable();
  }


  get timeSegments$(): Observable<TimeSegment[]> {
    return this._timeSegmentsSubject$.asObservable();
  }



  // get latestTimeSegment(): TimeSegment {
  //   console.log("timelog service", this._timeSegmentsSubject$.getValue())
  //   let timeSegments = this._timeSegmentsSubject$.getValue();
  //   if (timeSegments.length > 0) {
  //     let latestTimeSegment = timeSegments[0];
  //     for (let timeSegment of timeSegments) {
  //       if (timeSegment.endTimeISO > latestTimeSegment.endTimeISO) {
  //         latestTimeSegment = timeSegment;
  //       }
  //     }
  //     console.log("Service: latest time segment is ", latestTimeSegment);
  //     return latestTimeSegment;
  //   } else {
  //     return null;
  //   }
  // }

  updateTimeSegment(timeSegment: TimeSegment) {
    console.log("Updating time segment: ", timeSegment);
    let updatedTimeSegment: TimeSegment = timeSegment;
    let trimmedActivities = updatedTimeSegment.activities.map((activity: TimeSegmentActivity) => {
      return { activityTreeId: activity.activityTreeId, duration: activity.duration, description: activity.description }
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
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        for (let timeSegment of timeSegments) {
          if (timeSegment.id == returnedTimeSegment.id) {
            timeSegments.splice(timeSegments.indexOf(timeSegment), 1, returnedTimeSegment)
          }
        }
        this._timeSegmentsSubject$.next(timeSegments);
      })
  }

  saveTimeSegment(timeSegment: TimeSegment) {
    let newTimeSegment: TimeSegment = timeSegment;
    newTimeSegment.userId = this._authStatus.user.id;

    //the following line exists to remove the activity data from the object
    let trimmedActivities = newTimeSegment.activities.map((activity: TimeSegmentActivity) => {
      return { activityTreeId: activity.activityTreeId, duration: activity.duration, description: activity.description };
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
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        timeSegments.push(timeSegment);

        this._timeSegmentsSubject$.next(timeSegments);
        // this.updatePrecedingTimeSegment(timeSegment);
      })
  }

  private buildTimeSegmentActivities(activitiesData: Array<{ activityTreeId: string, duration: number, description: string }>): TimeSegmentActivity[] {
    // console.log("building time segment activities");
    return activitiesData.map((activity) => {
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
        let timeSegments: TimeSegment[] = this._timeSegmentsSubject$.getValue();
        timeSegments.splice(timeSegments.indexOf(timeSegment), 1);
        // this.setLatestTimeSegment(null);
        this._timeSegmentsSubject$.next(timeSegments);
      })

  }

  fetchTimeSegmentsByDay(date: moment.Moment): Observable<TimeSegment[]> {
    const getUrl = this._serverUrl + "/api/timeSegment/" + this._authStatus.user.id + "/" + moment(date).startOf('day').toISOString() + "/" + moment(date).endOf('day').toISOString();

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

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            } else {
              console.log("receiving old activities")
              timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }
          return timeSegment;
        })
      }))


  }

  private fetchTimeSegmentsByRange(authenticatedUserId: string, startTime: moment.Moment, endTime: moment.Moment) {

    const getUrl = this._serverUrl + "/api/timeSegment/" + authenticatedUserId + "/" + startTime.toISOString() + "/" + endTime.toISOString();
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
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            } else {
              timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }


          return timeSegment;
        })
      }))
      .subscribe((timeSegments: TimeSegment[]) => {
        this._timeSegmentsSubject$.next(timeSegments);
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
          }
          timeSegment.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timeSegment.activities = this.buildTimeSegmentActivities(activities);
            } else {
              console.log("this shit must be old");
              timeSegment.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }


          return timeSegment;
        })
      }))
  }


  logout() {
    this._authStatus = null;
    this._timeSegmentsSubject$.next([]);
    this._thisDaysTimeSegmentsSubscription.unsubscribe();
  }


}
