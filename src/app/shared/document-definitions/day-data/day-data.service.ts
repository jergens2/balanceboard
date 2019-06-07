import { Injectable } from '@angular/core';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


import * as moment from 'moment';
import { DayData } from './day-data.class';
import { RecurringTasksService } from '../recurring-task/recurring-tasks.service';
import { DailyTaskChecklistItem } from '../../tools/tool-components/dtcl-tool/daily-task-checklist-item.class';


@Injectable({
  providedIn: 'root'
})
export class DayDataService {

  constructor(private httpClient: HttpClient, private recurringTaskDefinitionService: RecurringTasksService) { }

  private serverUrl = serverUrl;

  private _authStatus: AuthStatus;
  private _loginComplete$: Subject<boolean> = new Subject();

  login$(authStatus: AuthStatus): Observable<boolean>{
    this._authStatus = authStatus;
    this.getInitialDayDataRange();
    return this._loginComplete$;
  }
  logout() {
    this._authStatus = null;
  }


  public checkForDayData(date: moment.Moment):DayData{
    let dayData: DayData = this.yearsDayData.find((dayData)=>{ return dayData.dateYYYYMMDD == date.format('YYYY-MM-DD'); });
    if(!dayData){
      dayData = this.buildNewDayData(date);
      this.httpSaveDayData(dayData);
    }else{
      return dayData;
    }
    return null;
  }

  private getInitialDayDataRange(){
    this.httpGetDaysInRange(moment().subtract(365, "days"), moment().add(365, "days"));
  }
  private _yearsDayData$: BehaviorSubject<DayData[]> = new BehaviorSubject(null);
  public get yearsDayData(): DayData[] {
    return this._yearsDayData$.getValue();
  }
  public get yearsDayData$(): Observable<DayData[]> {
    return this._yearsDayData$.asObservable();
  }




  private httpGetDaysInRange(startDate: moment.Moment, endDate: moment.Moment) {
    const getUrl = this.serverUrl + "/api/day-data/" + this._authStatus.user.id + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DayData[]>(map((response: { message: string, data: any[] }) => {
        return response.data.map((data)=>{
          return this.buildDayDataFromResponse(data);
        });
      }))
      .subscribe((dayData: DayData[])=>{
        console.log("This is all of the day data", dayData);
        this._yearsDayData$.next(dayData);
        this.updateYearsDataSubscriptions();
        this._loginComplete$.next(true);
      })
  }

  httpSaveDayData(dayDataToSave: DayData){
    let requestUrl: string = serverUrl + "/api/day-data/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(requestUrl, dayDataToSave.httpCreate, httpOptions)
      .pipe<DayData>(map((response)=>{
        return this.buildDayDataFromResponse(response.data);
      }))
      .subscribe((savedDayData: DayData)=>{
        let dayData: DayData[] = this._yearsDayData$.getValue();
        dayData.push(savedDayData);
        this._yearsDayData$.next(dayData);
        this.updateYearsDataSubscriptions();
      });

  }

  httpUpdateDayData(dayDataToUpdate: DayData){
    // console.log("Updating", dayDataToUpdate)
    let requestUrl: string = serverUrl + "/api/day-data/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(requestUrl, dayDataToUpdate.httpUpdate, httpOptions)
      .pipe<DayData>(map((response) => {
        return this.buildDayDataFromResponse(response.data);
      }))
      .subscribe((updatedDayData)=>{
        let allDayData: DayData[] = this._yearsDayData$.getValue();
        allDayData.splice(allDayData.indexOf(dayDataToUpdate), 1, updatedDayData);
        this._yearsDayData$.next(allDayData);
        this.updateYearsDataSubscriptions();
      })

  }

  httpDeleteDayData(dayDataToDelete: DayData){
    const deleteUrl = this.serverUrl + "/api/day-data/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(deleteUrl, dayDataToDelete.httpDelete, httpOptions)
      .subscribe((response) => {
        let allDayData: DayData[] = this._yearsDayData$.getValue();
        allDayData.splice(allDayData.indexOf(dayDataToDelete), 1);
        this._yearsDayData$.next(allDayData);
      })
  }


  private buildNewDayData(date: moment.Moment):DayData{
    let newData = new DayData("", this._authStatus.user.id, date.format('YYYY-MM-DD'));
    newData.dailyTaskListItems = this.recurringTaskDefinitionService.getDTLItemsForNewDayData(date);
    return newData;
  }
  
  private buildDayDataFromResponse(responseData){
    let rd: any = responseData;
    let dayData: DayData = new DayData(rd._id, rd.userId, rd.dateYYYYMMDD);
    
    
    dayData.activityData = rd.activityData;
    dayData.dailyTaskListItems = (rd.dailyTaskListItems as any[]).map<DailyTaskChecklistItem>((dataItem)=>{
      return new DailyTaskChecklistItem(dataItem.recurringTaskId, dataItem.name, dataItem.completionDate);
    });
    dayData.taskData = rd.taskData;
    dayData.timelogEntryData = rd.timelogEntryData;
    
    console.log("Day", dayData);

    return dayData;
  }


  private _updateSubscriptions: Subscription[] = [];
  private updateYearsDataSubscriptions(){
    this._updateSubscriptions.forEach((sub)=>sub.unsubscribe());
    this._updateSubscriptions = [];
    this._yearsDayData$.getValue().forEach((dayData: DayData)=>{
      this._updateSubscriptions.push(dayData.updates$.subscribe(()=>{
        this.httpUpdateDayData(dayData);
      }));
    })
  }

}
