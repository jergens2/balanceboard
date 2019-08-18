import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, Subscription, timer, BehaviorSubject } from 'rxjs';
import { TimelogEntry } from './timelog-entry.class';

import * as moment from 'moment';

import { serverUrl } from '../../../../serverurl';
import { map } from 'rxjs/operators';
import { AuthStatus } from '../../../../authentication/auth-status.class';

import { ActivityCategoryDefinitionService } from '../../../../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { ITLEActivity } from './timelog-entry-activity.interface';
import { ActivityDayDataService } from '../../../../shared/document-data/activity-day-data/activity-day-data.service';
import { ActivityDayDataItem, ActivityDayData } from '../../../../shared/document-data/activity-day-data/activity-day-data.class';
import { ServiceAuthenticates } from '../../../../authentication/service-authentication/service-authenticates.interface';



@Injectable({
  providedIn: 'root'
})
export class TimelogService implements ServiceAuthenticates{

  private _authStatus: AuthStatus = null;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean> {
    console.log("Timelog service is going to be depracated.  Destructinated.  Destroyed.  Boom.  First degree murdered. ")
    this._authStatus = authStatus;
    this.fetchTimelogEntrysByRange(moment().startOf('day').subtract(1, 'years'), moment().endOf('day').add(1, 'years'));
    this.subscribeToUpdates();
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;

    this._timelogEntries$.next([]);
    this._timerSubscription.unsubscribe();
  }

  public get userId(): string {
    return this._authStatus.user.id;
  }

  constructor(private httpClient: HttpClient, private activityCategoryDefinitionService: ActivityCategoryDefinitionService, private activityDataService: ActivityDayDataService) {
  }

  private _serverUrl: string = serverUrl;


  private _timelogEntries$: BehaviorSubject<TimelogEntry[]> = new BehaviorSubject([]);
  public get timelogEntries$(): Observable<TimelogEntry[]> {
    return this._timelogEntries$.asObservable();
  }
  public get timelogEntries(): TimelogEntry[] {
    return this._timelogEntries$.getValue();
  }

