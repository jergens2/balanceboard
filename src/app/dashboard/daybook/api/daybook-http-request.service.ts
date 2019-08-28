import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable, ObservedValueOf, Subscription, Subject, scheduled, from, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DaybookDayItem } from './daybook-day-item.class';
import { map, mergeAll, concatAll, concatMap, mergeMap } from 'rxjs/operators';
import { DaybookDayItemHttpShape } from './daybook-day-item-http-shape.interface';
import { ServiceAuthenticates } from '../../../authentication/service-authentication/service-authenticates.interface';

@Injectable({
  providedIn: 'root'
})
export class DaybookHttpRequestService implements ServiceAuthenticates{

  constructor(private httpClient: HttpClient) { }
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
    this._changeSubscriptions.forEach((sub)=>sub.unsubscribe());
  }

  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  public get daybookDayItems$(): Observable<DaybookDayItem[]> {
    return this._daybookDayItems$.asObservable();
  }
  public get daybookDayItems(): DaybookDayItem[]{
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
        return this.buildDaybookDayItem(response.data as any);
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
        return this.buildDaybookDayItem(response.data as any);
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
  public saveMultipleDayItems(daybookDayItems: DaybookDayItem[]){
    // console.log("Saving multiplo: ", daybookDayItems.length)
    // console.log(daybookDayItems);
    daybookDayItems.forEach((item)=>{item.userId = this._authStatus.user.id; });
    from(daybookDayItems).pipe(
      mergeMap(daybookDayItem=> <Observable<DaybookDayItem>>
        this.saveDaybookDayItem$(daybookDayItem)
      )
    ).subscribe((savedItem: DaybookDayItem)=>{
      let daybookDayItems: DaybookDayItem[] = this.daybookDayItems;
        daybookDayItems.push(savedItem);
        daybookDayItems = this.linkDaybookItems(daybookDayItems);
        this._daybookDayItems$.next(daybookDayItems);
        this.updateChangeSubscription();
    });

    
    
  }
  private saveDaybookDayItem$(daybookDayItem): Observable<DaybookDayItem>{
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
        return this.buildDaybookDayItem(response.data as any);
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
  private updateChangeSubscription(){
    this._changeSubscriptions.forEach((sub)=> sub.unsubscribe() );
    this._daybookDayItems$.getValue().forEach((daybookDayItem: DaybookDayItem)=>{
      this._changeSubscriptions.push(daybookDayItem.dataChanged$.subscribe((dataChangedEvent)=>{
        this.updateDaybookDayItem(daybookDayItem);
      }));
    });
  }

  private buildDaybookDayItemsFromResponse(responseDataItems: any[]): DaybookDayItem[]{
    console.log("Not implemented:  In this method, we need to do a property by property check.  This method fires for each daybookDayItem response item");
    /**
     * to see if the incoming object has all the requisite properties.  
     * The reason being that, over time new properties will likely be added and the shape will change.  
     * This method here is where we validate every property, and update the object if not up to modern version.
     * 
     * e.g.
     * 
     * Create a new property for DayBookDayItem called "dailyWeightEntry", 
     * "
     * let newDaybookDayItem = new DaybookDayItem();
     * if(!responseDataItem.dailyWeightEntry){
     *    newDaybookDayItem.dailyWeightEntry = 0;
     * }
     * ...
     * saveUpdatedDaybookDayItem(newDaybookDayItem);
     * "
     * 
     */ 
    let daybookDayItems: DaybookDayItem[] = [];
    responseDataItems.forEach((responseDataItem)=>{
      daybookDayItems.push(this.buildDaybookDayItem(responseDataItem));
    });
    return daybookDayItems;
  }
  private buildDaybookDayItem(dayItemHttp: DaybookDayItemHttpShape): DaybookDayItem{
    let daybookDayItem: DaybookDayItem = new DaybookDayItem(dayItemHttp.dateYYYYMMDD);
    daybookDayItem.setHttpShape(dayItemHttp);
    // console.log("Built item: ", daybookDayItem);
    return daybookDayItem;
  }
  private linkDaybookItems(items: DaybookDayItem[]): DaybookDayItem[]{
    items = items.sort((item1, item2)=>{
      if(item1.dateYYYYMMDD < item2.dateYYYYMMDD){
        return -1;
      }
      if(item1.dateYYYYMMDD > item2.dateYYYYMMDD){
        return 1;
      }
      return 0;
    });
    for(let i=0; i< items.length; i++){
      // console.log("items["+i+"] : " + items[i].dateYYYYMMDD);
      if(i > 0){
        if(moment(items[i-1].dateYYYYMMDD).format("YYYY-MM-DD") === moment(items[i].dateYYYYMMDD).subtract(1, "days").format("YYYY-MM-DD")){
          items[i].previousDay = items[i-1];
          // console.log("items[i]("+items[i].dateYYYYMMDD+").previousDay = " + items[i-1].dateYYYYMMDD );
          // console.log("items[i]("+items[i].dateYYYYMMDD+").previousDay = " + items[i].previousDay.dateYYYYMMDD );
        }else{
          // console.log("error ?",moment(items[i-1].dateYYYYMMDD).format("YYYY-MM-DD") + " is not zhe same as " + moment(items[i].dateYYYYMMDD).subtract(1, "days").format("YYYY-MM-DD"))
        }
        
      }
      if(i < items.length-1){
        if(moment(items[i+1].dateYYYYMMDD).format("YYYY-MM-DD") === moment(items[i].dateYYYYMMDD).add(1, "days").format("YYYY-MM-DD")){
          items[i].followingDay = items[i+1];
          // console.log("i is " + i + " " , items[i+1]);
          // console.log(items[i].followingDay)
          // console.log("items[i]("+items[i].dateYYYYMMDD+").followingDay = " + items[i+1].dateYYYYMMDD );
          // console.log("items[i]("+items[i].dateYYYYMMDD+").followingDay = " + items[i].followingDay.dateYYYYMMDD );
        }else{
          // console.log("error ?", moment(items[i+1].dateYYYYMMDD).format("YYYY-MM-DD") + " is not hte same as " + moment(items[i].dateYYYYMMDD).add(1, "days").format("YYYY-MM-DD") )
        }
      }
    }
    console.log("Linked items: " , items);
    console.log("Item, with preceding and following dates: ");
    items.forEach((item)=>{
      // console.log("Item: " + item.dateYYYYMMDD + " , pre, following: " + item.previousDay.dateYYYYMMDD + "  " + item.followingDay.dateYYYYMMDD);
    })
    return items;
    
  }

}
