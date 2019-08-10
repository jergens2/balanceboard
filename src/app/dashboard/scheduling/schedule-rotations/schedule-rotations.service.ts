import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { DayTemplate } from '../day-templates/day-template.class';
import { DayTemplatesService } from '../day-templates/day-templates.service';
import { ScheduleRotation } from './schedule-rotation.model';
import { serverUrl } from '../../../../app/serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, first } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleRotationsService implements ServiceAuthenticates {

  constructor(private dayTemplatesService: DayTemplatesService, private httpClient: HttpClient) { }
  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.getScheduleRotationsHTTP();
    this._loginComplete$.next(true);
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;

  }


  private _scheduleRotations$: BehaviorSubject<ScheduleRotation[]> = new BehaviorSubject([]);
  private getScheduleRotationsHTTP(){
    const getUrl = serverUrl + "/api/schedule-rotation/" + this._authStatus.user.id;
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
            return this.buildScheduleRotationFromResponse(dataObject);
          });
        }else{
          this.generateDefaultScheduleRotation();
          return [];
        }        
      }))
      .subscribe((scheduleRotations: ScheduleRotation[]) => {
        this.updateActiveScheduleRotation
          this._scheduleRotations$.next(scheduleRotations);
          this._loginComplete$.next(true);
      });
  }

  private updateTemplateHTTP(dayTemplate: DayTemplate){
    console.log("Updating dayTemplate: ", dayTemplate);


    const postUrl = this.serverUrl + "/api/schedule-rotation/update";
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

  private saveScheduleRotationHTTP(scheduleRotation: ScheduleRotation){
    scheduleRotation.userId = this._authStatus.user.id;
    const postUrl = serverUrl + "/api/schedule-rotation/create";
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

  private buildScheduleRotationFromResponse(responseData: any): ScheduleRotation{
    // console.log("Building scheduleRotation from response: " , responseData);
    let scheduleRotation: ScheduleRotation = new ScheduleRotation(responseData.startDateYYYYMMDD, responseData.dayTemplates);
    scheduleRotation.userId = this._authStatus.user.id;
    return scheduleRotation;
  }

  private generateDefaultScheduleRotation(): ScheduleRotation{
    console.log("Generating default Schedule Rotation");

    let startDateYYYYMMDD: string = moment().startOf("week").format("YYYY-MM-DD");
    let firstDayTemplate: DayTemplate = this.dayTemplatesService.dayTemplates[0];
    let defaultScheduleRotation: ScheduleRotation = new ScheduleRotation(startDateYYYYMMDD, [firstDayTemplate]);
  
    this.saveScheduleRotationHTTP(defaultScheduleRotation);
    return defaultScheduleRotation;
  }

  // public dayTemplateForDate(dateYYYYMMDD: string): DayTemplate {


  //   let dayTemplates: DayTemplate[] = this.dayTemplatesService.dayTemplates;
  //   if (dayTemplates.length == 1) {
  //     console.log("Returning the only template");
  //     return dayTemplates[0];
  //   } else {
  //     return this.determineDayTemplateForDate(dayTemplates);
  //   }
  // }
  // private determineDayTemplateForDate(dayTemplates: DayTemplate[]): DayTemplate{

  // }

}
