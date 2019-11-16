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


@Injectable({
  providedIn: 'root'
})
export class DaybookHttpRequestService implements ServiceAuthenticates {


  constructor(private httpClient: HttpClient, private activitiesService: ActivityCategoryDefinitionService) { }
  private _authStatus: AuthStatus = null;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _changeSubscriptions: Subscription[] = [];
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);

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


  public get daybookDayItems$(): Observable<DaybookDayItem[]> {
    return this._daybookDayItems$.asObservable();
  }
  public get daybookDayItems(): DaybookDayItem[] {
    return this._daybookDayItems$.getValue();
  }



  public updateDaybookDayItem(daybookDayItem: DaybookDayItem) {
    // console.log("Sending HTTP update request for daybook day item");
    const postUrl = serverUrl + '/api/daybook-day-item/update';
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItemFromResponse(response.data as any);
      }))
      .subscribe((returnedDaybookDayItem: DaybookDayItem) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        for (const currentItem of daybookDayItems) {
          if (currentItem.id === returnedDaybookDayItem.id) {
            daybookDayItems.splice(daybookDayItems.indexOf(currentItem), 1, returnedDaybookDayItem);
          }
        }
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this.updateChangeSubscription(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
      });
  }

  saveDaybookDayItem(daybookDayItem: DaybookDayItem): void {
    const postUrl = serverUrl + '/api/daybook-day-item/create';
    daybookDayItem.userId = this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    // console.log("Notice:  saveDaybookItem() method is disabled (no HTTP request)")
    this.httpClient.post<{ message: string, data: any }>(postUrl, daybookDayItem.httpShape, httpOptions)
      .pipe<DaybookDayItem>(map((response) => {
        return this.buildDaybookDayItemFromResponse(response.data as any);
      }))
      .subscribe((daybookDayItem: DaybookDayItem) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        daybookDayItems.push(daybookDayItem);
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this.updateChangeSubscription(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
      });
    // return daybookDayItem;
  }
  public saveMultipleDayItems(daybookDayItems: DaybookDayItem[]) {
    // console.log("Saving multiplo: ", daybookDayItems.length)
    // console.log(daybookDayItems);
    daybookDayItems.forEach((item) => { item.userId = this._authStatus.user.id; });
    forkJoin(daybookDayItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) => this.saveDaybookDayItem$(item)))
      .subscribe((savedItems: DaybookDayItem[]) => {
        console.log('Forkjoin complete' + savedItems.length, savedItems)
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        daybookDayItems = daybookDayItems.concat(savedItems);
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this.updateChangeSubscription(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);

      });
  }

  public updateMultipleDayItems(daybookDayItems: DaybookDayItem[]) {
    forkJoin(daybookDayItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) => this.updateDaybookDayItem$(item)))
      .subscribe((updatedItems: DaybookDayItem[]) => {
        console.log('Forkjoin complete' + updatedItems.length, updatedItems)
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;

        updatedItems.forEach((updatedItem) => {
          const foundItem: DaybookDayItem = daybookDayItems.find((item) => item.id === updatedItem.id);
          if (foundItem) {
            daybookDayItems.splice(daybookDayItems.indexOf(foundItem), 1, updatedItem);
          } else {
            console.log('error after sending update request:  couldn\'t find item id in original array')
          }
        });
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this.updateChangeSubscription(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);

      });
  }

  private saveDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    console.log(' $ Saving daybook day item: ', daybookDayItem.dateYYYYMMDD)
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
        return this.buildDaybookDayItemFromResponse(response.data as any);
      }));
  }
  public updateDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    console.log(' $ updating daybook day item: ', daybookDayItem.dateYYYYMMDD)
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
        return this.buildDaybookDayItemFromResponse(response.data as any);
      }));
  }

  deleteDaybookDayItem(daybookDayItem: DaybookDayItem) {
    const postUrl = serverUrl + '/api/daybook-day-item/delete';
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
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this.updateChangeSubscription(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
      });
  }






  // private fetchDaybookDayItemsInRange(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string) {
  //   console.log("Fetching items in range; " + rangeStartYYYYMMDD + " to " + rangeEndYYYYMMDD)
  //   const getUrl = serverUrl + '/api/daybook-day-item/' + this._authStatus.user.id + '/' + rangeStartYYYYMMDD + '/' + rangeEndYYYYMMDD;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //       // 'Authorization': 'my-auth-token'  
  //     })
  //   };
  //   this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
  //     .pipe<DaybookDayItem[]>(map((response) => {
  //       return this.buildDaybookDayItemsFromResponse(response.data as any[]);
  //     }))
  //     .subscribe((daybookDayItems: DaybookDayItem[]) => {
  //       daybookDayItems = this.linkDaybookItems(daybookDayItems);
  //       this.updateChangeSubscription(daybookDayItems);
  //       this._daybookDayItems$.next(daybookDayItems);
  //     });
  // }

  public fetchDaybookDayItemsInRange$(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string): Observable<DaybookDayItem[]> {
    console.log("Fetching items in range; " + rangeStartYYYYMMDD + " to " + rangeEndYYYYMMDD)
    const getUrl = serverUrl + '/api/daybook-day-item/' + this._authStatus.user.id + '/' + rangeStartYYYYMMDD + '/' + rangeEndYYYYMMDD;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemsFromResponse(response.data as any[]);
      }));
  }

  /**
   * This method first searches the database for existing items of the provided date and the previous and following dates of that date.
   * if 1 or more of the 3 dates do not exist in the DB, then a new method will be called to create them, and save them, 
   * and link them, and then return the item for the provided date with the previous and following dates attached.
   * @param thisDateYYYYMMDD the date of the DaybookDayItem to get
   */
  public getDaybookDayItemByDate$(thisDateYYYYMMDD: string): Observable<DaybookDayItem> {
    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'day').format('YYYY-MM-DD');
    const getUrl = serverUrl + '/api/daybook-day-item/' + this._authStatus.user.id + '/' + prevDateYYYYMMDD + '/' + nextDateYYYYMMDD;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    const responseItem: Subject<DaybookDayItem> = new Subject();
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemsFromResponse(response.data as any[]);
      })).subscribe((responseItems: DaybookDayItem[]) => {
        const prevItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
        const nextItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
        let thisItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
        if (prevItem && nextItem && thisItem) {
          // console.log("We got a hit:  prev, this, next: all days exist: " + thisDateYYYYMMDD);
          responseItems = this.linkDaybookItems(responseItems);
          thisItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
          responseItem.next(thisItem);
        } else {
          // console.log("Missing some items, so creating them, saving them, returning them.")
          this._createMissingItemsForDate$(thisDateYYYYMMDD, responseItems).subscribe(dayItem => responseItem.next(dayItem));
        }
      });
    return responseItem.asObservable();
  }

  private _createMissingItemsForDate$(thisDateYYYYMMDD: string, responseItems: DaybookDayItem[]): Observable<DaybookDayItem> {
    const prevDateYYYYMMDD: string = moment(thisDateYYYYMMDD).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDateYYYYMMDD: string = moment(thisDateYYYYMMDD).add(1, 'day').format('YYYY-MM-DD');

    let prevItem = responseItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD);
    let nextItem = responseItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD);
    let thisItem = responseItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);

    const saveItems: DaybookDayItem[] = [];

    if (!prevItem) { saveItems.push(new DaybookDayItem(prevDateYYYYMMDD)); }
    if (!nextItem) { saveItems.push(new DaybookDayItem(nextDateYYYYMMDD)); }
    if (!thisItem) { saveItems.push(new DaybookDayItem(thisDateYYYYMMDD)); }

    const responseItem$: Subject<DaybookDayItem> = new Subject();

    forkJoin(saveItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) => this.saveDaybookDayItem$(item)))
      .subscribe((savedItems: DaybookDayItem[]) => {
        if (!prevItem) { prevItem = savedItems.find(i => i.dateYYYYMMDD === prevDateYYYYMMDD); }
        if (!nextItem) { nextItem = savedItems.find(i => i.dateYYYYMMDD === nextDateYYYYMMDD); }
        if (!thisItem) { thisItem = savedItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD); }

        const linkedItems = this.linkDaybookItems([prevItem, nextItem, thisItem]);
        thisItem = linkedItems.find(i => i.dateYYYYMMDD === thisDateYYYYMMDD);
        responseItem$.next(thisItem);
      });
    return responseItem$.asObservable();
  }

  private updateChangeSubscription(daybookDayItems: DaybookDayItem[]) {
    // console.log("Updating subscriptiuo")
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
    daybookDayItems.forEach((daybookDayItem: DaybookDayItem) => {
      this._changeSubscriptions.push(daybookDayItem.dataChanged$
        .subscribe((dataChangedEvent: { prev: boolean, current: boolean, next: boolean }) => {
          if (dataChangedEvent.prev === true || dataChangedEvent.next === true) {
            const multipleItems: DaybookDayItem[] = []
            if (dataChangedEvent.prev === true) {
              multipleItems.push(daybookDayItem.previousDay);
            }
            multipleItems.push(daybookDayItem);
            if (dataChangedEvent.next === true) {
              multipleItems.push(daybookDayItem.followingDay);
            }
            this.updateMultipleDayItems(multipleItems);
          } else if (dataChangedEvent.current === true) {
            this.updateDaybookDayItem(daybookDayItem);
          } else {
            console.log('Error:  bad data changed event in daybookHttpService');
          }
        }));
    });
  }

  private buildDaybookDayItemsFromResponse(responseDataItems: any[]): DaybookDayItem[] {
    const daybookDayItems: DaybookDayItem[] = [];
    responseDataItems.forEach((responseDataItem: any) => {
      daybookDayItems.push(this.buildDaybookDayItemFromResponse(responseDataItem));
    });

    return daybookDayItems;
  }

  private buildDaybookDayItemFromResponse(dayItemHttpData: any): DaybookDayItem {

    const properties: string[] = [
      '_id',
      'userId',
      'dateYYYYMMDD',
      'daybookTimelogEntryDataItems',
      'timeDelineators',
      'daybookActivityDataItems',
      'dailyTaskListDataItems',
      'dayStructureDataItems',
      'sleepCycleDataItems',
      'sleepProfile',
      'dailyWeightLogEntryKg',
      'scheduledActivityItems',
      'dayTemplateId',
      'scheduledEventIds',
      'notebookEntryIds',
      'taskItemIds'];
    let dataErrors: boolean = false;
    properties.forEach(property => {
      if (!(property in dayItemHttpData)) {
        console.log('Error with activity data object: missing property: ', property);
        dataErrors = true;
      }
    });
    if (!dataErrors) {
      return this.buildDaybookDayItem(dayItemHttpData as DaybookDayItemHttpShape);
    } else {
      console.log('DaybookDayItem is not built because of missing property.');
      return null;
    }
  }

  private buildDaybookDayItem(data: DaybookDayItemHttpShape): DaybookDayItem {

    /**
     * This method is where we populate pieces of the DaybookDayItem class object with data from other sources. 
     */

    const daybookDayItem: DaybookDayItem = new DaybookDayItem(data.dateYYYYMMDD);
    daybookDayItem.setHttpShape(data);

    if (daybookDayItem.scheduledActivityItems.length > 0) {
      // TO DO:  probably just change this to run a method that gives the activity tree to the object,
      // and then inside of the object for any activity that exists in any variable, (scheduled activities, timelog entries, other, etc.),
      // then build those activity items from inside.
      daybookDayItem.buildScheduledActivities(this.activitiesService.activitiesTree);
    }

    return daybookDayItem;
  }


  private linkDaybookItems(items: DaybookDayItem[]): DaybookDayItem[] {
    // console.log("Linking items", items);
    items.forEach((item) => {
      item.previousDay = null;
      item.followingDay = null;
    });
    items = items.sort((item1, item2) => {
      if (item1.dateYYYYMMDD < item2.dateYYYYMMDD) {
        return -1;
      }
      if (item1.dateYYYYMMDD > item2.dateYYYYMMDD) {
        return 1;
      }
      return 0;
    });
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        if (moment(items[i - 1].dateYYYYMMDD).format('YYYY-MM-DD') ===
          moment(items[i].dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD')) {
          items[i].previousDay = items[i - 1];
        } else { }
      }
      if (i < items.length - 1) {
        if (moment(items[i + 1].dateYYYYMMDD).format('YYYY-MM-DD') === moment(items[i].dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD')) {
          items[i].followingDay = items[i + 1];
        } else { }
      }
    }
    items.forEach((item) => {
      let prev = '';
      let next = '';
      if (item.previousDay) {
        prev = item.previousDay.dateYYYYMMDD;
      }
      if (item.followingDay) {
        next = item.followingDay.dateYYYYMMDD;
      }
      // console.log("Item: " + item.dateYYYYMMDD + " , pre, following: " + prev + "  " + fol);
    });
    return items;

  }

}
