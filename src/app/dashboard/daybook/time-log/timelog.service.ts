import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, Subscription, timer } from 'rxjs';
import { TimelogEntry } from './timelog-entry/timelog-entry.class';

import * as moment from 'moment';

import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../../authentication/auth-status.model';

import { ActivitiesService } from '../../activities/activities.service';
import { ITLEActivity } from './timelog-entry/timelog-entry-activity.interface';
import { DayDataActivityDataItem } from '../../../shared/document-definitions/day-data/data-properties/activity-data-item.class';



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

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService) {
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
        this.updateDayData();
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
        this.updateDayData();
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
        this.updateDayData();
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


  private _generateActivityData$: Subject<DayDataActivityDataItem[]> = new Subject();
  public generateActivityData$(date: moment.Moment): Observable<DayDataActivityDataItem[]>{
    const getUrl = this._serverUrl + "/api/timelogEntry/" + this._authStatus.user.id + "/" + date.startOf("day").toISOString() + "/" + date.endOf("day").toISOString();
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
      .subscribe((timelogEntries)=>{
        console.log("wizzle wuzzle")
        let activityDataItems: DayDataActivityDataItem[] = [];
        this._generateActivityData$.next(activityDataItems);
      });
    return this._generateActivityData$.asObservable();
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



  private updateDayData() {
    console.log("Warning.  This method is currently disabled.");

    // To do:  every time we modify timelog entry, we should update the timelogEntryActivity data in the DayData object.
  }





}
