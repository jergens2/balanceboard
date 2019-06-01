import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, Subscription, BehaviorSubject, timer } from 'rxjs';
import { TimelogEntry } from './timelog-entry-tile/timelog-entry.model';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';

import * as moment from 'moment';

import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { TimelogEntryActivity } from './timelog-entry-activity.model';
import { ActivitiesService } from '../../activities/activities.service';
import { DaybookService } from '../daybook.service';
import { Day } from '../day/day.model';

import { IActivityDataItem } from '../day/activity-data-item.interface';
import { ITimelogEntryDataItem } from '../day/timelog-entry-data.interface';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  private _authStatus: AuthStatus = null;
  private _loginComplete$: Subject<boolean> = new Subject();
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.fetchTimelogEntrysByRange(moment().startOf('day').subtract(1, 'days'), moment().endOf('day').add(1, 'days'));




    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._timelogEntrys = [];
    this._timelogEntrys$.next(this._timelogEntrys);
    this._timerSubscription.unsubscribe();
  }

  public get userId(): string{
    return this._authStatus.user.id;
  }

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService, private daybookService: DaybookService) {
  }

  private _serverUrl: string = serverUrl;


  private _timelogEntrys: TimelogEntry[] = [];
  private _timelogEntrys$: Subject<TimelogEntry[]> = new Subject();
  public get timelogEntrys$(): Observable<TimelogEntry[]> {
    return this._timelogEntrys$.asObservable();
  }
  public get timelogEntrys(): TimelogEntry[] {
    return this._timelogEntrys;
  }

  public get mostRecentTimelogEntry(): TimelogEntry {
    if(this._timelogEntrys.length > 0){
      let timelogEntrys = this._timelogEntrys.sort((ts1, ts2)=>{
        if(ts1.startTime.isAfter(ts2.startTime)){
          return -1;
        }
        if(ts1.startTime.isBefore(ts2.startTime)){
          return 1;
        }
        return 0;
      })
      return timelogEntrys[0];
    }else{
      return null;
    }
    
  } 

  private _timerSubscription: Subscription = new Subscription();
  private subscribeToUpdates(){
    this._timerSubscription = timer(0,30000).subscribe((event)=>{
      this.fetchTimelogEntrysByRange(moment().startOf('day').subtract(1, 'days'), moment().endOf('day').add(1, 'days'));
    });
  }


  updateTimelogEntry(timelogEntry: TimelogEntry) {
    console.log("Updating time entry: ", timelogEntry);
    let updatedTimelogEntry: TimelogEntry = timelogEntry;
    let trimmedActivities = updatedTimelogEntry.activities.map((activity: TimelogEntryActivity) => {
      return { activityTreeId: activity.activityTreeId, description: activity.description }
    })

    updatedTimelogEntry.activities = trimmedActivities as TimelogEntryActivity[];
    const postUrl = this._serverUrl + "/api/timelogEntry/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    console.log("Updating timelog entry:", updatedTimelogEntry)
    this.httpClient.post<{ message: string, data: any }>(postUrl, updatedTimelogEntry, httpOptions)
      .pipe<TimelogEntry>(map((response) => {
        let timelogEntry = new TimelogEntry(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO, response.data.description);
        // timelogEntry.precedingTimelogEntryId = response.data.precedingTimelogEntryId;
        // timelogEntry.followingTimelogEntryId = response.data.followingTimelogEntryId;
        timelogEntry.description = response.data.description;
        timelogEntry.activities = this.buildTimelogEntryActivities(response.data.activities, timelogEntry.startTime, timelogEntry.endTime);
        return timelogEntry;
      }))
      .subscribe((returnedTimelogEntry: TimelogEntry) => {

        console.log("returned time entry is ", returnedTimelogEntry);
        let timelogEntrys: TimelogEntry[] = this._timelogEntrys;
        for (let timelogEntry of timelogEntrys) {
          if (timelogEntry.id == returnedTimelogEntry.id) {

            timelogEntrys.splice(timelogEntrys.indexOf(timelogEntry), 1, returnedTimelogEntry)
          }
        }
        this._timelogEntrys = Object.assign([], timelogEntrys);
        this._timelogEntrys$.next(this._timelogEntrys);
        this.updateDayData(timelogEntry.startTime, timelogEntry.endTime);
      });
  }

  saveTimelogEntry(timelogEntry: TimelogEntry) {
    console.log("Saving new timelogEntry", timelogEntry);
    let newTimelogEntry: TimelogEntry = timelogEntry;
    newTimelogEntry.userId = this._authStatus.user.id;

    //the following line exists to remove the activity data from the object
    let trimmedActivities = newTimelogEntry.activities.map((activity: TimelogEntryActivity) => {
      return { activityTreeId: activity.activityTreeId, description: activity.description };
    })
    newTimelogEntry.activities = trimmedActivities as TimelogEntryActivity[];
    const postUrl = this._serverUrl + "/api/timelogEntry/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, newTimelogEntry, httpOptions)
      .pipe<TimelogEntry>(map((response) => {
        let timelogEntry = new TimelogEntry(response.data._id, response.data.userId, response.data.startTimeISO, response.data.endTimeISO, response.data.description);
        // timelogEntry.precedingTimelogEntryId = response.data.precedingTimelogEntryId;
        // timelogEntry.followingTimelogEntryId = response.data.followingTimelogEntryId;
        timelogEntry.description = response.data.description;
        timelogEntry.activities = this.buildTimelogEntryActivities(response.data.activities, timelogEntry.startTime, timelogEntry.endTime);
        return timelogEntry;
      }))
      .subscribe((timelogEntry: TimelogEntry) => {
        console.log("saved time entry was ", timelogEntry);
        let timelogEntrys: TimelogEntry[] = this._timelogEntrys;
        timelogEntrys.push(timelogEntry);
        this._timelogEntrys = Object.assign([], timelogEntrys);
        this._timelogEntrys$.next(this._timelogEntrys);
        this.updateDayData(timelogEntry.startTime, timelogEntry.endTime);
      })
  }

  private buildTimelogEntryActivities(activitiesData: Array<{ activityTreeId: string, duration: number, description: string }>, startTime: moment.Moment, endTime: moment.Moment): TimelogEntryActivity[] {

    let duration: number = endTime.diff(startTime, "minutes") / activitiesData.length;


    return activitiesData.map((activity) => {
      let timelogEntryActivity: TimelogEntryActivity = new TimelogEntryActivity(this.activitiesService.findActivityByTreeId(activity.activityTreeId), activity.description);
      return timelogEntryActivity;
    })
  }




  deleteTimelogEntry(timelogEntry: TimelogEntry) {
    const postUrl = this._serverUrl + "/api/timelogEntry/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, timelogEntry, httpOptions)
      .subscribe((response) => {
        let timelogEntrys: TimelogEntry[] = this._timelogEntrys;
        timelogEntrys.splice(timelogEntrys.indexOf(timelogEntry), 1);

        this._timelogEntrys = Object.assign([], timelogEntrys);
        this._timelogEntrys$.next(timelogEntrys);
        this.updateDayData(timelogEntry.startTime, timelogEntry.endTime);
      })

  }



  fetchTimelogEntrysByRange(startTime: moment.Moment, endTime: moment.Moment) {
    const getUrl = this._serverUrl + "/api/timelogEntry/" + this._authStatus.user.id + "/" + startTime.toISOString() + "/" + endTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description);
          if (dataObject.timeISO) {
            /* 
              2018-11-23
              This check is here for previous versions of the timelogEntry where there used to be a property called timeISO.
            */
            timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
          }
          timelogEntry.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timelogEntry.activities = this.buildTimelogEntryActivities(activities, timelogEntry.startTime, timelogEntry.endTime);
            } else {
              timelogEntry.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
            }
          }


          return timelogEntry;
        })
      }))
      .subscribe((timelogEntrys: TimelogEntry[]) => {
        this._timelogEntrys = timelogEntrys;
        this._timelogEntrys$.next(this._timelogEntrys);
        this._loginComplete$.next(true);
      });

  }

  public fetchTimelogEntrysByRange$(startTime: moment.Moment, endTime: moment.Moment): Observable<TimelogEntry[]> {
    const getUrl = this._serverUrl + "/api/timelogEntry/" + this._authStatus.user.id + "/" + startTime.toISOString() + "/" + endTime.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<TimelogEntry[]>(map((response) => {
        return response.data.map((dataObject) => {
          let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description);
          if (dataObject.timeISO) {
            /* 
              2018-11-23
              This check is here for previous versions of the timelogEntry where there used to be a property called timeISO.
            */
            console.log("this shit must be old");
            timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
            return;
          }
          timelogEntry.description = dataObject.description;

          let activities: Array<any> = dataObject.activities as Array<any>;
          if (activities.length > 0) {
            //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
            if (activities[0].activityTreeId != null) {
              timelogEntry.activities = this.buildTimelogEntryActivities(activities, timelogEntry.startTime, timelogEntry.endTime);
            } else {
              console.log("this shit must be old");
              // timelogEntry.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
              return;
            }
          }


          return timelogEntry;
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



    let timelogEntryData: ITimelogEntryDataItem[] = [];
    let activityData: IActivityDataItem[] = [];

    let timelogEntrys: TimelogEntry[] = this.timelogEntrys;

    timelogEntrys.filter((timelogEntry) => {
      if (timelogEntry.startTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD') || timelogEntry.endTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {
        return timelogEntry;
      }
    });



    timelogEntrys.forEach((timelogEntry) => {
      timelogEntryData.push({
        timelogEntryId: timelogEntry.id,
        description: timelogEntry.description,
        seconds: timelogEntry.duration*60
      });

      timelogEntry.activities.forEach((timelogEntryActivity: TimelogEntryActivity)=>{
        let seconds:number = 0;

        if(timelogEntry.startTime.isBefore(date.startOf('day')) && timelogEntry.endTime.isAfter(date.startOf('day'))){
          seconds = timelogEntry.endTime.diff((date.startOf('day')),"seconds") / timelogEntry.activities.length;
        }else if(timelogEntry.startTime.isSameOrAfter(date.startOf('day')) && timelogEntry.endTime.isSameOrBefore(date.endOf('day'))){
          seconds = timelogEntry.endTime.diff(timelogEntry.startTime,"seconds") / timelogEntry.activities.length;
        }else if(timelogEntry.startTime.isBefore(date.endOf('day')) && timelogEntry.endTime.isAfter(date.endOf('day'))){
          seconds = date.endOf("day").diff(timelogEntry.startTime,"seconds") / timelogEntry.activities.length;
        }


        let alreadyIn: boolean = false;
        activityData.forEach((activityDataItem)=>{
          if(activityDataItem.activityTreeId == timelogEntryActivity.activityTreeId){
            activityDataItem.seconds += seconds;
            alreadyIn = true;

          }
        });
        if(!alreadyIn){
          activityData.push({
            activityTreeId: timelogEntryActivity.activityTreeId,
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
      foundDay.timelogEntryData = timelogEntryData;
      day = foundDay;

    } else {
      //Create new day
      day = new Day('', this._authStatus.user.id, moment(date).format('YYYY-MM-DD'));
      day.activityData = activityData;
      day.timelogEntryData = timelogEntryData;
      
    }

    this.daybookService.saveDayHTTP(day);
    // let this.daybookService.last365Days
  }





}
