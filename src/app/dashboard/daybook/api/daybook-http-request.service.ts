import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable, Subscription, forkJoin } from 'rxjs';
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
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    let rangeStartYYYYMMDD: string = moment().startOf("year").format("YYYY-MM-DD");
    let rangeEndYYYYMMDD: string = moment().endOf("year").format("YYYY-MM-DD");
    this.fetchDaybookDayItemsInRange(rangeStartYYYYMMDD, rangeEndYYYYMMDD);
    return this._loginComplete$.asObservable();
  }

  logout() {
    this._authStatus = null;
    this._daybookDayItems$.next([]);
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  public get daybookDayItems$(): Observable<DaybookDayItem[]> {
    return this._daybookDayItems$.asObservable();
  }
  public get daybookDayItems(): DaybookDayItem[] {
    return this._daybookDayItems$.getValue();
  }



  public updateDaybookDayItem(daybookDayItem: DaybookDayItem) {
    console.log("Sending HTTP update request for daybook day item");
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
        return this.buildDaybookDayItemFromResponse(response.data as any);
      }))
      .subscribe((returnedDaybookDayItem: DaybookDayItem) => {
        let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        for (let daybookDayItem of daybookDayItems) {
          if (daybookDayItem.id == returnedDaybookDayItem.id) {
            daybookDayItems.splice(daybookDayItems.indexOf(daybookDayItem), 1, returnedDaybookDayItem)
          }
        }
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
        this.updateChangeSubscription();
      });
  }

  saveDaybookDayItem(daybookDayItem: DaybookDayItem): void {
    const postUrl = serverUrl + "/api/daybook-day-item/create";
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
        this._daybookDayItems$.next(daybookDayItems);
        this.updateChangeSubscription();
      });
    // return daybookDayItem;
  }
  public saveMultipleDayItems(daybookDayItems: DaybookDayItem[]) {
    console.log("Saving multiplo: ", daybookDayItems.length)
    // console.log(daybookDayItems);
    daybookDayItems.forEach((item) => { item.userId = this._authStatus.user.id; });
    forkJoin(daybookDayItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) => { return this.saveDaybookDayItem$(item) })).subscribe((savedItems: DaybookDayItem[]) => {
      let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
      daybookDayItems = daybookDayItems.concat(savedItems);
      daybookDayItems = this.linkDaybookItems(daybookDayItems);
      this._daybookDayItems$.next(daybookDayItems);
      this.updateChangeSubscription();
    })


  }
  private saveDaybookDayItem$(daybookDayItem: DaybookDayItem): Observable<DaybookDayItem> {
    const postUrl = serverUrl + "/api/daybook-day-item/create";
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
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
        this.updateChangeSubscription();
      });
  }






  private fetchDaybookDayItemsInRange(rangeStartYYYYMMDD: string, rangeEndYYYYMMDD: string) {
    const getUrl = serverUrl + "/api/daybook-day-item/" + this._authStatus.user.id + "/" + rangeStartYYYYMMDD + "/" + rangeEndYYYYMMDD;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<DaybookDayItem[]>(map((response) => {
        return this.buildDaybookDayItemsFromResponse(response.data as any[]);
      }))
      .subscribe((daybookDayItems: DaybookDayItem[]) => {
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
        this.updateChangeSubscription();
        this._loginComplete$.next(true);
      });
  }


  private _changeSubscriptions: Subscription[] = [];
  private updateChangeSubscription() {
    // console.log("Updating subscriptiuo")
    this._changeSubscriptions.forEach((sub) => sub.unsubscribe());
    this._daybookDayItems$.getValue().forEach((daybookDayItem: DaybookDayItem) => {
      this._changeSubscriptions.push(daybookDayItem.dataChanged$.subscribe((dataChangedEvent) => {
        // console.log("we received an update foolio");
        this.updateDaybookDayItem(daybookDayItem);
      }));
    });
  }

  private buildDaybookDayItemsFromResponse(responseDataItems: any[]): DaybookDayItem[] {
    let daybookDayItems: DaybookDayItem[] = [];
    responseDataItems.forEach((responseDataItem: any) => {
      daybookDayItems.push(this.buildDaybookDayItemFromResponse(responseDataItem));
    });

    return daybookDayItems;
  }

  private buildDaybookDayItemFromResponse(dayItemHttpData: any): DaybookDayItem {

    const properties: string[] = [
      "_id", 
      "userId", 
      "dateYYYYMMDD", 
      "daybookTimelogEntryDataItems",
      "timeDelineators",
      "daybookActivityDataItems", 
      "dailyTaskListDataItems", 
      "dayStructureDataItems", 
      "sleepCycleDataItems",
      "sleepProfile", 
      "dailyWeightLogEntryKg", 
      "scheduledActivityItems", 
      "dayTemplateId",
      "scheduledEventIds", 
      "notebookEntryIds", 
      "taskItemIds"];
    let dataErrors: boolean = false;
    properties.forEach(property => {
      if (!(property in dayItemHttpData)) {
        console.log("Error with activity data object: missing property: ", property);
        dataErrors = true;
      }
    });
    if (!dataErrors) {
      return this.buildDaybookDayItem(dayItemHttpData as DaybookDayItemHttpShape);
    } else {
      console.log("DaybookDayItem is not built because of missing property.");
      return null;
    }
  }

  private buildDaybookDayItem(data: DaybookDayItemHttpShape): DaybookDayItem{
    
    /**
     * This method is where we populate pieces of the DaybookDayItem class object with data from other sources. 
     */

    let daybookDayItem: DaybookDayItem = new DaybookDayItem(data.dateYYYYMMDD);
    daybookDayItem.setHttpShape(data);
    
    if(daybookDayItem.scheduledActivityItems.length > 0){
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
      // console.log("items["+i+"] : " + items[i].dateYYYYMMDD);
      if (i > 0) {
        if (moment(items[i - 1].dateYYYYMMDD).format("YYYY-MM-DD") === moment(items[i].dateYYYYMMDD).subtract(1, "days").format("YYYY-MM-DD")) {
          items[i].previousDay = items[i - 1];
          // console.log("items[i]("+items[i].dateYYYYMMDD+").previousDay = " + items[i-1].dateYYYYMMDD );
          // console.log("items[i]("+items[i].dateYYYYMMDD+").previousDay = " + items[i].previousDay.dateYYYYMMDD );
        } else {
          // console.log("error ?",moment(items[i-1].dateYYYYMMDD).format("YYYY-MM-DD") + " is not zhe same as " + moment(items[i].dateYYYYMMDD).subtract(1, "days").format("YYYY-MM-DD"))
        }

      }
      if (i < items.length - 1) {
        if (moment(items[i + 1].dateYYYYMMDD).format("YYYY-MM-DD") === moment(items[i].dateYYYYMMDD).add(1, "days").format("YYYY-MM-DD")) {
          items[i].followingDay = items[i + 1];
          // console.log("i is " + i + " " , items[i+1]);
          // console.log(items[i].followingDay)
          // console.log("items[i]("+items[i].dateYYYYMMDD+").followingDay = " + items[i+1].dateYYYYMMDD );
          // console.log("items[i]("+items[i].dateYYYYMMDD+").followingDay = " + items[i].followingDay.dateYYYYMMDD );
        } else {
          // console.log("error ?", moment(items[i+1].dateYYYYMMDD).format("YYYY-MM-DD") + " is not hte same as " + moment(items[i].dateYYYYMMDD).add(1, "days").format("YYYY-MM-DD") )
        }
      }
    }
    // console.log("Linked items: ", items);
    // console.log("Item, with preceding and following dates: ");
    items.forEach((item) => {
      let prev = "";
      let fol = "";
      if (item.previousDay) {
        prev = item.previousDay.dateYYYYMMDD
      }
      if (item.followingDay) {
        fol = item.followingDay.dateYYYYMMDD
      }
      // console.log("Item: " + item.dateYYYYMMDD + " , pre, following: " + prev + "  " + fol);
    })
    return items;

  }

}
