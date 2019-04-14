import { Injectable } from '@angular/core';
import { DayTemplate } from './day-template.model';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import * as moment from 'moment';
import { ITemplateTimeRange } from './template-time-range.interface';

@Injectable({
  providedIn: 'root'
})
export class DayTemplatesService {

  constructor(private httpClient: HttpClient) { }
  private serverUrl = serverUrl;



  private _authStatus: AuthStatus;
  login$(authStatus: AuthStatus): Observable<DayTemplate[]>{
    this._authStatus = authStatus;
    this.getTemplatesHTTP();
    return this.dayTemplates$;
  }

  logout(){
    this._authStatus = null;
    this._dayTemplates = [];
    this._dayTemplates$.next(this._dayTemplates);
  }

  private _dayTemplates: DayTemplate[] = [];
  private _dayTemplates$: Subject<DayTemplate[]> = new Subject();
  public get dayTemplates(): DayTemplate[] {
    return Object.assign([], this._dayTemplates);
  }
  public get dayTemplates$(): Observable<DayTemplate[]> { 
    return this._dayTemplates$.asObservable();
  }


  private getTemplatesHTTP(){
    const getUrl = this.serverUrl + "/api/dayScheduleTemplate/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        let rd: any[] = response.data;
        return rd.map((dataObject: any) => {
          return new DayTemplate(dataObject._id, dataObject.userId, dataObject.name, dataObject.color, dataObject.sleepTimeRanges, dataObject.nonDiscretionaryTimeRanges, dataObject.discretionaryTimeRanges);;
        })
      }))
      .subscribe((dayTemplates: DayTemplate[]) => {
        if(dayTemplates.length == 0){
          this.buildDefaultTemplates();
        }else{
          this._dayTemplates = dayTemplates;
          this._dayTemplates$.next(this._dayTemplates);
        }
      });

  }

  private updateTemplateHTTP(dayTemplate: DayTemplate){
    console.log("Updating dayTemplate: ", dayTemplate);


    const postUrl = this.serverUrl + "/api/dayScheduleTemplate/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };


    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate, httpOptions)
      .pipe<DayTemplate>(map((response) => {
        let rd: any = response.data;
        let newDayTemplate: DayTemplate = new DayTemplate(rd._id, rd.userId, rd.name, rd.color, rd.sleepTimeRanges, rd.nonDiscretionaryTimeRanges, rd.discretionaryTimeRanges);
        return newDayTemplate;
      }))
      .subscribe((updatedTemplate: DayTemplate) => {

        let templates = this._dayTemplates
        for(let template of templates){
          if(template.id == updatedTemplate.id){
            templates.splice(templates.indexOf(template), 1, updatedTemplate)
          }
        }
        this._dayTemplates$.next(templates);
      });
  }

  private saveDayTemplateHTTP(dayTemplate: DayTemplate){
    const postUrl = this.serverUrl + "/api/dayScheduleTemplate/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    
    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate, httpOptions)
      .pipe<DayTemplate>(map((response) => {
        let rd: any = response.data;
        return new DayTemplate(rd._id, rd.userId, rd.name, rd.color, rd.sleepTimeRanges, rd.nonDiscretionaryTimeRanges, rd.discretionaryTimeRanges);
      }))
      .subscribe((dayTemplate: DayTemplate) => {

        this._dayTemplates.push(dayTemplate);
        this._dayTemplates$.next(this._dayTemplates);
      })
  }

  private deleteTemplateHTTP(dayTemplate: DayTemplate){
    const postUrl = this.serverUrl + "/api/dayScheduleTemplate/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate, httpOptions)
      .subscribe((response) => {
        let dayTemplates: DayTemplate[] = this._dayTemplates;
        dayTemplates.splice(dayTemplates.indexOf(dayTemplate), 1);

        this._dayTemplates$.next(dayTemplates);
      })
  }

  private buildDefaultTemplates(){

    console.log("Building default day templates");

    let sleepTimeRanges: ITemplateTimeRange[] = [
      {
        startHour: 0,
        startMinute: 0,
        endHour: 7,
        endMinute: 0 
      },
      {
        startHour: 23,
        startMinute: 0,
        endHour: 24,
        endMinute: 0 
      }
    ];

    let workDayNonDiscretionaryTimeRanges: ITemplateTimeRange[] = [
      {
        startHour: 8,
        startMinute: 0,
        endHour: 16,
        endMinute: 0
      }
    ];
    let workDayDiscretionaryTimeRanges: ITemplateTimeRange[] = [
      {
        startHour: 16,
        startMinute: 0,
        endHour: 23,
        endMinute: 0
      }
    ]

    let restDayDiscretionaryTimeRanges: ITemplateTimeRange[] = [
      {
        startHour: 7,
        startMinute: 0,
        endHour: 23,
        endMinute: 0
      }
    ]

    let defaultWorkDayTemplate: DayTemplate = new DayTemplate('',this._authStatus.user.id, "Default Template: Work Day", "#dbe8ff", sleepTimeRanges, workDayNonDiscretionaryTimeRanges, workDayDiscretionaryTimeRanges);
    let defaultRestDayTemplate: DayTemplate = new DayTemplate('',this._authStatus.user.id, "Default Template: Rest Day", "#c5ff99", sleepTimeRanges, [], restDayDiscretionaryTimeRanges);



    // warning: this is all asynchronous, but its basically being treated as if it is synchronous..  I can't forsee this necessarily being a problem, as it will happen quickly on the first login of the user, but something to keep an eye on if problems arise.

    this.saveDayTemplateHTTP(defaultWorkDayTemplate);
    this.saveDayTemplateHTTP(defaultRestDayTemplate);
  }



}
