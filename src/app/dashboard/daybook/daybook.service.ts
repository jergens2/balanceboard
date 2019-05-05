import { Injectable } from '@angular/core';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Day } from './day/day.model';
import { map } from 'rxjs/operators';


import * as moment from 'moment';
import { Task } from '../tasks/task/task.model';


@Injectable({
  providedIn: 'root'
})
export class DaybookService {

  constructor(private httpClient: HttpClient) { }

  private serverUrl = serverUrl;

  private _authStatus: AuthStatus;
  login$(authStatus: AuthStatus): Observable<Day>{
    this._authStatus = authStatus;
    return this.setDate$(moment());
  }

  logout() {
    this._authStatus = null;
  }


  private setDate$(date: moment.Moment): Observable<Day>{
    this.setDate(date);
    return this._currentDay$.asObservable();
  }
  public setDate(date: moment.Moment){
    console.log("changing the date / setting date in service:", date.format('YYYY-MM-DD'))
    this.getDayHTTP(date);
    
  }
  public get date(): moment.Moment{ 
    return moment(this._currentDay$.getValue().date);
  }

  private _currentDay$: BehaviorSubject<Day> = new BehaviorSubject(null);
  public get currentDay(): Day {
    console.log("current value of day from service: ", this._currentDay$.getValue());
    return this._currentDay$.getValue();
  }
  public get currentDay$(): Observable<Day> {
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
  //     console.log("Error: day value is null.  This shouldn't happen.");
  //   }
  // }

  public getDaysInRange$(startDate: moment.Moment, endDate: moment.Moment):Observable<Day[]>{
    const getUrl = this.serverUrl + "/api/day/" + this._authStatus.user.id + "/" + startDate.format('YYYY-MM-DD') + "/" + endDate.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<Day[]>(map((response: { message: string, data: any[] }) => {

        let days: Day[] = [];

        response.data.forEach((data)=>{
          let day = new Day(data._id, data._userId, data.dateYYYYMMDD)
          day.activityData = data.activityData;
          day.dailyTaskListData = data.dailyTaskListData;
          day.taskData = data.taskData;
          day.timeSegmentData = data.timeSegmentData;
          days.push(day);
        })

        days.sort((day1, day2)=>{
          if(day1.dateISO < day2.dateISO){
            return -1;
          }
          if(day1.dateISO > day2.dateISO){
            return 1;
          }
          return 0;
        })

        console.log("Returning days: ", days);
        // for(let (dayData as any) in (daysData as any[])){

        //   let day = new Day(dayData._id, dayData._userId, dayData.dateYYYYMMDD)

        //   days.push();
        // }
        

        return days;
      }))
  }

  public getDayHTTP(date: moment.Moment) {
    const getUrl = this.serverUrl + "/api/day/" + this._authStatus.user.id + "/" + date.format('YYYY-MM-DD');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<Day>(map((response: { message: string, data: any }) => {

        let dayData: any = response.data;

        
        let day = new Day(dayData._id, dayData._userId, dayData.dateYYYYMMDD);
        return day;
      }))
      .subscribe((day: Day) => {
        // console.log("All good: nexting value: ", day)
        this._currentDay$.next(day);
      }, (error) => {
        if (error.status == 404) {
          let day = new Day('', this._authStatus.user.id, moment(date).format('YYYY-MM-DD'));
          // console.log("error 404. creating new Day.  Nexting new day value")
          this._currentDay$.next(day);
        }else{
          // console.log("error: ", error);
        }
      })

  }

  saveDayHTTP(day: Day): Observable<Day>{
    console.log("Saving day: ", day);

    let requestUrl: string = "";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    let requestBody: any = {};


    if (day.id == "") {
      //Save day
      requestUrl = this.serverUrl + "/api/day/create";


      requestBody = {
        userId: this._authStatus.user.id,
        dateYYYYMMDD: day.date.format('YYYY-MM-DD'),
        activityData: day.activityData,
        dailyTaskListData: day.dailyTaskListData,
        taskData: day.taskData,
        timeSegmentData: day.timeSegmentData
      };
    } else {
      //Update day
      requestUrl = this.serverUrl + "/api/day/update";
      requestBody = {
        id: day.id,
        userId: day.userId,
        dateYYYYMMDD: day.date.format('YYYY-MM-DD'),
        activityData: day.activityData,
        dailyTaskListData: day.dailyTaskListData,
        taskData: day.taskData,
        timeSegmentData: day.timeSegmentData
      };




    }

    return this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<Day>(map((response) => {
        let rd: any = response.data;
        return new Day(rd._id, rd.userId, rd.dateYYYYMMDD);
      }));

  }


  private deleteTemplateHTTP(day: Day) {
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
