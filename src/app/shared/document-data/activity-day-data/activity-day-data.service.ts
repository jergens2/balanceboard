
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.model';

import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { ActivitiesService } from '../../../dashboard/activities/activities.service';
import { ActivityDayData, ActivityDayDataItem } from './activity-day-data.class';
import { ServiceAuthenticates } from '../../../authentication/service-authentication.interface';


@Injectable({
  providedIn: 'root'
})
export class ActivityDayDataService implements ServiceAuthenticates{

  private serverUrl = serverUrl;

  constructor(private httpClient: HttpClient, private activitiesService: ActivitiesService) { }

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _today: moment.Moment;
  private _clockSubscription: Subscription = new Subscription();
  public login$(authStatus: AuthStatus): Observable<boolean>{
    this._today = moment();
    let milliseconds: number = moment(this._today).endOf("day").diff(this._today, "milliseconds");
    this._clockSubscription = timer(1, milliseconds).subscribe(()=>{
      if(moment().format('YYYY-MM-DD') != moment(this._today).format('YYYY-MM-DD')){
        this._today = moment();
      }
    })
    this._authStatus = authStatus;
    this.httpGetActivityDayDataInRange(moment().subtract(1, "year"), moment().add(1, "year"));
    return this._loginComplete$.asObservable();
  }
  public logout(){
    this._clockSubscription.unsubscribe();
  }


  private _activityDayDatas$: BehaviorSubject<ActivityDayData[]> = new BehaviorSubject([]);
  public get activityDayDatas(): ActivityDayData[] {
    return this._activityDayDatas$.getValue();
  }
  public get activityDayDatas$(): Observable<ActivityDayData[]> {
    return this._activityDayDatas$.asObservable();
  }

  httpUpdateActivityDayDataByDate(date:moment.Moment, activityData: ActivityDayDataItem[]){
    let activityDayData: ActivityDayData = new ActivityDayData("", this._authStatus.user.id, date.format("YYYY-MM-DD"), activityData, this.activitiesService);
    let requestUrl: string = serverUrl + "/api/activity-day-data/update-by-date";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(requestUrl, activityDayData.httpUpdate, httpOptions)
      .pipe<ActivityDayData>(map((response) => {
        return this.buildActivityDayDataFromResponse(response.data);
      }))
      .subscribe((updatedActivityDayData) => {
        let allActivityDayData: ActivityDayData[] = this._activityDayDatas$.getValue();
        let index: number = allActivityDayData.findIndex((activityDayData)=>{return activityDayData.dateYYYYMMDD == date.format('YYYY-MM-DD'); });
        if(index >= 0){
          allActivityDayData.splice(index, 1, updatedActivityDayData);
        }
        this._activityDayDatas$.next(allActivityDayData);
      });
    
  }



  private httpGetActivityDayDataInRange(startDate: moment.Moment, endDate: moment.Moment) {
    const getUrl = this.serverUrl + "/api/activity-day-data/" + this._authStatus.user.id + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{message: string;data: any;}>(getUrl, httpOptions)
      .pipe<ActivityDayData[]>(map((response: {message: string;data: any[];}) => {
        return response.data.map((data) => {
          return this.buildActivityDayDataFromResponse(data);
        });
      }))
      .subscribe((activityDayData: ActivityDayData[]) => {
        this._activityDayDatas$.next(activityDayData);
        this._loginComplete$.next(true);
      });

  }

  httpSaveActivityDayData(activityDayDataToSave: ActivityDayData) {
    let requestUrl: string = serverUrl + "/api/activity-day-data/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(requestUrl, activityDayDataToSave.httpCreate, httpOptions)
      .pipe<ActivityDayData>(map((response) => {
        return this.buildActivityDayDataFromResponse(response.data);
      }))
      .subscribe((savedActivityDayData: ActivityDayData) => {
        let activityDayData: ActivityDayData[] = this._activityDayDatas$.getValue();
        activityDayData.push(savedActivityDayData);
        this._activityDayDatas$.next(activityDayData);
      });
  }
  httpUpdateActivityDayData(activityDayDataToUpdate: ActivityDayData) {
    let requestUrl: string = serverUrl + "/api/activity-day-data/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(requestUrl, activityDayDataToUpdate.httpUpdate, httpOptions)
      .pipe<ActivityDayData>(map((response) => {
        return this.buildActivityDayDataFromResponse(response.data);
      }))
      .subscribe((updatedActivityDayData) => {
        let allActivityDayData: ActivityDayData[] = this._activityDayDatas$.getValue();
        allActivityDayData.splice(allActivityDayData.indexOf(activityDayDataToUpdate), 1, updatedActivityDayData);
        this._activityDayDatas$.next(allActivityDayData);
      });
  }
  httpDeleteActivityDayData(activityDayDataToDelete: ActivityDayData) {
    const deleteUrl = this.serverUrl + "/api/activity-day-data/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(deleteUrl, activityDayDataToDelete.httpDelete, httpOptions)
      .subscribe((response) => {
        let allActivityDayData: ActivityDayData[] = this._activityDayDatas$.getValue();
        allActivityDayData.splice(allActivityDayData.indexOf(activityDayDataToDelete), 1);
        this._activityDayDatas$.next(allActivityDayData);
      });
  }

  private buildActivityDayDataFromResponse(responseData: any): ActivityDayData{
    return new ActivityDayData(responseData._id, responseData.userId, responseData.dateYYYYMMDD, responseData.activityDataItems, this.activitiesService);
  }



}
