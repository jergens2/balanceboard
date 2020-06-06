import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from '../api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { ServiceAuthenticates } from '../../../authentication/service-authentication-garbage/service-authenticates.interface';
import { DaybookController } from './daybook-controller.class';
import { DaybookDisplayUpdateType, DaybookDisplayUpdate } from './items/daybook-display-update.interface';
import { ServiceAuthenticationAttempt } from '../../../authentication/service-authentication-garbage/service-authentication-attempt.interface';



@Injectable({
  providedIn: 'root'
})
export class DaybookControllerService {

  constructor(
    private daybookHttpRequestService: DaybookHttpRequestService,
  ) { }

  private _userId: string;
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _loginComplete$: Subject<boolean> = new Subject();

  private _clock: moment.Moment = moment();
  // private _clockMinuteTicker$: Subject<moment.Moment>;
  private _todayController$: BehaviorSubject<DaybookController>;
  private _todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
  private _activeDayController$: BehaviorSubject<DaybookController>;

  private _displayUpdated$: Subject<DaybookDisplayUpdate> = new Subject();

  private _clockSubscriptions: Subscription[] = [];
  private _daybookItemSubs: Subscription[] = [];

  public get clock(): moment.Moment { return this._clock; }
  // public get clockMinuteTicker$(): Observable<moment.Moment> { return this._clockMinuteTicker$.asObservable(); } 
  public get todayYYYYMMDD(): string { return this._todayYYYYMMDD; }
  public get todayController$(): Observable<DaybookController> { return this._todayController$.asObservable(); }
  public get todayController(): DaybookController { return this._todayController$.getValue(); }

  // public get batteryLevel(): number { return this.todayController.batteryLevel; }

  public get activeDayController$(): Observable<DaybookController> { return this._activeDayController$.asObservable(); }
  public get activeDayController(): DaybookController { return this._activeDayController$.getValue(); }

  public get displayUpdated$(): Observable<DaybookDisplayUpdate> { return this._displayUpdated$.asObservable(); }
  // public getCurrentEnergy(): number { return this.todayController.getEnergyAtTime(this.clock) }
  

  public getLastActivityTime(): moment.Moment{ 
    if(this.todayController){
      return this.todayController.getLastActivityEndTime();
    }else{
      console.log("Error, no todayController")
      return null;
    }
  }


  public login$(userId: string): Observable<boolean> {
    // console.log("Logging in to daybook controller")
    this._userId = userId;
    this._initiate();
    // this._allSubscriptions.push(this.activitiesService.activitiesTree$.subscribe((changedTree) => {
    //   // this.updateActivityItems(changedTree);
    // }));
    return this._loginComplete$.asObservable();
  }


  public logout() {
    // console.log("Logging out of daybook controller service")
    this._userId = null;
    this._activeDayController$.next(null);
    // this._activeDayController$ = null;
    this._todayController$.next(null);
    // this._todayController$ = null;
    this._todayYYYYMMDD = moment().format('YYYY-MM-DD');
    this._daybookDayItems$.next([]);
    this._clock = null;
    this._clockSubscriptions.forEach(s => s.unsubscribe());
    this._clockSubscriptions = [];
    this._daybookItemSubs.forEach(s => s.unsubscribe());
    this._daybookItemSubs = [];
  }

  private _initiate() {
    this._startClock();
    this._updateTodayFromDatabase(DaybookDisplayUpdateType.DEFAULT);
  }

