import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, forkJoin, Subject } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map } from 'rxjs/operators';
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { ServiceAuthenticates } from '../../../authentication/service-authentication-garbage/service-authenticates.interface';
import { DaybookDayItemBuilder } from './daybook-day-item-builder.class';
import { ServiceAuthenticationAttempt } from '../../../authentication/service-authentication-garbage/service-authentication-attempt.interface';


@Injectable({
  providedIn: 'root'
})
export class DaybookHttpRequestService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient) { }
  private _loginComplete$: Subject<ServiceAuthenticationAttempt> = new Subject();
  private _changeSubscriptions: Subscription[] = [];
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _itemBuilder: DaybookDayItemBuilder = new DaybookDayItemBuilder();
  private _userId: string ;

  public synchronousLogin(userId: string): boolean { 
    this._userId = userId;
    return true;
  }
  login$(userId: string): Observable<ServiceAuthenticationAttempt> {
      return null;
  }

  logout() {

    console.log("Logging out of daybook http service")
    this._userId = null;
    this._daybookDayItems$.next([]);
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  private saveDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    // console.log(' $ Saving daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    const postUrl = serverUrl + '/api/daybook-day-item/create';
    daybookDayItem.userId = this._userId;
    const httpOptions = {
      // headers: new HttpHeaders({
      //   'Content-Type': 'application/json'
      //   // 'Authorization': 'my-auth-token'
      // })
    };
    // console.log("Notice:  saveDaybookItem() method is disabled (no HTTP request)")
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        // console.log("Received response: " , response);
        const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        // console.log("Response item is ", responseItem);
        return responseItem;
      }));
  }
  public updateDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    // console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    // console.log(daybookDayItem)
    const postUrl = serverUrl + '/api/daybook-day-item/update';
    daybookDayItem.userId = this._userId;
    const httpOptions = {
      // headers: new HttpHeaders({
      //   'Content-Type': 'application/json'
      //   // 'Authorization': 'my-auth-token'
      // })
    };
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        // console.log("Response item is ", responseItem);
        return responseItem;
      }));
  }

  /**
   * This method first searches the database for existing items of the provided date and the previous and following dates of that date.
   * if 1 or more of the 3 dates do not exist in the DB, then a new method will be called to create them, and save them,
   * and link them, and then return the item for the provided date with the previous and following dates attached.
   * @param thisDateYYYYMMDD the date of the DaybookDayItem to get
   */
  public getDaybookDayItemByDate$(thisDateYYYYMMDD: string)
    : Observable<DaybookDayItem[]> {

    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');

    const prevWeekYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(7, 'days').format('YYYY-MM-DD');
    const nextWeekYYYYMMDD: string = moment(thisDateYYYYMMDD).add(7, 'days').format('YYYY-MM-DD');

    const getUrl = serverUrl + '/api/daybook-day-item/' + this._userId + '/' + prevWeekYYYYMMDD + '/' + nextWeekYYYYMMDD;
    const httpOptions = {
      // headers: new HttpHeaders({
      //   'Content-Type': 'application/json'
      //   // 'Authorization': 'my-auth-token'
      // })
    };
    const dayItems$: Subject<DaybookDayItem[]> = new Subject();
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemsFromResponse(response.data as any[]);
      })).subscribe((responseItems: DaybookDayItem[]) => {
        const prevDayItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
        const nextDayItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
        const thisDayItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
        const saveItems: DaybookDayItem[] = [];
        if (!prevDayItem) { saveItems.push(new DaybookDayItem(prevDateYYYYMMDD)); }
        if (!nextDayItem) { saveItems.push(new DaybookDayItem(nextDateYYYYMMDD)); }
        if (!thisDayItem) { saveItems.push(new DaybookDayItem(thisDateYYYYMMDD)); }
        if (saveItems.length > 0) {
          this._saveMultipleItems$(saveItems).subscribe(savedItems => {
            dayItems$.next(this._populateRemainder(prevWeekYYYYMMDD, nextWeekYYYYMMDD, responseItems.concat(savedItems)));
          });
        } else {
          dayItems$.next(this._populateRemainder(prevWeekYYYYMMDD, nextWeekYYYYMMDD, responseItems.concat(responseItems)))
        }
      });
    return dayItems$.asObservable();
  }

  private _populateRemainder(startDateYYYYMMDD: string, endDateYYYYMMDD: string, currentItems: DaybookDayItem[]): DaybookDayItem[] {
    const allItems: DaybookDayItem[] = [];
    for (let currentDateYYYYMMDD = startDateYYYYMMDD;
      currentDateYYYYMMDD <= endDateYYYYMMDD;
      currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD')) {
      const foundItem = currentItems.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
      if (foundItem) {
        allItems.push(foundItem);
      } else {
        allItems.push(new DaybookDayItem(currentDateYYYYMMDD))
      }
    }
    return allItems.sort((item1, item2) => {
      if (item1.dateYYYYMMDD < item2.dateYYYYMMDD) { return -1; }
      else if (item1.dateYYYYMMDD > item2.dateYYYYMMDD) { return 1; }
      else { return 0; }
    });
  }

  private _saveMultipleItems$(saveItems: DaybookDayItem[]): Observable<DaybookDayItem[]> {
    /**
     * https://www.learnrxjs.io/learn-rxjs/operators/combination/forkjoin
     * forkJoin: This operator is best used when you have a group of observables and only care about the final emitted value of each. 
     * 
     * The following takes each item in the savedItems array and saves them to the database.
     * Each of these save actions returns an observable, and is mapped to an array of observables which is the input variable for forkJoin
     * forkJoin joins each observable and subscribes to the final output of all completed values.
     * 
     */
    return forkJoin(saveItems.map<Observable<DaybookDayItem>>(item => this.saveDaybookDayItem$(item)));
  }

  private buildDaybookDayItemsFromResponse(responseDataItems: any[]): DaybookDayItem[] {
    const daybookDayItems: DaybookDayItem[] = [];
    responseDataItems.forEach((responseDataItem: any) => {
      const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(responseDataItem as any);
      // console.log("Built item is ", responseItem);
      daybookDayItems.push(responseItem);
    });

    return daybookDayItems;
  }
}
