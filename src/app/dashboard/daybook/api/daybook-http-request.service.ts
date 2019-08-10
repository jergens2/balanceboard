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
    let rangeStartYYYYMMDD: string = moment().startOf("year").format("YYYY-MM-DD");
    let rangeEndYYYYMMDD: string = moment().endOf("year").format("YYYY-MM-DD");
    this.fetchDaybookDayItemsInRange(rangeStartYYYYMMDD, rangeEndYYYYMMDD);
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
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItem(response.data as any);
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
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    console.log("saving daybookDayItem,", daybookDayItem.httpShape);
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItem(response.data as any);
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






  private fetchDaybookDayItemsInRange(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string){
    const getUrl = serverUrl + "/api/daybook-day-item/" + this._authStatus.user.id + "/" + rangeStartYYYYMMDD + "/" + rangeEndYYYYMMDD;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemFromResponse(response.data as any[]);
      }))
      .subscribe((daybookDayItems: DaybookDayItem[]) => {
        this._daybookDayItems$.next(daybookDayItems);
        this._loginComplete$.next(true);
      });
  }

  private buildDaybookDayItemFromResponse(dayItemsHttp: DaybookDayItemHttpShape[]): DaybookDayItem[]{
    console.log("Not implemented:  In this method, we need to do a property by property check");
    /**
     * to see if the incoming object has all the requisite properties.  
     * The reason being that, over time new properties will likely be added and the shape will change.  
     * This method here is where we validate every property, and update the object if not up to modern version.
     * 
     *  
     */ 
    let daybookDayItems: DaybookDayItem[] = [];
    dayItemsHttp.forEach((dayItemHttp)=>{
      daybookDayItems.push(this.buildDaybookDayItem(dayItemHttp));
    });
    return daybookDayItems;
  }
  private buildDaybookDayItem(dayItemHttp: DaybookDayItemHttpShape): DaybookDayItem{
    let daybookDayItem: DaybookDayItem = new DaybookDayItem(dayItemHttp.dateYYYYMMDD);
    daybookDayItem.setHttpShape(dayItemHttp);
    return daybookDayItem;
  }

}
