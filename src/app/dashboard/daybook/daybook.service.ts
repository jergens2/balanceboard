import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from './api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { AuthStatus } from '../../authentication/auth-status.class';
import { DayTemplatesService } from '../scheduling/day-templates/day-templates.service';
import { ServiceAuthenticates } from '../../authentication/service-authentication/service-authenticates.interface';
import { ScheduleRotationsService } from '../scheduling/schedule-rotations/schedule-rotations.service';
import { RoutineDefinitionService } from '../activities/routines/api/routine-definition.service';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';
import { TimelogEntryItem } from './widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';


@Injectable({
  providedIn: 'root'
})
export class DaybookService implements ServiceAuthenticates {

  constructor(
    private daybookHttpRequestService: DaybookHttpRequestService,
    private scheduleRotationService: ScheduleRotationsService,
    private routineDefinitionService: RoutineDefinitionService,
    private activitiesService: ActivityCategoryDefinitionService,
    private dayTemplatesService: DayTemplatesService,
  ) { }


  private _authStatus: AuthStatus;
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _allSubscriptions: Subscription[] = [];

  public login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    if (this.daybookHttpRequestService.daybookDayItems.length == 0) {
      this.startANewDay(moment().format("YYYY-MM-DD"));
    }
    this._allSubscriptions.push(this.daybookHttpRequestService.daybookDayItems$.subscribe((daybookDayItems: DaybookDayItem[]) => {
      if (daybookDayItems.length > 0) {
        this._daybookDayItems$.next(daybookDayItems);
        this.initiateClock();
      }
    }));
    this._allSubscriptions.push(this.activitiesService.activitiesTree$.subscribe((changedTree) => {
      // this.updateActivityItems(changedTree);
    }));

