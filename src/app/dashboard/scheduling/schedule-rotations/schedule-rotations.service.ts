import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable, Scheduler } from 'rxjs';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { ScheduleRotation } from './schedule-rotation.class';
import { serverUrl } from '../../../../app/serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, first } from 'rxjs/operators';
import * as moment from 'moment';
import { DayTemplatesService } from '../day-templates/day-templates.service';
import { DayTemplate } from '../day-templates/day-template.class'
import { DayStructureDataItem } from '../../daybook/api/data-items/day-structure-data-item.interface';
import buildDefaultDataItems  from '../../daybook/api/data-items/default-day-structure-data-items';

@Injectable({
  providedIn: 'root'
})
export class ScheduleRotationsService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient, private dayTemplatesService: DayTemplatesService) { }
  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    /**
     * first we check if any objects exist in DB with getScheduleRotationsHTTP().  If not, (for example, new user) then we generate a new one.
     * generating a new one implements method saveScheduleRotationHTTP() which will complete the login.
     * if there is already at least 1 in the DB, then login complete will also next true.
     */
    this.getScheduleRotationsHTTP();
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._scheduleRotations$.next([]);
  }


  private _scheduleRotations$: BehaviorSubject<ScheduleRotation[]> = new BehaviorSubject([]);
  public get scheduleRotations$(): Observable<ScheduleRotation[]> {
    return this._scheduleRotations$.asObservable();
  }
  public get scheduleRotations(): ScheduleRotation[] {
    return this._scheduleRotations$.getValue();
  }


  public get activeScheduleRotation(): ScheduleRotation {
    let scheduleRotations: ScheduleRotation[] = this.scheduleRotations;
    if(scheduleRotations.length > 0){
      if(scheduleRotations.length == 1){
        return scheduleRotations[0];
      }else{
        console.log("***** Error - Warning - Not implemented:  Determining the active schedule rotation for multiple scheduleRotations");
      }
    }else{
      console.log("Error:  No activeScheduleRotation")
      return null;
    }

  }

  public getDayStructureItemsForDate(dateYYYYMMDD: string): DayStructureDataItem[]{
    console.log("Finding day structure items for date: " + dateYYYYMMDD);
    return buildDefaultDataItems(moment(dateYYYYMMDD).startOf("day"));
  }

  public getDayTemplateForDate(dateYYYYMMDD: string): DayTemplate {
    if (this.activeScheduleRotation.startDateYYYYMMDD > dateYYYYMMDD) {
      console.log("Date is from prior to earliest ScheduleRotation date.  Returning placeholder.")
      let placeHolder: DayTemplate = new DayTemplate('no_day_template', this._authStatus.user.id, 'Placeholder Day Template');
      return placeHolder;
    } else {
      let itemsLength: number = this.activeScheduleRotation.dayTemplateItems.length;
      let daysDifference: number = moment(dateYYYYMMDD).diff(this.activeScheduleRotation.startDateYYYYMMDD, "days");
      if(daysDifference <= itemsLength){
        return this.activeScheduleRotation.dayTemplateItems[daysDifference];
      }else if(daysDifference > itemsLength){
        let dayOfRotationIndex: number = daysDifference % itemsLength;
        return this.activeScheduleRotation.dayTemplateItems[dayOfRotationIndex];
      }
    }
  }

  private getScheduleRotationsHTTP() {
    const getUrl = serverUrl + "/api/schedule-rotation/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<ScheduleRotation[]>(map((response) => {
        let rd: any[] = response.data as any[];
        if (rd.length > 0) {
          return rd.map((dataObject: any) => {
            return this.buildScheduleRotationFromResponse(dataObject);
          });
        }else{
          return [];
        }
      }))
      .subscribe((scheduleRotations: ScheduleRotation[]) => {
        // this.updateActiveScheduleRotation
        if(scheduleRotations.length == 0){
          this.generateDefaultScheduleRotation();
        }else{
          this._scheduleRotations$.next(scheduleRotations);
          this._loginComplete$.next(true);
        }
      });
  }

  private updateScheduleRotationHTTP(scheduleRotation: ScheduleRotation) {
    console.log("Updating scheduleRotation: ", scheduleRotation);


    const postUrl = serverUrl + "/api/schedule-rotation/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };


    this.httpClient.post<{ message: string, data: any }>(postUrl, scheduleRotation, httpOptions)
      .pipe<ScheduleRotation>(map((response) => {
        return this.buildScheduleRotationFromResponse(response.data);
      }))
      .subscribe((updatedScheduleRotation: ScheduleRotation) => {

        let scheduleRotations = this.scheduleRotations
        for (let template of scheduleRotations) {
          if (template.id == updatedScheduleRotation.id) {
            scheduleRotations.splice(scheduleRotations.indexOf(template), 1, updatedScheduleRotation)
          }
        }
        this._scheduleRotations$.next(scheduleRotations);
      });
  }

  private saveScheduleRotationHTTP(scheduleRotation: ScheduleRotation) {
    scheduleRotation.userId = this._authStatus.user.id;
    const postUrl = serverUrl + "/api/schedule-rotation/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, scheduleRotation, httpOptions)
      .pipe<ScheduleRotation>(map((response) => {
        return this.buildScheduleRotationFromResponse(response.data);
      }))
      .subscribe((scheduleRotation: ScheduleRotation) => {
        let scheduleRotations = this.scheduleRotations;
        scheduleRotations.push(scheduleRotation);
        this._scheduleRotations$.next(scheduleRotations);
        this._loginComplete$.next(true);
      });
  }

  private deleteScheduleRotationHTTP(scheduleRotation: ScheduleRotation) {
    const postUrl = serverUrl + "/api/schedule-rotation/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, { id: scheduleRotation.id }, httpOptions)
      .subscribe((response) => {
        let scheduleRotations: ScheduleRotation[] = this.scheduleRotations;
        scheduleRotations.splice(scheduleRotations.indexOf(scheduleRotation), 1);

        this._scheduleRotations$.next(scheduleRotations);
      })
  }

  private buildScheduleRotationFromResponse(responseData: any): ScheduleRotation {
    // console.log("*****Building scheduleRotation from response: " , responseData);
    let scheduleRotation: ScheduleRotation = new ScheduleRotation(responseData.startDateYYYYMMDD, responseData.dayTemplateItems);
    scheduleRotation.id = responseData._id;
    scheduleRotation.userId = this._authStatus.user.id;
    return scheduleRotation;
  }

  private generateDefaultScheduleRotation(): ScheduleRotation {
    let startDateYYYYMMDD: string = moment().startOf("week").format("YYYY-MM-DD");
    let firstDayTemplate: DayTemplate = this.dayTemplatesService.dayTemplates[0];
    // Create an array of 7 default day Templates to create a rotation with 7 days in it.
    let dayTemplateItems: DayTemplate[] = [
      firstDayTemplate,
      firstDayTemplate,
      firstDayTemplate,
      firstDayTemplate,
      firstDayTemplate,
      firstDayTemplate,
      firstDayTemplate,
    ];
    let defaultScheduleRotation: ScheduleRotation = new ScheduleRotation(startDateYYYYMMDD, dayTemplateItems);
    this.saveScheduleRotationHTTP(defaultScheduleRotation);
    return defaultScheduleRotation;
  }


}