  private _startClock() {
    this._clockSubscriptions.forEach(s => s.unsubscribe());
    this._clockSubscriptions = [];
    this._clock = moment();
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');


    let currentTestTime = moment().startOf('day');
    // const clockSub = timer(0, 4000).subscribe((second) => {
    //   currentTestTime = moment(currentTestTime).add(29, 'minutes');
    //   console.log(currentTestTime.format('YYYY-MM-DD hh:mm a') + " current test time.");
    //   this._clock = moment(currentTestTime);
    //   if (this._clock.format('YYYY-MM-DD') !== this.todayYYYYMMDD) {
    //     console.log("CROSSING MIDNIGHT")
    //     this._crossMidnight();
    //   }
    //   this._updateTodayFromDatabase();
    // });

    const clockSub = timer(0, 1000).subscribe((second) => {

      this._clock = moment();
      if (this._clock.format('YYYY-MM-DD') !== this.todayYYYYMMDD) {
        this._crossMidnight();
      }
    });

    const msToNextMinute = moment(this._clock).startOf('minute').add(1, 'minute').diff(moment(this._clock), 'milliseconds');
    const minuteSub = timer(msToNextMinute, 60000).subscribe((minute) => {

      this._clock = moment();
      this._updateTodayFromDatabase(DaybookDisplayUpdateType.CLOCK);
    });
    this._clockSubscriptions = [clockSub, minuteSub];
    
  }


  private _updateTodayFromDatabase(updateType: DaybookDisplayUpdateType) {
    // console.log("_updateTodayFromDatabase" , updateType, this.clock.format('YYYY-MM-DD') + " :getting daybook item for date");
    this.daybookHttpRequestService.getDaybookDayItemByDate$(this.clock.format('YYYY-MM-DD'))
      .subscribe((items: DaybookDayItem[]) => {
        // console.log("Setting TODAY item")
        this._setTodayItem(items, updateType);
        this._loginComplete$.next(true);
      },(error)=>{
        console.log("Error with daybook request, ", error);
        this._loginComplete$.next(false);
      }
      );
  }

  private _setTodayItem(items: DaybookDayItem[], updateType: DaybookDisplayUpdateType) {

    const startTime = moment(this.todayYYYYMMDD).startOf('day').subtract(24, 'hours');
    const endTime = moment(this.todayYYYYMMDD).startOf('day').add(48, 'hours');

    // console.log("start time, end time, today, clock, items", startTime.format('YYYY-MM-DD hh:mm a'), endTime.format('YYYY-MM-DD hh:mm a'), this.todayYYYYMMDD, this.clock.format('YYYY-MM-DD hh:mm a'), items)
    console.log("start time, end time", startTime.format('YYYY-MM-DD hh:mm a'), endTime.format('YYYY-MM-DD hh:mm a'));

    const todayController: DaybookController = new DaybookController(this.todayYYYYMMDD, items, startTime, endTime, this.clock);
    if (!this._todayController$) {
      this._todayController$ = new BehaviorSubject(todayController);
    } else {
      this._todayController$.next(todayController);
    }


    this._updateActiveDay(updateType, todayController);

    // if (!this._activeDayController$) {
    //   this._updateActiveDay(updateType, todayController);
    // } else if (this.activeDayController.dateYYYYMMDD === todayController.dateYYYYMMDD) {
    //   this._updateActiveDay(updateType, todayController);
    // }

    // console.log("Active day contorller; " , this._activeDayController$)
    this._updateChangeSubscriptions();
  }

  private _updateTodayItem(updateType: DaybookDisplayUpdateType, todayItem: DaybookController) {
    // it is implied that the todayContoller has already been established.
    this._todayController$.next(todayItem);
    if (this.activeDayController.dateYYYYMMDD === todayItem.dateYYYYMMDD) {
      this._updateActiveDay(updateType, todayItem);
    }
    this._updateChangeSubscriptions();
  }

  private _crossMidnight() {
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    this._updateTodayFromDatabase(DaybookDisplayUpdateType.CLOCK_DATE_CHANGED);
  }


  private _updateActiveDay(updateType: DaybookDisplayUpdateType, newController: DaybookController) {
    if (!this._activeDayController$) {
      this._activeDayController$ = new BehaviorSubject(newController);
    } else {
      this._activeDayController$.next(newController);
    }
    this._displayUpdated$.next({
      type: updateType,
      controller: newController,
    });
    this._updateChangeSubscriptions();
  }

