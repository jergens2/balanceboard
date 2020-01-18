import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable, Subscription, forkJoin, Subject } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map } from 'rxjs/operators';
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';
import { ActivityCategoryDefinitionService } from '../../activities/api/activity-category-definition.service';
import { DaybookDayItemBuilder } from './daybook-day-item-builder.class';


@Injectable({
  providedIn: 'root'
})
export class DaybookHttpRequestService implements ServiceAuthenticates {

  constructor(private httpClient: HttpClient, private activitiesService: ActivityCategoryDefinitionService) { }
  private _authStatus: AuthStatus = null;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _changeSubscriptions: Subscription[] = [];
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _itemBuilder: DaybookDayItemBuilder = new DaybookDayItemBuilder();

  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this._loginComplete$.next(true);
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._daybookDayItems$.next([]);
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  private saveDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    console.log(' $ Saving daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    const postUrl = serverUrl + '/api/daybook-day-item/create';
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
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
    console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    console.log(daybookDayItem)
    const postUrl = serverUrl + '/api/daybook-day-item/update';
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        console.log("Response item is ", responseItem);
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
    : Observable<{ prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }> {

    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'day').format('YYYY-MM-DD');
    const getUrl = serverUrl + '/api/daybook-day-item/' + this._authStatus.user.id + '/' + prevDateYYYYMMDD + '/' + nextDateYYYYMMDD;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    const responseItem: Subject<{ prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }> = new Subject();
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemsFromResponse(response.data as any[]);
      })).subscribe((responseItems: DaybookDayItem[]) => {
        const prevItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
        const nextItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
        const thisItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
        if (prevItem && nextItem && thisItem) {
          const response = { prevDay: prevItem, thisDay: thisItem, nextDay: nextItem };
          // console.log("response is ", response);
          responseItem.next(response);
        } else {
          // console.log("Missing some items, so creating them, saving them, returning them.")
          this._createMissingItemsForDate$(thisDateYYYYMMDD, responseItems).subscribe(dayItem => responseItem.next(dayItem));
        }
      });
    return responseItem.asObservable();
  }

  private _createMissingItemsForDate$(thisDateYYYYMMDD: string, responseItems: DaybookDayItem[])
    : Observable<{ prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }> {

    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'day').format('YYYY-MM-DD');

    let prevItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
    let nextItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
    let thisItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);

    const saveItems: DaybookDayItem[] = [];

    if (!prevItem) { saveItems.push(new DaybookDayItem(prevDateYYYYMMDD)); }
    if (!nextItem) { saveItems.push(new DaybookDayItem(nextDateYYYYMMDD)); }
    if (!thisItem) { saveItems.push(new DaybookDayItem(thisDateYYYYMMDD)); }

    const responseItem$: Subject<{ prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }> = new Subject();

    forkJoin(saveItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) => this.saveDaybookDayItem$(item)))
      .subscribe((savedItems: DaybookDayItem[]) => {
        // console.log("Saved items:", savedItems)
        if (!prevItem) { prevItem = savedItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD); }
        if (!nextItem) { nextItem = savedItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD); }
        if (!thisItem) { thisItem = savedItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD); }

        const responseItem = { prevDay: prevItem, thisDay: thisItem, nextDay: nextItem };
        // console.log("forkjoin: responseItem: ", responseItem);
        responseItem$.next(responseItem);
      });
    return responseItem$.asObservable();
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
