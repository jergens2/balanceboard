import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, Subscription, timer } from 'rxjs';
import { TimelogEntry } from './timelog-entry/timelog-entry.class';

import * as moment from 'moment';

import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../../authentication/auth-status.model';

import { ActivitiesService } from '../../activities/activities.service';
import { DaybookService } from '../daybook.service';
import { ITLEActivity } from './timelog-entry/timelog-entry-activity.interface';



@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  private _authStatus: AuthStatus = null;
  private _loginComplete$: Subject<boolean> = new Subject();
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.fetchTimelogEntrysByRange(moment().startOf('day').subtract(1, 'days'), moment().endOf('day').add(1, 'days'));


    this.subscribeToUpdates();

    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._timelogEntries = [];
    this._timelogEntries$.next(this._timelogEntries);
    this._timerSubscription.unsubscribe();
  }

  public get userId(): string {
    return this._authStatus.user.id;
  }

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService, private daybookService: DaybookService) {
  }

  private _serverUrl: string = serverUrl;

  private _timelogEntries: TimelogEntry[] = [];
  private _timelogEntries$: Subject<TimelogEntry[]> = new Subject();
  public get timelogEntries$(): Observable<TimelogEntry[]> {
    return this._timelogEntries$.asObservable();
  }
  public get timelogEntries(): TimelogEntry[] {
    return this._timelogEntries;
  }

  public get mostRecentTimelogEntry(): TimelogEntry {
    if (this._timelogEntries.length > 0) {
      let timelogEntries = this._timelogEntries.sort((ts1, ts2) => {
        if (ts1.startTime.isAfter(ts2.startTime)) {
          return -1;
        }
        if (ts1.startTime.isBefore(ts2.startTime)) {
          return 1;
        }
        return 0;
      })
      return timelogEntries[0];
    } else {
      return null;
    }

  }

  private _timerSubscription: Subscription = new Subscription();
  private subscribeToUpdates() {
    this._timerSubscription = timer(0, 30000).subscribe((event) => {
      this.fetchTimelogEntrysByRange(moment().startOf('day').subtract(1, 'days'), moment().endOf('day').add(1, 'days'));
    });
  }


  updateTimelogEntry(timelogEntry: TimelogEntry) {
    console.log("Updating time entry: ", timelogEntry);
    const postUrl = this._serverUrl + "/api/timelogEntry/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, timelogEntry.httpUpdate, httpOptions)
      .pipe<TimelogEntry>(map((response) => {
        return this.buildTimelogEntry(response.data);
      }))
      .subscribe((returnedTimelogEntry: TimelogEntry) => {
        let timelogEntries: TimelogEntry[] = this._timelogEntries;
        for (let timelogEntry of timelogEntries) {
          if (timelogEntry.id == returnedTimelogEntry.id) {
            timelogEntries.splice(timelogEntries.indexOf(timelogEntry), 1, returnedTimelogEntry)
          }
        }
        this._timelogEntries = Object.assign([], timelogEntries);
        this._timelogEntries$.next(this._timelogEntries);
        this.updateDayData(timelogEntry.startTime, timelogEntry.endTime);
      });
  }

  saveTimelogEntry(timelogEntry: TimelogEntry) {
    console.log("Saving new timelogEntry", timelogEntry);
    const postUrl = this._serverUrl + "/api/timelogEntry/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, timelogEntry.httpSave, httpOptions)
      .pipe<TimelogEntry>(map((response) => {
        return this.buildTimelogEntry(response.data);
      }))
      .subscribe((timelogEntry: TimelogEntry) => {
        console.log("saved time entry was ", timelogEntry);
        let timelogEntries: TimelogEntry[] = this._timelogEntries;
        timelogEntries.push(timelogEntry);
        this._timelogEntries = Object.assign([], timelogEntries);
        this._timelogEntries$.next(this._timelogEntries);
        this.updateDayData(timelogEntry.startTime, timelogEntry.endTime);
      })
  }

  deleteTimelogEntry(timelogEntry: TimelogEntry) {
    console.log("DELETING", timelogEntry);
    const postUrl = this._serverUrl + "/api/timelogEntry/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, timelogEntry.httpDelete, httpOptions)
      .subscribe((response: any) => {
        console.log("Response from server:", response);
        let timelogEntries: TimelogEntry[] = this._timelogEntries;
        timelogEntries.splice(timelogEntries.indexOf(timelogEntry), 1);

        this._timelogEntries = Object.assign([], timelogEntries);
        this._timelogEntries$.next(timelogEntries);
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
      .pipe<TimelogEntry[]>(map((response) => {
        return this.buildTimelogEntries(response.data as any[]);
      }))
      .subscribe((timelogEntries: TimelogEntry[]) => {
        this._timelogEntries = timelogEntries;
        this._timelogEntries$.next(this._timelogEntries);
        this._loginComplete$.next(true);
      });

  }

  private buildTimelogEntries(responseData: any[]): TimelogEntry[] {
    return responseData.map((dataObject: any) => {
      return this.buildTimelogEntry(dataObject);
    });
  }
  private buildTimelogEntry(dataObject: any): TimelogEntry {
    let itleData: any[] = dataObject.itleActivities;
    let itleActivities: ITLEActivity[] = this.buildITLEActivities(itleData);
    let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description, this.activitiesService);
    timelogEntry.setTleActivities(itleActivities);
    timelogEntry.description = dataObject.description;
    if (dataObject.timeISO) {
      /* 
        2018-11-23
        This check is here for previous versions of the timelogEntry where there used to be a property called timeISO.
      */
      console.log("this shit is old af and this method is disabled.")
      // timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
    }
    return timelogEntry;
  }

  private buildITLEActivities(itleData: any[]): ITLEActivity[] {
    let itleActivities: ITLEActivity[] = [];
    itleData.forEach((itleItem: any) => {
      if (itleItem.activityTreeId) {
        let durationMinutes: number = 0;
        if(itleItem.durationMinutes){
          // console.log("This is a valid ITLEActivity item from the database");
          durationMinutes = itleItem.durationMinutes;
        }else{
          // console.log("Has a tree ID, but no duration.");
        }
        
        if(durationMinutes == 0){
          // console.log("Duration minutes is 0. currently doing nothing about this.");
        }
        itleActivities.push({
          activityTreeId: itleItem.activityTreeId,
          durationMinutes: durationMinutes,
        })
      } else {
        console.log("The ITLEActivity data from database is not valid / is an older type", itleItem);
      }
    });
    return itleActivities;
  }

  // public fetchTimelogEntrysByRange$(startTime: moment.Moment, endTime: moment.Moment): Observable<TimelogEntry[]> {
  //   const getUrl = this._serverUrl + "/api/timelogEntry/" + this._authStatus.user.id + "/" + startTime.toISOString() + "/" + endTime.toISOString();
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //       // 'Authorization': 'my-auth-token'  
  //     })
  //   };
  //   return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
  //     .pipe<TimelogEntry[]>(map((response) => {
  //       return response.data.map((dataObject) => {
  //         let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description);
  //         if (dataObject.timeISO) {
  //           /* 
  //             2018-11-23
  //             This check is here for previous versions of the timelogEntry where there used to be a property called timeISO.
  //           */
  //           console.log("this shit must be old");
  //           timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.timeISO, dataObject.timeISO, dataObject.description);
  //           return;
  //         }
  //         timelogEntry.description = dataObject.description;

  //         let activities: Array<any> = dataObject.activities as Array<any>;
  //         if (activities.length > 0) {
  //           //if the element in the array has a property called .activity , then it is of new type of activity as of 2018-12-13
  //           if (activities[0].activityTreeId != null) {
  //             timelogEntry.activities = this.buildTimelogEntryActivities(activities, timelogEntry.startTime, timelogEntry.endTime);
  //           } else {
  //             console.log("this shit must be old");
  //             // timelogEntry.receiveOldActivities(dataObject.activities as UserDefinedActivity[])
  //             return;
  //           }
  //         }


  //         return timelogEntry;
  //       })
  //     }))
  // }

  private updateDayData(startTime: moment.Moment, endTime: moment.Moment) {
    console.log("Warning.  This method is currently disabled.");

    // if (startTime.format('YYYY-MM-DD') == endTime.format('YYYY-MM-DD')) {

    // } else {
    //   console.log("Start time and end time are not the same, this is unhandled.");
    //   //need to make sure we update both days of year.
    // }

    // let date: moment.Moment = moment(startTime);
    // // console.log(this.daybookService.last365Days)
    // let foundDay: Day = this.daybookService.last365Days.find((day) => {
    //   return day.dateYYYYMMDD == date.format('YYYY-MM-DD');
    // });
    // // console.log("Found day is ", foundDay);



    // let timelogEntryData: ITimelogEntryDataItem[] = [];
    // let activityData: IActivityDataItem[] = [];

    // let timelogEntries: TimelogEntry[] = this.timelogEntries;

    // timelogEntries.filter((timelogEntry) => {
    //   if (timelogEntry.startTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD') || timelogEntry.endTime.format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {
    //     return timelogEntry;
    //   }
    // });



    // timelogEntries.forEach((timelogEntry) => {
    //   timelogEntryData.push({
    //     timelogEntryId: timelogEntry.id,
    //     description: timelogEntry.description,
    //     seconds: timelogEntry.duration*60
    //   });

    //   timelogEntry.activities.forEach((timelogEntryActivity: ITLEActivity)=>{
    //     let seconds:number = 0;

    //     if(timelogEntry.startTime.isBefore(date.startOf('day')) && timelogEntry.endTime.isAfter(date.startOf('day'))){
    //       seconds = timelogEntry.endTime.diff((date.startOf('day')),"seconds") / timelogEntry.activities.length;
    //     }else if(timelogEntry.startTime.isSameOrAfter(date.startOf('day')) && timelogEntry.endTime.isSameOrBefore(date.endOf('day'))){
    //       seconds = timelogEntry.endTime.diff(timelogEntry.startTime,"seconds") / timelogEntry.activities.length;
    //     }else if(timelogEntry.startTime.isBefore(date.endOf('day')) && timelogEntry.endTime.isAfter(date.endOf('day'))){
    //       seconds = date.endOf("day").diff(timelogEntry.startTime,"seconds") / timelogEntry.activities.length;
    //     }


    //     let alreadyIn: boolean = false;
    //     activityData.forEach((activityDataItem)=>{
    //       if(activityDataItem.activityTreeId == timelogEntryActivity.activityTreeId){
    //         activityDataItem.seconds += seconds;
    //         alreadyIn = true;

    //       }
    //     });
    //     if(!alreadyIn){
    //       activityData.push({
    //         activityTreeId: timelogEntryActivity.activityTreeId,
    //         seconds: seconds
    //       })

    //     }
    //   });

    // });
    // activityData.sort((a1, a2)=>{
    //   if(a1.seconds > a2.seconds){
    //     return -1;
    //   }
    //   if(a1.seconds < a2.seconds){
    //     return 1;
    //   }
    //   return 0;
    // });

    // let day: Day;
    // if (foundDay) {
    //   foundDay.activityData = activityData;
    //   foundDay.timelogEntryData = timelogEntryData;
    //   day = foundDay;

    // } else {
    //   //Create new day
    //   day = new Day('', this._authStatus.user.id, moment(date).format('YYYY-MM-DD'));
    //   day.activityData = activityData;
    //   day.timelogEntryData = timelogEntryData;

    // }

    // this.daybookService.saveDayHTTP(day);
    // // let this.daybookService.last365Days
  }





}