  public get mostRecentTimelogEntry(): TimelogEntry {
    if (this.timelogEntries.length > 0) {
      let timelogEntries = this.timelogEntries.sort((ts1, ts2) => {
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
        let timelogEntries: TimelogEntry[] = this.timelogEntries;
        for (let timelogEntry of timelogEntries) {
          if (timelogEntry.id == returnedTimelogEntry.id) {
            timelogEntries.splice(timelogEntries.indexOf(timelogEntry), 1, returnedTimelogEntry)
          }
        }
        this._timelogEntries$.next(timelogEntries);
        this.updateActivityData(returnedTimelogEntry);
      });
  }

  saveTimelogEntry(timelogEntry: TimelogEntry) {
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
        let timelogEntries: TimelogEntry[] = this.timelogEntries;
        timelogEntries.push(timelogEntry);
        this._timelogEntries$.next(timelogEntries);
        this.updateActivityData(timelogEntry);
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

    this.httpClient.post<{ message: string, data: any }>(postUrl, timelogEntry.httpDelete, httpOptions)
      .subscribe((response: any) => {
        let timelogEntries: TimelogEntry[] = this.timelogEntries;
        timelogEntries.splice(timelogEntries.indexOf(timelogEntry), 1);
        this._timelogEntries$.next(timelogEntries);
        this.updateActivityData(timelogEntry);
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
        this._timelogEntries$.next(timelogEntries);
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
    let timelogEntry = new TimelogEntry(dataObject._id, dataObject.userId, dataObject.startTimeISO, dataObject.endTimeISO, dataObject.description, this.activityCategoryDefinitionService);
    timelogEntry.setTleActivities(itleActivities);
    timelogEntry.description = dataObject.description;
    if (dataObject.timeISO) {
      console.log("this shit is old 2018-11-23 and this method is disabled.");
    }
    return timelogEntry;
  }

  private buildITLEActivities(itleData: any[]): ITLEActivity[] {
    let itleActivities: ITLEActivity[] = [];
    itleData.forEach((itleItem: any) => {
      if (itleItem.activityTreeId) {
        let durationMinutes: number = 0;
        if (itleItem.durationMinutes) {
          // console.log("This is a valid ITLEActivity item from the database");
          durationMinutes = itleItem.durationMinutes;
        } else {
          // console.log("Has a tree ID, but no duration.");
        }

        if (durationMinutes == 0) {
          // console.log("Duration minutes is 0. currently doing nothing about this.");
        }
        itleActivities.push({
          activityTreeId: itleItem.activityTreeId,
          durationMinutes: durationMinutes,
        })
      } else {
        // console.log("The ITLEActivity data from database is not valid / is an older type", itleItem);
      }
    });
    return itleActivities;
  }

  // private superSpecialBuildActivityDataRoutine() {

  //     console.log("Warning: super special routine")
  //     // this.timelogEntries.forEach((tle)=>{
  //     //   this.ZZupdateTimelogEntry(tle)
  //     // })
        
  //     let startDate = moment("2018-12-17");
  //     let currentDate = moment(startDate);
  //     let sub = new Subscription;
  //     while(currentDate.isBefore(moment())){
  //       console.log("Building activity day data for date: "+ currentDate.format('YYYY-MM-DD'))
  //       sub.unsubscribe();
  //       let data: ActivityDayData = new ActivityDayData("", this._authStatus.user.id, currentDate.format("YYYY-MM-DD"), this.generateActivityData(currentDate), this.activityCategoryDefinitionService )
  //       this.activityDataService.httpSaveActivityDayData(data);
  //       currentDate = moment(currentDate).add(1, "day");
  //     }

  // }



  // private ZZupdateTimelogEntry(timelogEntry: TimelogEntry){
  //   let duration = timelogEntry.durationMinutes;
  //   let sum = 0;
  //   timelogEntry.ITLEActivities.forEach((itlea)=>{
  //     sum += itlea.durationMinutes;
  //   })
  //   if(sum < duration){
  //     if(sum == 0){
  //       let evenlyDivided = duration / timelogEntry.ITLEActivities.length;
  //       timelogEntry.ITLEActivities.forEach((itlea)=>{
  //         itlea.durationMinutes = evenlyDivided;
  //       });
  //       console.log("Updating timelog entry: ", timelogEntry.startTimeISO)
  //       this.updateTimelogEntry(timelogEntry);
  //     }
  //     //   console.log("it was less than duration:", sum, duration)
  //     // }
      
  //   }
  // }


  private updateActivityData(timelogEntry: TimelogEntry) {


    // for(let date = moment("2019-01-01"); date.isBefore(moment("2019-06-20")); date = moment(date).add(1,"days")){
    //   console.log("Doing the thing: ", date.format("YYYY-MM-DD"));
      
    //   let activityData: ActivityDayDataItem[] = this.generateActivityData(date);
    //   this.activityDataService.httpUpdateActivityDayDataByDate(date, activityData);
    // }




    if(timelogEntry.startTime.format('YYYY-MM-DD') == timelogEntry.endTime.format('YYYY-MM-DD')){
      let activityData: ActivityDayDataItem[] = this.generateActivityData(timelogEntry.startTime);
      this.activityDataService.httpUpdateActivityDayDataByDate(timelogEntry.startTime, activityData);
    }else{
      let startActivityData: ActivityDayDataItem[] = this.generateActivityData(timelogEntry.startTime);
      this.activityDataService.httpUpdateActivityDayDataByDate(timelogEntry.startTime, startActivityData);
      let endActivityData: ActivityDayDataItem[] = this.generateActivityData(timelogEntry.endTime);
      this.activityDataService.httpUpdateActivityDayDataByDate(timelogEntry.endTime, endActivityData);
    }
  }
  private generateActivityData(date: moment.Moment): ActivityDayDataItem[] {
    let timelogEntries: TimelogEntry[] = this.timelogEntries.filter((timelogEntry) => {
      let crossesStart: boolean = (timelogEntry.startTime.isSameOrBefore(date.startOf("day")) && timelogEntry.endTime.isAfter(date.startOf("day")));
      let isDuring: boolean = (timelogEntry.startTime.isSameOrAfter(date.startOf("day")) && timelogEntry.endTime.isSameOrBefore(date.endOf("day")));
      let crossesEnd: boolean = (timelogEntry.startTime.isBefore(date.endOf("day")) && timelogEntry.endTime.isSameOrAfter(date.endOf("day")));
      return (crossesStart || isDuring || crossesEnd);
    });
    // console.log("  TimelogEntries for date " + date.format('YYYY-MM-DD') + "("+timelogEntries.length+")", timelogEntries);
    let activityData: ActivityDayDataItem[] = [];
    timelogEntries.forEach((timelogEntry: TimelogEntry) => {
      let crossesStart: boolean = (timelogEntry.startTime.isSameOrBefore(date.startOf("day")) && timelogEntry.endTime.isAfter(date.startOf("day")));
      // let isDuring: boolean = (timelogEntry.startTime.isSameOrAfter(date.startOf("day")) && timelogEntry.endTime.isSameOrBefore(date.endOf("day")));
      let crossesEnd: boolean = (timelogEntry.startTime.isBefore(date.endOf("day")) && timelogEntry.endTime.isSameOrAfter(date.endOf("day")));
      let totalMinutes:number = timelogEntry.endTime.diff(timelogEntry.startTime,"minutes");
      let maxMinutes: number = totalMinutes;
      if(crossesStart){
        totalMinutes = timelogEntry.endTime.diff(date.startOf("day"),"minutes");
      }
      if(crossesEnd){
        totalMinutes = date.endOf("day").diff(timelogEntry.startTime,"minutes");
      }


      timelogEntry.ITLEActivities.forEach((itleActivity: ITLEActivity) => {
        let isInActivityData: boolean = false;
        let itleMinutes:number = itleActivity.durationMinutes * (totalMinutes/maxMinutes);
        activityData.forEach((activityItem: ActivityDayDataItem) => {
          if (activityItem.activityTreeId == itleActivity.activityTreeId) {
            isInActivityData = true;
            activityItem.durationMinutes += itleMinutes;
          }
        });
        if (!isInActivityData) {
          activityData.push({
            activityTreeId: itleActivity.activityTreeId,
            durationMinutes: itleMinutes,
          })
        }
      });


      
    });
    activityData = activityData.sort((data1, data2)=>{
      if(data1.durationMinutes > data2.durationMinutes){
        return -1;
      }
      if(data1.durationMinutes < data2.durationMinutes){
        return 1;
      }
      return 0;
    });
    console.log("Returning activity data: ", activityData);
    return activityData;
  }




}
