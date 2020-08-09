import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, forkJoin, Subject, timer } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map } from 'rxjs/operators';
import { DaybookDayItemBuilder } from './daybook-day-item-builder.class';
import { DaybookManager } from './daybook-manager.class';


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

  public saveManagerChanges$() {
    const unsavedManager = this.dayItems;
    console.log("To do:  save daybookDayItem changes");
  }

  private _reinitiate$(): Observable<boolean> {
    const startDateYYYYMMDD: string = moment().add(1, 'days').format('YYYY-MM-DD');
    const endDateYYYYMMDD: string = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const isComplete$: Subject<boolean> = new Subject();
    this.getDaybookDayItemByDate$(startDateYYYYMMDD, endDateYYYYMMDD)
      .subscribe({
        next: (days: DaybookDayItem[]) => {
          this._dayItems$.next(days);
          this._startClock();
          isComplete$.next(true);
        },
        error: e => console.log("Error", e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }

  private _timerSub: Subscription = new Subscription();
  private _startClock() {
    this._timerSub.unsubscribe();
    const msToMidnight: number = moment().startOf('day').add(1, 'day').diff(moment(), 'milliseconds');
    this._timerSub = timer(msToMidnight).subscribe(tick => {
      this._reinitiate$();
    });
  }




  public updateDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    // console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD, daybookDayItem);
    // console.log(daybookDayItem)
    const postUrl = serverUrl + '/api/daybook-day-item/update';
    daybookDayItem.userId = this._userId;
    return this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape)
      .pipe<DaybookDayItem>(map((response) => {
        const responseItem: DaybookDayItem = this._itemBuilder.buildItemFromResponse(response.data as any);
        // console.log("Response item is ", responseItem);
        return responseItem;
      }));
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
   *  get an array of all daybook Day Items in range.
   */
  public getDaybookDayItemByDate$(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string, populateRemainder: boolean = true)
    : Observable<DaybookDayItem[]> {

    // const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
    // const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
    // let rangeStartYYYYMMDD: string = prevDateYYYYMMDD;
    // let rangeEndYYYYMMDD: string = nextDateYYYYMMDD;
    // if (rangeDiff > 1) {
    //   rangeStartYYYYMMDD = moment(thisDateYYYYMMDD).subtract(rangeDiff, 'days').format('YYYY-MM-DD');
    //   rangeEndYYYYMMDD = moment(thisDateYYYYMMDD).add(rangeDiff, 'days').format('YYYY-MM-DD');
    // }
    const getUrl = serverUrl + '/api/daybook-day-item/' + this._userId + '/' + rangeStartYYYYMMDD + '/' + rangeEndYYYYMMDD;
    // const dayItems$: Subject<DaybookDayItem[]> = new Subject();
    return this.httpClient.get<{ message: string, data: any }>(getUrl)
      .pipe<DaybookDayItem[]>(map((response) => {
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
      }))
    //   .subscribe((responseItems: DaybookDayItem[]) => {
    //     const prevDayItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
    //     const nextDayItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
    //     const thisDayItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
    //     const saveItems: DaybookDayItem[] = [];
    //     if (!prevDayItem) { saveItems.push(new DaybookDayItem(prevDateYYYYMMDD)); }
    //     if (!nextDayItem) { saveItems.push(new DaybookDayItem(nextDateYYYYMMDD)); }
    //     if (!thisDayItem) { saveItems.push(new DaybookDayItem(thisDateYYYYMMDD)); }
    //     if (saveItems.length > 0) {
    //       this._saveMultipleItems$(saveItems).subscribe(savedItems => {
    //         dayItems$.next(this._populateRemainder(rangeStartYYYYMMDD, rangeEndYYYYMMDD, responseItems.concat(savedItems)));
    //       });
    //     } else {
    //       dayItems$.next(this._populateRemainder(rangeStartYYYYMMDD, rangeEndYYYYMMDD, responseItems.concat(responseItems)))
    //     }
    //   });
    // return dayItems$.asObservable();
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
   *  Creates an array of DaybookDayItem objects from a start date to an end date, populating any missing items
   */
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
}
