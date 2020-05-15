import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import { DailyTaskList } from './daily-task-list.class';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus } from '../../../../authentication/auth-status.class';

import * as moment from 'moment';
import { serverUrl } from '../../../../serverurl';
import { map } from 'rxjs/operators';
import { RoutineDefinitionService } from '../../../../dashboard/activities/routines/api/routine-definition.service';
import { ServiceAuthenticates } from '../../../../authentication/service-authentication-garbage/service-authenticates.interface';
import { ServiceAuthenticationAttempt } from '../../../../authentication/service-authentication-garbage/service-authentication-attempt.interface';


@Injectable({
  providedIn: 'root'
})
export class DailyTaskListService implements ServiceAuthenticates{

  private serverUrl = serverUrl;

  constructor(private httpClient: HttpClient, private routineDefinitionService: RoutineDefinitionService) { }

  private _userId: string;
  private _loginComplete$: BehaviorSubject<ServiceAuthenticationAttempt> = new BehaviorSubject({authenticated: false, message: ''});
  private _today: moment.Moment;
  private _clockSubscription: Subscription = new Subscription();
  public synchronousLogin(userId: string) { return false; }
  public login$(userId: string): Observable<ServiceAuthenticationAttempt>{
    this._today = moment();
    this._userId = userId;
    
    this._clockSubscription = timer(1, 30000).subscribe(()=>{
      if(moment().format('YYYY-MM-DD') != moment(this._today).format('YYYY-MM-DD')){
        this._today = moment();
      }
      this.httpGetDailyTaskListDataInRange(moment().subtract(1, "year"), moment().add(1, "year"));
    })
    this.httpGetDailyTaskListDataInRange(moment().subtract(1, "year"), moment().add(1, "year"));
    return this._loginComplete$.asObservable();
  }
  public logout(){
    this._clockSubscription.unsubscribe();
    this._userId = "";
    this._dailyTaskLists$.next([]);
  }


  private _dailyTaskLists$: BehaviorSubject<DailyTaskList[]> = new BehaviorSubject([]);
  public get dailyTaskLists(): DailyTaskList[] {
    return this._dailyTaskLists$.getValue();
  }
  public get dailyTaskLists$(): Observable<DailyTaskList[]> {
    return this._dailyTaskLists$.asObservable();
  }


  public get todaysDailyTaskList(): DailyTaskList {
    return this._dailyTaskLists$.getValue().find((taskList)=>{
      return taskList.dateYYYYMMDD == moment().format('YYYY-MM-DD');
    })
  }



  private httpGetDailyTaskListDataInRange(startDate: moment.Moment, endDate: moment.Moment) {
    const getUrl = this.serverUrl + "/api/daily-task-list/" + this._userId + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{message: string;data: any;}>(getUrl, httpOptions)
      .pipe<DailyTaskList[]>(map((response: {message: string;data: any[];}) => {
        return response.data.map((data) => {
          return this.buildDailyTaskListFromResponse(data);
        });
      }))
      .subscribe((dailyTaskList: DailyTaskList[]) => {
        this._dailyTaskLists$.next(dailyTaskList);
        // if(!this.todaysDailyTaskList){
        //   this.httpSaveDailyTaskList(this.recurringTaskService.generateDailyTaskListItemsForDate(this._today.format("YYYY-MM-DD")) );
        // }
        this.updateSubscriptions();
        this._loginComplete$.next({
          authenticated: true,
          message: 'Successfully logged in to DailyTaskListService'
        });
      });

  }
  httpSaveDailyTaskList(dailyTaskListToSave: DailyTaskList) {
    let requestUrl: string = serverUrl + "/api/daily-task-list/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(requestUrl, dailyTaskListToSave.httpCreate, httpOptions)
      .pipe<DailyTaskList>(map((response) => {
        return this.buildDailyTaskListFromResponse(response.data);
      }))
      .subscribe((savedDailyTaskList: DailyTaskList) => {
        let dailyTaskList: DailyTaskList[] = this._dailyTaskLists$.getValue();
        dailyTaskList.push(savedDailyTaskList);
        this._dailyTaskLists$.next(dailyTaskList);
        this.updateSubscriptions();
      });
  }
  httpUpdateDailyTaskList(dailyTaskListToUpdate: DailyTaskList) {
    // console.log("Updating", dailyTaskListToUpdate)
    let requestUrl: string = serverUrl + "/api/daily-task-list/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(requestUrl, dailyTaskListToUpdate.httpUpdate, httpOptions)
      .pipe<DailyTaskList>(map((response) => {
        return this.buildDailyTaskListFromResponse(response.data);
      }))
      .subscribe((updatedDailyTaskList) => {
        let allDailyTaskList: DailyTaskList[] = this._dailyTaskLists$.getValue();
        allDailyTaskList.splice(allDailyTaskList.indexOf(dailyTaskListToUpdate), 1, updatedDailyTaskList);
        this._dailyTaskLists$.next(allDailyTaskList);
        this.updateSubscriptions();
      });
  }
  httpDeleteDailyTaskList(dailyTaskListToDelete: DailyTaskList) {
    const deleteUrl = this.serverUrl + "/api/daily-task-list/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{message: string;data: any;}>(deleteUrl, dailyTaskListToDelete.httpDelete, httpOptions)
      .subscribe((response) => {
        let allDailyTaskList: DailyTaskList[] = this._dailyTaskLists$.getValue();
        allDailyTaskList.splice(allDailyTaskList.indexOf(dailyTaskListToDelete), 1);
        this._dailyTaskLists$.next(allDailyTaskList);
        this.updateSubscriptions();
      });
  }

  private buildDailyTaskListFromResponse(responseData): DailyTaskList{
    return new DailyTaskList(responseData._id, responseData.userId, responseData.taskListItems, responseData.dateYYYYMMDD);
  }



  private _updateSubscriptions: Subscription[] = [];
  private updateSubscriptions() {
    this._updateSubscriptions.forEach((sub) => sub.unsubscribe());
    this._updateSubscriptions = [];
    this._dailyTaskLists$.getValue().forEach((dailyTaskList: DailyTaskList) => {
      this._updateSubscriptions.push(dailyTaskList.saveChanges$.subscribe(() => {
        console.log("Save change request --> httpUpdate()")
        this.httpUpdateDailyTaskList(dailyTaskList);
      }));
    });
  }


}