    return this._loginComplete$.asObservable();
  }

  public logout() {
    this._authStatus = null;
    this._activeDay$.next(null);
    this._today$.next(null);

    this._daybookDayItems$.next([]);
    // this._activeDayYYYYMMDD = this._todayYYYYMMDD;
    this._clock = null;
    this.clockSubscription.unsubscribe();
    this._allSubscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this._allSubscriptions = [];
  }



  private _clock: moment.Moment = moment();

  // private _todayYYYYMMDD: string = moment().format("YYYY-MM-DD");
  private _today$: BehaviorSubject<DaybookDayItem> = new BehaviorSubject(null);
  public get today$(): Observable<DaybookDayItem> {
    return this._today$.asObservable();
  }
  // public get todayYYYYMMDD(): string { return this.today.dateYYYYMMDD; }
  public get today(): DaybookDayItem {
    return this._today$.getValue();
  }

  public get activeDayIsToday(): boolean {
    if(this.activeDay){
      return this.activeDay.dateYYYYMMDD == moment().format("YYYY-MM-DD");
    }else{
      return true;
    }
    
  }

  // private _activeDayYYYYMMDD: string = moment().format("YYYY-MM-DD");
  private _activeDay$: BehaviorSubject<DaybookDayItem> = new BehaviorSubject(null);
  public get activeDay$(): Observable<DaybookDayItem> {
    return this._activeDay$.asObservable();
  }
  public get activeDay(): DaybookDayItem {
    return this._activeDay$.getValue();
  }


  public setActiveDayYYYYMMDD(changedDayYYYYMMDD: string) {
    console.log("Daybook service: changing the active date to: " + changedDayYYYYMMDD);
    this.updateActiveDay(changedDayYYYYMMDD);
  }
  private updateActiveDay(dateYYYYMMDD: string) {
    let daybookDayItem: DaybookDayItem = this.getDaybookDayItemByDate(dateYYYYMMDD);
    if (!daybookDayItem) {
      this._activeDay$.next(this.startANewDay(dateYYYYMMDD));
    } else {
      this._activeDay$.next(daybookDayItem);
    }
  }
  // public get activeDayYYYYMMDD(): string {
  //   return this.activeDay.dateYYYYMMDD;
  // }


  private clockSubscription: Subscription = new Subscription();
  private initiateClock() {
    this.clockSubscription.unsubscribe();
    this._clock = moment();
    this.clockSubscription = timer(0, 1000).subscribe((second) => {
      this._clock = moment();
      if (this._clock.format("YYYY-MM-DD") != this.today.dateYYYYMMDD) {
        console.log("Its not the same day.  we passed midnight")
        this.updateToday(this._clock);
      }
    });
    this.updateToday(this._clock);
  }

  private updateToday(time: moment.Moment) {
    let todayYYYYMMDD = moment(time).format("YYYY-MM-DD");
    const activeDayIsToday = this.activeDayIsToday;
    let daybookDayItem: DaybookDayItem = this.getDaybookDayItemByDate(todayYYYYMMDD);
    if (!daybookDayItem) {
      // console.log("Updating today: no daybook day item")
      let newDay: DaybookDayItem = this.startANewDay(todayYYYYMMDD);
      this._today$.next(newDay);
      if (!this.activeDay) {
        this._activeDay$.next(newDay)
      }
    } else {
      // console.log("Updating today: yes daybook day item")
      this._today$.next(daybookDayItem);
      if (activeDayIsToday || !this.activeDay) {
        this._activeDay$.next(daybookDayItem);
      }
    }
    this._loginComplete$.next(true);
    // this.updateIsPastMidnight();
  }

  private getDaybookDayItemByDate(dateYYYYMMDD: string): DaybookDayItem {
    let foundDaybookDayItem: DaybookDayItem = this._daybookDayItems$.getValue().find((daybookDayItem: DaybookDayItem) => {
      return daybookDayItem.dateYYYYMMDD == dateYYYYMMDD;
    });
    if (foundDaybookDayItem) {
      return foundDaybookDayItem;
    } else {
      console.log("Could not find daybook day item: " + dateYYYYMMDD)
      return null;
    }
  }

  private startANewDay(newDateYYYYMMDD: string): DaybookDayItem {
    console.log("***** Daybook:  Starting a new day: ", newDateYYYYMMDD);
    let newDay: DaybookDayItem = this.buildNewDaybookDayItem(newDateYYYYMMDD);
    let saveDays: DaybookDayItem[] = [];

    const previousDateYYYYMMDD: string = moment(newDateYYYYMMDD).subtract(1, "day").format("YYYY-MM-DD");
    const followingDateYYYYMMDD: string = moment(newDateYYYYMMDD).add(1, "day").format("YYYY-MM-DD");

    // console.log("Saving new days: ")
    // console.log("   " + previousDateYYYYMMDD)
    // console.log("   " + newDateYYYYMMDD)
    // console.log("   " + followingDateYYYYMMDD)

    let previousDaybookDayItem: DaybookDayItem = this.getDaybookDayItemByDate(previousDateYYYYMMDD);
    let followingDaybookDayItem: DaybookDayItem = this.getDaybookDayItemByDate(followingDateYYYYMMDD);

    if (!previousDaybookDayItem) {
      previousDaybookDayItem = this.buildNewDaybookDayItem(previousDateYYYYMMDD);
      // console.log("pushing", previousDaybookDayItem)
      saveDays.push(previousDaybookDayItem);
      // newDay.previousDay = previousDaybookDayItem;
    }
    
    saveDays.push(newDay);
    if (!followingDaybookDayItem) {
      followingDaybookDayItem = this.buildNewDaybookDayItem(followingDateYYYYMMDD);
      // console.log("pushing", followingDaybookDayItem)
      saveDays.push(followingDaybookDayItem);
      // console.log("savedays: ", saveDays);
    }
    

    // console.log("Saving multiple days: " )
    // saveDays.forEach((day)=>{
    //   console.log("   " + day.dateYYYYMMDD + "(((" + day.httpShape.dateYYYYMMDD );
    // })


    this.daybookHttpRequestService.saveMultipleDayItems(saveDays);
    // this.daybookHttpRequestService.saveDaybookDayItem(newDay);
    return newDay;
  }

  private buildNewDaybookDayItem(dateYYYYMMDD: string): DaybookDayItem {
    console.log("Building a new Daybook item: " , dateYYYYMMDD);
    let daybookDayItem: DaybookDayItem = new DaybookDayItem(dateYYYYMMDD);
    // daybookDayItem.dayTemplateId = "placeholder:NO_DAY_TEMPLATE";
    // daybookDayItem.dayStructureDataItems = []; //this.scheduleRotationService.getDayStructureItemsForDate(dateYYYYMMDD);
    // daybookDayItem.sleepStructureDataItems = []; //this.scheduleRotationService.getSleepCycleItemsForDate(dateYYYYMMDD);
    daybookDayItem.setScheduledActivityItems(this.activitiesService.activitiesTree.buildScheduledActivityItemsOnDate(dateYYYYMMDD), this.activitiesService.activitiesTree);
    return daybookDayItem;
  }


  /**
   * This method is for the tool menu item for entering in a new timelog Entry.
   * Implicitly, this tool is for active current use, as in: enter a new timelog entry for the period of time 
   * of the previous relevant start time (e.g. wake up) to now.   
   */
  public getNewTimelogEntry(): TimelogEntryItem {
    let startTime: moment.Moment = moment(this.today.getMostRecentActionTime(moment()));
    let endTime: moment.Moment = moment();

    if (this.isAwakeAfterMidnight) {
      let yesterdaysLastAction: moment.Moment = this.today.previousDay.getMostRecentActionTime();
      if (startTime.isSame(moment(this.today.dateYYYYMMDD).startOf("day"))) {
        startTime = moment(yesterdaysLastAction);
      }
    }

    let newTimelogEntry: TimelogEntryItem = new TimelogEntryItem(startTime, endTime, "AWAKE");
    return newTimelogEntry;
  }

  public saveTimelogEntry(timelogEntry: TimelogEntryItem, afterMidnightEntry?: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    let dateYYYYMMDD: string = timelogEntry.startTime.format("YYYY-MM-DD");
    if (dateYYYYMMDD == this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    } else {
      daybookDayItem = this.getDaybookDayItemByDate(dateYYYYMMDD);
    }
    if (daybookDayItem) {
      daybookDayItem.timelog.addTimelogEntryItem(timelogEntry);
      if (afterMidnightEntry) {
        daybookDayItem.followingDay.timelog.addTimelogEntryItem(afterMidnightEntry);
      }
    } else {
      console.log("Error, TLE not saved: no daybook day item")
    }


  }

  public updateTimelogEntry(timelogEntry: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    let dateYYYYMMDD: string = timelogEntry.startTime.format("YYYY-MM-DD");
    if (dateYYYYMMDD == this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    } else {
      daybookDayItem = this.getDaybookDayItemByDate(dateYYYYMMDD);
    }

    if (daybookDayItem) {
      daybookDayItem.timelog.updateTimelogEntry(timelogEntry);
    } else {
      console.log("Error, can't update timelog entry:  No daybook day item")
    }

  }

  public deleteTimelogEntry(timelogEntry: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    let dateYYYYMMDD: string = timelogEntry.startTime.format("YYYY-MM-DD");
    if (dateYYYYMMDD == this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    } else {
      daybookDayItem = this.getDaybookDayItemByDate(dateYYYYMMDD);
    }


    if (daybookDayItem) {
      daybookDayItem.timelog.deleteTimelogEntry(timelogEntry);
    } else {
      console.log("Error, can't Delete timelog entry:  No daybook day item")
    }
  }

  
  public get isAwakeAfterMidnight(): boolean { return this._isAwakeAfterMidnight; }
  private _isAwakeAfterMidnight: boolean = false;
  private _updateIsPastMidnight() {
    let isAwakeAfterMidnight: boolean = false;
    let now = moment(this._clock);


  }


}
