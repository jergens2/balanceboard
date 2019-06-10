
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.model';

import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { map } from 'rxjs/operators';
import { ActivitiesService } from '../../../dashboard/activities/activities.service';
import { ActivityDayData } from './activity-day-data.class';
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


  // public get todaysActivityDayData(): ActivityDayData {
  //   return this._activityDayDatas$.getValue().find((taskList)=>{
  //     return taskList.dateYYYYMMDD == moment().format('YYYY-MM-DD');
  //   })
  // }



  private httpGetActivityDayDataInRange(startDate: moment.Moment, endDate: moment.Moment) {
    const getUrl = this.serverUrl + "/api/daily-task-list/" + this._authStatus.user.id + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
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
        // if(!this.todaysActivityDayData){
        //   this.httpSaveActivityDayData(this.recurringTaskService.generateActivityDayData(this._today));
        // }
        // this.updateSubscriptions();
        this._loginComplete$.next(true);
      });

  }
  httpSaveActivityDayData(activityDayDataToSave: ActivityDayData) {
    let requestUrl: string = serverUrl + "/api/daily-task-list/create";
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
        // this.updateSubscriptions();
      });
  }
  httpUpdateActivityDayData(activityDayDataToUpdate: ActivityDayData) {
    // console.log("Updating", activityDayDataToUpdate)
    let requestUrl: string = serverUrl + "/api/daily-task-list/update";
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
        // this.updateSubscriptions();
      });
  }
  httpDeleteActivityDayData(activityDayDataToDelete: ActivityDayData) {
    const deleteUrl = this.serverUrl + "/api/daily-task-list/delete";
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
        // this.updateSubscriptions();
      });
  }

  private buildActivityDayDataFromResponse(responseData: any): ActivityDayData{
    return new ActivityDayData(responseData._id, responseData.userId, responseData.activityDataItems, responseData.dateYYYYMMDD, this.activitiesService);
  }



  // private _updateSubscriptions: Subscription[] = [];
  // private updateSubscriptions() {
  //   this._updateSubscriptions.forEach((sub) => sub.unsubscribe());
  //   this._updateSubscriptions = [];
  //   this._activityDayDatas$.getValue().forEach((activityDayData: ActivityDayData) => {
  //     this._updateSubscriptions.push(activityDayData.saveChanges$.subscribe(() => {
  //       console.log("Save change request --> httpUpdate()")
  //       this.httpUpdateActivityDayData(activityDayData);
  //     }));
  //   });
  // }


}
