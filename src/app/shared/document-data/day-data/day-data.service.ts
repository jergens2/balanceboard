import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DayData } from './day-data.class';
import { RecurringTasksService } from '../../document-definitions/recurring-task-definition/recurring-tasks.service';
import { TimelogService } from '../timelog-entry/timelog.service';
import { DayDataActivityDataItemInterface, DayDataActivityDataItem } from './data-properties/activity-data-item.class';
@Injectable({
  providedIn: 'root'
})
/**
 * Notes:
 * DayData is not something that exists in the database explicitly.
 * It is an aggregate of data, collected from other collections.
 * It exists exclusively on the front end as an object definition, primarily for the purpose of browsing / zooming out on the calendar views to see the aggregate picture.
 * 
 */
export class DayDataService {
  constructor(private httpClient: HttpClient, private recurringTaskDefinitionService: RecurringTasksService, private timelogService: TimelogService) { }
  private serverUrl = serverUrl;
  private _authStatus: AuthStatus;
  private _loginComplete$: Subject<boolean> = new Subject();
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.getInitialDayDataRange();
    return this._loginComplete$;
  }
  logout() {
    this._authStatus = null;
  }
  public checkForDayData(date: moment.Moment): void {
    let dayData: DayData = this.yearsDayData.find((dayData) => { return dayData.dateYYYYMMDD == date.format('YYYY-MM-DD'); });
    if (!dayData) {
      this.generateNewDayData(date);
    }
    else {
    }
  }
  private getInitialDayDataRange() {
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
    this.httpClient.get<{message: string;data: any;}>(getUrl, httpOptions)
      .pipe<DayData[]>(map((response: {message: string;data: any[];}) => {
        return response.data.map((data) => {
          return this.buildDayDataFromResponse(data);
        });
      }))
      .subscribe((dayData: DayData[]) => {
        console.log("This is all of the day data", dayData);
        this._yearsDayData$.next(dayData);
        this.updateYearsDataSubscriptions();
        this._loginComplete$.next(true);
      });
  }
  httpSaveDayData(dayDataToSave: DayData) {
    let requestUrl: string = serverUrl + "/api/day-data/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{
      message: string;
      data: any;
    }>(requestUrl, dayDataToSave.httpCreate, httpOptions)
      .pipe<DayData>(map((response) => {
        return this.buildDayDataFromResponse(response.data);
      }))
      .subscribe((savedDayData: DayData) => {
        console.log("    HTTP Response: Value saved:  ", savedDayData);
        let dayData: DayData[] = this._yearsDayData$.getValue();
        dayData.push(savedDayData);
        this._yearsDayData$.next(dayData);
        this.updateYearsDataSubscriptions();
      });
  }
  httpUpdateDayData(dayDataToUpdate: DayData) {
    // console.log("Updating", dayDataToUpdate)
    let requestUrl: string = serverUrl + "/api/day-data/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{
      message: string;
      data: any;
    }>(requestUrl, dayDataToUpdate.httpUpdate, httpOptions)
      .pipe<DayData>(map((response) => {
        return this.buildDayDataFromResponse(response.data);
      }))
      .subscribe((updatedDayData) => {
        let allDayData: DayData[] = this._yearsDayData$.getValue();
        allDayData.splice(allDayData.indexOf(dayDataToUpdate), 1, updatedDayData);
        this._yearsDayData$.next(allDayData);
        this.updateYearsDataSubscriptions();
      });
  }
  httpDeleteDayData(dayDataToDelete: DayData) {
    const deleteUrl = this.serverUrl + "/api/day-data/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{
      message: string;
      data: any;
    }>(deleteUrl, dayDataToDelete.httpDelete, httpOptions)
      .subscribe((response) => {
        let allDayData: DayData[] = this._yearsDayData$.getValue();
        allDayData.splice(allDayData.indexOf(dayDataToDelete), 1);
        this._yearsDayData$.next(allDayData);
      });
  }
  private generateNewDayData(date: moment.Moment): void {
    /**
     * This event occurs when the check for a DB item returned nothing, so we are generating a new DayData
     */
  }
  private buildDayDataFromResponse(responseData) {
    /**
     *  This event occurs when a response data object does exist.
     *  Therefore this primarily entails in constructing all of the Class objects from the DB interface data.
    */
    return null;
  }
  private _updateSubscriptions: Subscription[] = [];
  private updateYearsDataSubscriptions() {
    this._updateSubscriptions.forEach((sub) => sub.unsubscribe());
    this._updateSubscriptions = [];
    this._yearsDayData$.getValue().forEach((dayData: DayData) => {
      this._updateSubscriptions.push(dayData.updates$.subscribe(() => {
        this.httpUpdateDayData(dayData);
      }));
    });
  }
}




