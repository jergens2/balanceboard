import { Injectable } from '@angular/core';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


import * as moment from 'moment';
import { Task } from '../../../dashboard/tasks/task/task.model';
import { DayData } from './day-data.class';


@Injectable({
  providedIn: 'root'
})
export class DayDataService {

  constructor(private httpClient: HttpClient) { }

  private serverUrl = serverUrl;

  private _authStatus: AuthStatus;
  private _loginComplete$: Subject<boolean> = new Subject();
  login$(authStatus: AuthStatus): Observable<boolean>{
    this._authStatus = authStatus;
    
    // //old method
    // this.setDate$(moment());
  

    // //new method
    this.getLast365Days();

    return this._loginComplete$;
  
  }


  logout() {
    this._authStatus = null;
  }



  private getLast365Days(){
    
    this.getDaysInRangeHTTP$(moment().subtract(365, "days"), moment()).subscribe((days: DayData[])=>{
      this._last365Days$.next(days);
      this._loginComplete$.next(true);
    })
    
  }


  private setDate$(date: moment.Moment): Observable<DayData>{
    this.setDate(date);
    return this._currentDay$.asObservable();
  }
  public setDate(date: moment.Moment){
    // console.log("changing the date / setting date in service:", date.format('YYYY-MM-DD'))
    this.getDayHTTP(date);
    
  }
  public get date(): moment.Moment{ 
    return moment(this._currentDay$.getValue().date);
  }

  private _last365Days$: BehaviorSubject<DayData[]> = new BehaviorSubject(null);
  public get last365Days(): DayData[] {
    return this._last365Days$.getValue();
  }
  public get last365Days$(): Observable<DayData[]> {
    return this._last365Days$.asObservable();
  }
  private _currentDay$: BehaviorSubject<DayData> = new BehaviorSubject(null);
  public get currentDay(): DayData {
    // console.log("current value of DayData from service: ", this._currentDay$.getValue());
    return this._currentDay$.getValue();
  }
  public get currentDay$(): Observable<DayData> {
    return this._currentDay$.asObservable();
  }



  // public setPrimaryTask(task: Task, date: moment.Moment) {
  //   // console.log("setting primary task for date:", date.format('YYYY-MM-DD'))
  //   if(this._currentDay$.getValue() != null){
  //     if (this._currentDay$.getValue().date.format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {

  //       let first = this._currentDay$.getValue().primaryTask;
  //       this._currentDay$.getValue().primaryTask = task;
  //       let second = this._currentDay$.getValue().primaryTask;
  //       console.log("Task set, compare first to second: ", first, second);
  //       this.saveDayHTTP(this._currentDay$.getValue());
  
  //     } else {
  //       console.log("Error: dates are not the same :(");
  //     }
  //   }else{
  //     console.log("Error: DayData value is null.  This shouldn't happen.");
  //   }
  // }

  public getDaysInRangeHTTP$(startDate: moment.Moment, endDate: moment.Moment):Observable<DayData[]>{
    const getUrl = this.serverUrl + "/api/day-data/" + this._authStatus.user.id + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DayData[]>(map((response: { message: string, data: any[] }) => {

        let days: DayData[] = [];

        response.data.forEach((data)=>{
          let dayData = new DayData(data._id, data._userId, data.dateYYYYMMDD)
          dayData.activityData = data.activityData;
          dayData.dailyTaskListData = data.dailyTaskListData;
          dayData.taskData = data.taskData;
          dayData.timelogEntryData = data.timelogEntryData;
          days.push(dayData);
        })

        days.sort((day1, day2)=>{
          if(day1.dateYYYYMMDD < day2.dateYYYYMMDD){
            return -1;
          }
          if(day1.dateYYYYMMDD > day2.dateYYYYMMDD){
            return 1;
          }
          return 0;
        })

        // console.log("Returning days: ", days);
        // for(let (dayData as any) in (daysData as any[])){

        //   let DayData = new DayData(dayData._id, dayData._userId, dayData.dateYYYYMMDD)

        //   days.push();
        // }
        

        return days;
      }))
  }

  public getDayHTTP(date: moment.Moment) {
    const getUrl = this.serverUrl + "/api/day-data/" + this._authStatus.user.id + "/" + date.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DayData>(map((response: { message: string, data: any }) => {

        let data: any = response.data;

        
        let dayData = new DayData(data._id, data._userId, data.dateYYYYMMDD);
        return dayData;
      }))
      .subscribe((dayData: DayData) => {
        // console.log("All good: nexting value: ", DayData)
        this._currentDay$.next(dayData);
      }, (error) => {
        if (error.status == 404) {
          let dayData = new DayData('', this._authStatus.user.id, moment(date).format('YYYY-MM-DD'));
          // console.log("error 404. creating new DayData.  Nexting new DayData value")
          this._currentDay$.next(dayData);
        }else{
          // console.log("error: ", error);
        }
      })

  }

  saveDayHTTP(dayData: DayData){
    console.log("Saving DayData: ", dayData);

    let requestUrl: string = "";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    let requestBody: any = {};


    if (dayData.id == "") {
      //Save DayData
      requestUrl = this.serverUrl + "/api/DayData/create";


      requestBody = {
        userId: this._authStatus.user.id,
        dateYYYYMMDD: dayData.date.format('YYYY-MM-DD'),
        activityData: dayData.activityData,
        dailyTaskListData: dayData.dailyTaskListData,
        taskData: dayData.taskData,
        timelogEntryData: dayData.timelogEntryData
      };
    } else {
      //Update DayData
      requestUrl = this.serverUrl + "/api/DayData/update";
      requestBody = {
        id: dayData.id,
        userId: dayData.userId,
        dateYYYYMMDD: dayData.date.format('YYYY-MM-DD'),
        activityData: dayData.activityData,
        dailyTaskListData: dayData.dailyTaskListData,
        taskData: dayData.taskData,
        timelogEntryData: dayData.timelogEntryData
      };




    }

    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<DayData>(map((response) => {
        let rd: any = response.data;
        let dayData: DayData = new DayData(rd._id, rd.userId, rd.dateYYYYMMDD);
        
        dayData.activityData = rd.activityData;
        dayData.dailyTaskListData = rd.dailyTaskListData;
        dayData.taskData = rd.taskData;
        dayData.timelogEntryData = rd.timelogEntryData;
        
        return dayData;
      }))
      .subscribe((savedDay)=>{
        console.log("DayData saved", savedDay);
        let last365Days: DayData[] = this._last365Days$.getValue();
        let index:number = -1;
        last365Days.forEach((existingDay)=>{
          if(dayData.id == existingDay.id){
            index = last365Days.indexOf(existingDay);
          }
        });
        if(index>=0){
          last365Days.splice(index,1,savedDay);
        }

        this._last365Days$.next(last365Days);

      })

  }


  private deleteTemplateHTTP(DayData: DayData) {
    // const postUrl = this.serverUrl + "/api/dayTemplate/delete";
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //     // 'Authorization': 'my-auth-token'
    //   })
    // };

    // this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate, httpOptions)
    //   .subscribe((response) => {
    //     let dayTemplates: DayTemplate[] = this._dayTemplates;
    //     dayTemplates.splice(dayTemplates.indexOf(dayTemplate), 1);

    //     this._dayTemplates$.next(dayTemplates);
    //   })
  }




}
