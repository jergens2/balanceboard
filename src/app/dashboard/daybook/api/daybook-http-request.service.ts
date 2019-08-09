import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable, ObservedValueOf } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map } from 'rxjs/operators';
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';

@Injectable({
  providedIn: 'root'
})
export class DaybookHttpRequestService {

  constructor(private httpClient: HttpClient) { }
  private _authStatus: AuthStatus = null;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this._loginComplete$.next(true);
    let rangeStart: moment.Moment = moment().startOf("year");
    let rangeEnd: moment.Moment = moment().endOf("year");
    this.fetchDaybookDayItemsInRange(rangeStart, rangeEnd);
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
  }

  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  public get daybookDayItems$(): Observable<DaybookDayItem[]> {
    return this._daybookDayItems$.asObservable();
  }
  public get daybookDayItems(): DaybookDayItem[]{
    return this._daybookDayItems$.getValue();
  }



  public updateDaybookDayItem(daybookDayItem: DaybookDayItem) {
    const postUrl = serverUrl + "/api/daybook-day-item/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItem(response.data as DaybookDayItemHttpShape);
      }))
      .subscribe((returnedDaybookDayItem: DaybookDayItem) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        for (let daybookDayItem of daybookDayItems) {
          if (daybookDayItem.id == returnedDaybookDayItem.id) {
            daybookDayItems.splice(daybookDayItems.indexOf(daybookDayItem), 1, returnedDaybookDayItem)
          }
        }
        this._daybookDayItems$.next(daybookDayItems);
      });
  }

  saveDaybookDayItem(daybookDayItem: DaybookDayItem): DaybookDayItem {
    const postUrl = serverUrl + "/api/daybook-day-item/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItem(response.data as DaybookDayItemHttpShape);
      }))
      .subscribe((daybookDayItem: DaybookDayItem) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        daybookDayItems.push(daybookDayItem);
        this._daybookDayItems$.next(daybookDayItems);
      });
    return daybookDayItem;
  }

  deleteDaybookDayItem(daybookDayItem: DaybookDayItem) {
    const postUrl = serverUrl + "/api/daybook-day-item/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .subscribe((response: any) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        daybookDayItems.splice(daybookDayItems.indexOf(daybookDayItem), 1);
        this._daybookDayItems$.next(daybookDayItems);
      });
  }






  private fetchDaybookDayItemsInRange(rangeStart: moment.Moment, rangeEnd: moment.Moment){
    const getUrl = serverUrl + "/api/daybook-day-item/" + this._authStatus.user.id + "/" + rangeStart.toISOString() + "/" + rangeEnd.toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItems(response.data as DaybookDayItemHttpShape[]);
      }))
      .subscribe((daybookDayItems: DaybookDayItem[]) => {
        this._daybookDayItems$.next(daybookDayItems);
        this._loginComplete$.next(true);
      });
  }

  private buildDaybookDayItems(dayItemsHttp: DaybookDayItemHttpShape[]): DaybookDayItem[]{
    let daybookDayItems: DaybookDayItem[] = [];
    dayItemsHttp.forEach((dayItemHttp)=>{
      daybookDayItems.push(this.buildDaybookDayItem(dayItemHttp));
    });
    return daybookDayItems;
  }
  private buildDaybookDayItem(dayItemHttp: DaybookDayItemHttpShape): DaybookDayItem{
    let daybookDayItem: DaybookDayItem = new DaybookDayItem(dayItemHttp.dateYYYYMMDD);
    daybookDayItem.setHttpShape(dayItemHttp);
    return daybookDayItem
  }

}
