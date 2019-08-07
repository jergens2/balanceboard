import { Injectable } from '@angular/core';
import { DayTemplate } from './day-template.class';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { map } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

import * as moment from 'moment';

import { ServiceAuthenticates } from '../../../authentication/service-authentication.interface';
import { Delineation } from './delineation.interface';

@Injectable({
  providedIn: 'root'
})
export class DayTemplatesService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient) { }
  private serverUrl = serverUrl;



  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean>{
    this._authStatus = authStatus;
    this.getTemplatesHTTP();
    return this._loginComplete$.asObservable();
  }

  logout(){
    this._authStatus = null;
    this._dayTemplates$.next([]);
  }

  private _dayTemplates$: BehaviorSubject<DayTemplate[]> = new BehaviorSubject([]);
  public get dayTemplates(): DayTemplate[] {
    return this._dayTemplates$.getValue();
  }
  public get dayTemplates$(): Observable<DayTemplate[]> { 
    return this._dayTemplates$.asObservable();
  }

  public dayTemplateDelineationsForDate(dateYYYYMMDD: string): Delineation[]{
    
    return [];
  }

  public dayTemplateForDate(dateYYYYMMDD: string): DayTemplate{
    


    return null;
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
        let rd: any[] = response.data as any[];
        if(rd.length > 0){
          return rd.map((dataObject: any) => {
            return this.buildDayTemplateFromResponse(dataObject);
          });
        }else{
          this.generateDefaultDayTemplates();
          return [];
        }        
      }))
      .subscribe((dayTemplates: DayTemplate[]) => {
          this._dayTemplates$.next(dayTemplates);
          this._loginComplete$.next(true);
        
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
    const postUrl = this.serverUrl + "/api/dayScheduleTemplate/create";
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

    this.httpClient.post<{ message: string, data: any }>(postUrl, dayTemplate.httpDelete, httpOptions)
      .subscribe((response) => {
        let dayTemplates: DayTemplate[] = this.dayTemplates;
        dayTemplates.splice(dayTemplates.indexOf(dayTemplate), 1);

        this._dayTemplates$.next(dayTemplates);
      })
  }

  private buildDayTemplateFromResponse(responseData: any): DayTemplate{
    console.log("Building day template from response: " , responseData);
    return null;
  }

  private generateDefaultDayTemplates(){
    let defaultDayTemplate: DayTemplate = new DayTemplate("", this._authStatus.user.id, "Default Day");
    defaultDayTemplate.delineations = [
      {
        startAt: {hour: 7, minute: 30, second: 0},
        endAt: null,
      },
      {
        startAt: {hour: 10, minute: 30, second: 0},
        endAt: null,
      }
    ];
    this.saveDayTemplateHTTP(defaultDayTemplate);
  }

}