  private _updateChangeSubscriptions() {
    // console.log("Updating change subscriptions");
    this._daybookItemSubs.forEach(s => s.unsubscribe());
    this._daybookItemSubs = [];
    const items: DaybookController[] = [this.todayController];
    if (this.todayController.dateYYYYMMDD !== this.activeDayController.dateYYYYMMDD) {
      // console.log("  Active day is not today")
      items.push(this.activeDayController);
    }
    items.forEach((controller: DaybookController) => {
      // console.log("Subscribing to daybookDayItem: " + daybookDayItem.dateYYYYMMDD);
      const sub = controller.dataChanged$.subscribe((daysChanged) => {
        this._updateController$(controller, daysChanged);
      });
      this._daybookItemSubs.push(sub);
    });
  }




  public setActiveDayYYYYMMDD(changedDayYYYYMMDD: string) {
    // console.log('Daybook service: changing the active date to: ' + changedDayYYYYMMDD);
    if (changedDayYYYYMMDD === this.todayYYYYMMDD) {
      // console.log("   active day was today, so updating TODAY item")
      this._updateTodayFromDatabase(DaybookDisplayUpdateType.CALENDAR);
      // console.log("  today item was updated, now setting active day item");
      this._updateActiveDay(DaybookDisplayUpdateType.CALENDAR, this.todayController);
    } else {
      // console.log("   active day was NOT today so updating active day only")
      this.getActiveDateFromDatabase(changedDayYYYYMMDD);

    }
  }
  private getActiveDateFromDatabase(dateYYYYMMDD: string) {
    this.daybookHttpRequestService.getDaybookDayItemByDate$(dateYYYYMMDD)
      .subscribe((items: DaybookDayItem[]) => {
        const startTime = moment(items[0].startOfThisDay);
        const endTime = moment(items[items.length - 1].endOfThisDay);
        const newController = new DaybookController(dateYYYYMMDD, items, startTime, endTime, this.clock);
        this._updateActiveDay(DaybookDisplayUpdateType.CALENDAR, newController);
      });
  }


  /**
   * This method fires when the controller is updated by a change in data, causing the controller to .reload()
   * @param controller 
   * @param daysChanged 
   */
  private _updateController$(controller: DaybookController, daysChanged): Observable<boolean> {
    let isComplete$: Subject<boolean> = new Subject();
    let prevDay: DaybookDayItem;
    let thisDay: DaybookDayItem;
    let nextDay: DaybookDayItem;

    const daysToUpdate: DaybookDayItem[] = [];
    if (daysChanged.prevDayChanged === true) {
      prevDay = controller.previousDay;
      daysToUpdate.push(prevDay);
    }
    if (daysChanged.thisDayChanged === true) {
      thisDay = controller.thisDay;
      daysToUpdate.push(thisDay);
    }
    if (daysChanged.nextDayChanged === true) {
      nextDay = controller.followingDay;
      daysToUpdate.push(nextDay);
    }

    forkJoin(daysToUpdate.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
      this.daybookHttpRequestService.updateDaybookDayItem$(item)))
      .subscribe((updatedItems: DaybookDayItem[]) => {
        // console.log("Received updated items from forkJoin: ", updatedItems);
        if (!prevDay) { prevDay = controller.previousDay; }
        if (!thisDay) { thisDay = controller.thisDay; }
        if (!nextDay) { nextDay = controller.followingDay; }
        const reloadItem = [prevDay, thisDay, nextDay];


        console.log("TO DO:  ENSure that if the date has changed, that the reload also updates the date in the controller");
        controller.reload(reloadItem);
        if (controller.isToday) {
          this._updateTodayItem(DaybookDisplayUpdateType.DATABASE_ACTION, controller);
        } else {
          this._updateActiveDay(DaybookDisplayUpdateType.DATABASE_ACTION, controller);
        }
        isComplete$.next(true);
      }, (err)=>{
        console.log("error updating day items: " , err);
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }

}
