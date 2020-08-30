import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, forkJoin, Subject, timer } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map } from 'rxjs/operators';
import { DaybookDayItemBuilder } from './daybook-day-item-builder.class';
import { DaybookDayItemController } from './daybook-day-item-controller';


@Injectable({
  providedIn: 'root'
})
export class DaybookHttpService {

  constructor(private httpClient: HttpClient) { }

  private _changeSubscriptions: Subscription[] = [];
  private _itemBuilder: DaybookDayItemBuilder = new DaybookDayItemBuilder();
  private _userId: string;
  private _dayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);

  public get dayItems$(): Observable<DaybookDayItem[]> { return this._dayItems$.asObservable(); }
  public get dayItems(): DaybookDayItem[] { return this._dayItems$.getValue(); }

  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    return this._reinitiate$();
  }

  public logout() {
    this._userId = null;
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
    this._dayItems$.next([]);
  }

  private _reinitiate$(): Observable<boolean> {
    const rangeDayCount: number = 30;
    const startDateYYYYMMDD: string = moment().subtract(rangeDayCount, 'days').format('YYYY-MM-DD');
    const endDateYYYYMMDD: string = moment().add(1, 'days').format('YYYY-MM-DD');
    const isComplete$: Subject<boolean> = new Subject();
    this.getDaybookDayItemByDate$(startDateYYYYMMDD, endDateYYYYMMDD)
      .subscribe({
        next: (days: DaybookDayItem[]) => {
          console.log("WE GOT THE DAYS:", days)
          this._dayItems$.next(days);
          isComplete$.next(true);
        },
        error: e => console.log("Error", e),
        complete: () => isComplete$.complete(),
      });
    return isComplete$.asObservable();
  }

  /**
   * This method receives a daybookDayItem to be saved-updated. 
   * Returns an observable with the saved item.
   */
  public updateDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    // console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    // console.log(daybookDayItem)
    const postUrl = serverUrl + '/api/daybook-day-item/update';
    daybookDayItem.userId = this._userId;
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape)
      .pipe<DaybookDayItem>(map((response) => {
        const updatedItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        this._updateCurrentValues(updatedItem);
        return updatedItem;
      }));
  }

  public updateDaybookDayItems$(daybookDayItems: DaybookDayItem[]): Observable<DaybookDayItem[]> {
    // console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    // console.log(daybookDayItem)
    const updatedItems$: Subject<DaybookDayItem[]> = new Subject();
    forkJoin([ ...daybookDayItems.map(item => this.updateDaybookDayItem$(item))]).subscribe({
      next: (items) =>  updatedItems$.next(items),
      error: (e) => console.log('updating items: ', e),
      complete: () => updatedItems$.complete()
    });
    return updatedItems$.asObservable();
  }


  /**
   *  get all daybook items from database for this user
   */
  public getAllItems$(): Observable<DaybookDayItem[]> {
    const getUrl = serverUrl + '/api/daybook-day-item/get-all/' + this._userId;
    return this.httpClient.get<{ message: string, data: any }>(getUrl)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this._buildDaybookDayItemsFromResponse(response.data as any[]);
      }));
  }


  /**
   *  get an array of all daybook Day Items in range, populating any missing items with a new blank object.
   */
  public getDaybookDayItemByDate$(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string, populateRemainder: boolean = true)
    : Observable<DaybookDayItem[]> {
    const getUrl = serverUrl + '/api/daybook-day-item/' + this._userId + '/' + rangeStartYYYYMMDD + '/' + rangeEndYYYYMMDD;
    console.log(" TO DO:  when populating remainder, need to actually SAVE the item into the database.")
    return this.httpClient.get<{ message: string, data: any }>(getUrl)
      .pipe<DaybookDayItem[]>(map((response) => {
        console.log("Response la: ", response)
        let currentDateYYYYMMDD = rangeStartYYYYMMDD;
        let responseItems: DaybookDayItem[] = this._buildDaybookDayItemsFromResponse(response.data as any[]);
        if (populateRemainder) {
          while (currentDateYYYYMMDD <= rangeEndYYYYMMDD) {
            if (!responseItems.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD)) {
              responseItems.push(new DaybookDayItem(currentDateYYYYMMDD));
            }
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
          }
        }
        responseItems = responseItems.sort((d1, d2) => {
          if (d1.dateYYYYMMDD < d2.dateYYYYMMDD) { return -1; }
          else if (d1.dateYYYYMMDD > d2.dateYYYYMMDD) { return 1; }
          else { return 0; }
        });
        return responseItems;
      }));
  }

  /**
   * this method is used by DaybookDisplayService to send a synchronous update command.
   *
   * This method will check for updates for the 3 day range surrounding the given date,
   * and update the items currently stored in this service in the this._dayItems$ property.
   *
   * This method performs an async action which optionally provides an observable to subscribe to.
   */
  public getUpdate$(thisDateYYYYMMDD: string): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    this.getDaybookDayItemByDate$(prevDateYYYYMMDD, nextDateYYYYMMDD).subscribe(updatedItems => {
      const currentItems = this.dayItems;
      updatedItems.forEach(updatedItem => {
        const index = currentItems.findIndex(currentItem => currentItem.dateYYYYMMDD === updatedItem.dateYYYYMMDD);
        let reSort = false;
        if (index > -1) {
          currentItems.splice(index, 1, updatedItem);
        } else {
          currentItems.push(updatedItem);
          reSort = true;
        }
        if (reSort) {
          const sortedItems = currentItems.sort((d1, d2) => {
            if (d1.dateYYYYMMDD < d2.dateYYYYMMDD) { return -1; }
            else if (d1.dateYYYYMMDD > d2.dateYYYYMMDD) { return 1; }
            else { return 0; }
          });
          this._dayItems$.next(sortedItems);
        } else {
          this._dayItems$.next(currentItems);
        }
        isComplete$.next(true);
        isComplete$.complete();
      });
    });
    return isComplete$.asObservable();
  }

  /**
   *  Will check the existing array to see if prev day, this day, and next day are present. 
   */
  public hasDateItems(dateYYYYMMDD: string): boolean {
    const prevDateYYYYMMDD: string = moment(dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    const hasPrevDate: boolean = this.dayItems.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD) !== null;
    const hasThisDate: boolean = this.dayItems.find(item => item.dateYYYYMMDD === dateYYYYMMDD) !== null;
    const hasNextDate: boolean = this.dayItems.find(item => item.dateYYYYMMDD === nextDateYYYYMMDD) !== null;
    return hasPrevDate && hasThisDate && hasNextDate;
  }


  private _saveDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    // console.log(' $ Saving daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    const postUrl = serverUrl + '/api/daybook-day-item/create';
    daybookDayItem.userId = this._userId;
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape)
      .pipe<DaybookDayItem>(map((response) => {
        // console.log("Received response: " , response);
        const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        // console.log("Response item is ", responseItem);
        return responseItem;
      }));
  }

  

  /**
 * https://www.learnrxjs.io/learn-rxjs/operators/combination/forkjoin
 * forkJoin: This operator is best used when you have a group of observables and only care about the final emitted value of each. 
 * 
 * The following takes each item in the savedItems array and saves them to the database.
 * Each of these save actions returns an observable, and is mapped to an array of observables which is the input variable for forkJoin
 * forkJoin joins each observable and subscribes to the final output of all completed values.
 * 
 */
  private _saveMultipleItems$(saveItems: DaybookDayItem[]): Observable<DaybookDayItem[]> {
    return forkJoin(saveItems.map<Observable<DaybookDayItem>>(item => this._saveDaybookDayItem$(item)));
  }

  private _buildDaybookDayItemsFromResponse(responseDataItems: any[]): DaybookDayItem[] {
    const daybookDayItems: DaybookDayItem[] = [];
    responseDataItems.forEach((responseDataItem: any) => {
      const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(responseDataItem as any);
      // console.log("Built item is ", responseItem);
      daybookDayItems.push(responseItem);
    });

    return daybookDayItems;
  }

  private _updateCurrentValues(updatedItem: DaybookDayItem) {
    const currentItems = this.dayItems;
    const currentIndex = currentItems.findIndex(item => item.dateYYYYMMDD === updatedItem.dateYYYYMMDD);
    if (currentIndex > -1) {
      currentItems.splice(currentIndex, 1, updatedItem);
    }
    this._dayItems$.next(currentItems);
  }
}
