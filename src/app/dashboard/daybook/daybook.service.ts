import { Injectable } from '@angular/core';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Day } from './day.model';
import { map } from 'rxjs/operators';


import * as moment from 'moment';
import { Task } from '../tasks/task.model';


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



  public setPrimaryTask(task: Task, date: moment.Moment) {
    // console.log("setting primary task for date:", date.format('YYYY-MM-DD'))
    if(this._currentDay$.getValue() != null){
      if (this._currentDay$.getValue().date.format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {

        let first = this._currentDay$.getValue().primaryTask;
        this._currentDay$.getValue().primaryTask = task;
        let second = this._currentDay$.getValue().primaryTask;
        console.log("Task set, compare first to second: ", first, second);
        this.saveDayHTTP(this._currentDay$.getValue());
  
      } else {
        console.log("Error: dates are not the same :(");
      }
    }else{
      console.log("Error: day value is null.  This shouldn't happen.");
    }
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

        let dayData: any = response.data.day;
        let poData: any = response.data.task;

        let primaryTask: Task = null;
        if(poData){
          primaryTask = new Task(poData._id, poData.userId, poData.title, poData.description, moment(poData.startDateISO), moment(poData.dueDateISO));
          if (poData.isComplete as boolean) {
            primaryTask.markComplete(moment(poData.completionDateISO));
          }
        }else{

        }
        
        let day = new Day(dayData._id, dayData._userId, dayData.dateYYYYMMDD, primaryTask);
        return day;
      }))
      .subscribe((day: Day) => {
        // console.log("All good: nexting value: ", day)
        this._currentDay$.next(day);
      }, (error) => {
        if (error.status == 404) {
          let day = new Day('', this._authStatus.user.id, moment(date), null);
          // console.log("error 404. creating new Day.  Nexting new day value")
          this._currentDay$.next(day);
        }else{
          // console.log("error: ", error);
        }
      })

  }

  private saveDayHTTP(day: Day) {
    console.log("Saving day: ", day);

    let requestUrl: string = "";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    let requestBody: any = {};
    let primaryTaskId = ""; 
    if(day.primaryTask){
      primaryTaskId = day.primaryTask.id;
    }
    if (day.id == "") {
      //Save day
      requestUrl = this.serverUrl + "/api/day/create";


      requestBody = {
        userId: day.userId,
        dateYYYYMMDD: day.date.format('YYYY-MM-DD'),
        primaryTaskId: primaryTaskId
      };
    } else {
      //Update day
      requestUrl = this.serverUrl + "/api/day/update";
      requestBody = {
        id: day.id,
        userId: day.userId,
        dateYYYYMMDD: day.date.format('YYYY-MM-DD'),
        primaryTaskId: primaryTaskId
      };
    }

    this.httpClient.post<{ message: string, data: any }>(requestUrl, requestBody, httpOptions)
      .pipe<Day>(map((response) => {
        let rd: any = response.data;
        return new Day(rd._id, rd.userId, moment(rd.dateYYYYMMDD), day.primaryTask);
      }))
      .subscribe((day: Day) => {
        this._currentDay$.next(day);
      });




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