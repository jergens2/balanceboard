import { Injectable } from '@angular/core';
import { DayTemplate } from './day-template.class';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { map } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

import * as moment from 'moment';

import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { Delineation } from './delineation.interface';
import { ServiceAuthenticationAttempt } from '../../../authentication/service-authentication/service-authentication-attempt.interface';

@Injectable({
  providedIn: 'root'
})
export class DayTemplatesService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient) { }
  private serverUrl = serverUrl;



  private _loginComplete$: Subject<ServiceAuthenticationAttempt> = new Subject();

  private _userId: string = "";
  public synchronousLogin(userId: string) { return false;   
  }

  login$(userId: string): Observable<ServiceAuthenticationAttempt> {
    
    this._userId = userId;
    this.getTemplatesHTTP();
    return this._loginComplete$.asObservable();
  }

  logout(){
    this._userId = null;
    this._dayTemplates$.next([]);
  }

  private _dayTemplates$: BehaviorSubject<DayTemplate[]> = new BehaviorSubject([]);
  public get dayTemplates(): DayTemplate[] {
    return this._dayTemplates$.getValue();
  }
  public get dayTemplates$(): Observable<DayTemplate[]> { 
    return this._dayTemplates$.asObservable();
  }




  private getTemplatesHTTP(){
    const getUrl = this.serverUrl + "/api/schedule-day-template/" + this._userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DayTemplate[]>(map((response) => {
        let rd: any[] = response.data as any[];
        if(rd.length > 0){
          return rd.map((dataObject: any) => {
            return this.buildDayTemplateFromResponse(dataObject);
          });
        }else{
          return [];
        }        
      }))
      .subscribe((dayTemplates: DayTemplate[]) => {
        if(dayTemplates.length > 0){
          this._dayTemplates$.next(dayTemplates);
          this._loginComplete$.next({
            authenticated: true,
            message: 'Successfully logged in to DayTemplatesService'
          });
        }else{
          this.generateDefaultDayTemplate();
        }       
      });

  }

  private updateTemplateHTTP(dayTemplate: DayTemplate){
    console.log("Updating dayTemplate: ", dayTemplate);
    const postUrl = this.serverUrl + "/api/schedule-day-template/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };


    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate.httpUpdate, httpOptions)
      .pipe<DayTemplate>(map((response) => {
        return this.buildDayTemplateFromResponse(response.data);
      }))
      .subscribe((updatedTemplate: DayTemplate) => {

        let templates = this.dayTemplates
        for(let template of templates){
          if(template.id == updatedTemplate.id){
            templates.splice(templates.indexOf(template), 1, updatedTemplate)
          }
        }
        this._dayTemplates$.next(templates);
      });
  }

  private saveDayTemplateHTTP(dayTemplate: DayTemplate){
    const postUrl = this.serverUrl + "/api/schedule-day-template/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    
    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate.httpSave, httpOptions)
      .pipe<DayTemplate>(map((response) => {
        return this.buildDayTemplateFromResponse(response.data);
      }))
      .subscribe((dayTemplate: DayTemplate) => {
        let templates = this.dayTemplates;
        templates.push(dayTemplate);
        this._dayTemplates$.next(templates);
        this._loginComplete$.next({
          authenticated: true,
          message: 'Successfully logged in to DayTemplatesService'
        });
      });
  }

  private deleteTemplateHTTP(dayTemplate: DayTemplate){
    const postUrl = this.serverUrl + "/api/schedule-day-template/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate.httpDelete, httpOptions)
      .subscribe((response) => {
        let dayTemplates: DayTemplate[] = this.dayTemplates;
        dayTemplates.splice(dayTemplates.indexOf(dayTemplate), 1);

        this._dayTemplates$.next(dayTemplates);
      })
  }

  private buildDayTemplateFromResponse(responseData: any): DayTemplate{
    // console.log("Building day template from response: " , responseData);
    let dayTemplate: DayTemplate = new DayTemplate(responseData._id, responseData.userId, responseData.name);
    dayTemplate.color = responseData.color;
    dayTemplate.delineations = responseData.delineations;
    return dayTemplate;
  }

  private generateDefaultDayTemplate(): DayTemplate{
    console.log("*** DayTemplatesService: Generating default day template");
    let defaultDayTemplate: DayTemplate = new DayTemplate("", this._userId, "Default Day");
    defaultDayTemplate.delineations = [
      {
        name: "Wake up",
        startAt: {hour: 7, minute: 30, second: 0},
        endAt: null,
      },
      {
        name: "Bed time",
        startAt: {hour: 10, minute: 30, second: 0},
        endAt: null,
      }
    ];
    this.saveDayTemplateHTTP(defaultDayTemplate);
    return defaultDayTemplate;
  }

}
