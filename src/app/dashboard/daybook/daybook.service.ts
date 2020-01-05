import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from './api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { AuthStatus } from '../../authentication/auth-status.class';
import { ServiceAuthenticates } from '../../authentication/service-authentication/service-authenticates.interface';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';
import { TimelogEntryItem } from './widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from './controller/daybook-controller.class';


@Injectable({
  providedIn: 'root'
})
export class DaybookService implements ServiceAuthenticates {

  constructor(
    private daybookHttpRequestService: DaybookHttpRequestService,
    private activitiesService: ActivityCategoryDefinitionService,
  ) { }

  private _authStatus: AuthStatus;
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _clock: moment.Moment = moment();
  private _todayController$: BehaviorSubject<DaybookController>;
  private _todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
  private _activeDayController$: BehaviorSubject<DaybookController>;

  private _clockSubscriptions: Subscription[] = [];
  private _daybookItemSubs: Subscription[] = [];

  public get clock(): moment.Moment { return moment(this._clock); }
  public get todayYYYYMMDD(): string { return this._todayYYYYMMDD; }
  public get todayController$(): Observable<DaybookController> { return this._todayController$.asObservable(); }
  public get todayController(): DaybookController { return this._todayController$.getValue(); }


  public get activeDayController$(): Observable<DaybookController> { return this._activeDayController$.asObservable(); }
  public get activeDayController(): DaybookController { return this._activeDayController$.getValue(); }

  public login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this._initiate();
    // this._allSubscriptions.push(this.activitiesService.activitiesTree$.subscribe((changedTree) => {
    //   // this.updateActivityItems(changedTree);
    // }));
    return this._loginComplete$.asObservable();
  }

  public logout() {
    this._authStatus = null;
    this._activeDayController$.next(null);
    this._todayController$.next(null);
    this._todayYYYYMMDD = moment().format('YYYY-MM-DD');
    this._daybookDayItems$.next([]);
    this._clock = null;
    this._clockSubscriptions.forEach(s => s.unsubscribe());
    this._clockSubscriptions = [];
    this._daybookItemSubs.forEach(s => s.unsubscribe());
    this._daybookItemSubs = [];
  }

  private _initiate() {
    console.log('Method incomplete');
    // TO DO
    /*
      Calculate Sleep Ratio:
      at this stage, get last7 daybook day items, and the next 1, 
      (-7 to +1 from today)

      last 7 use to calculate sleep ratio.

      then from -1 to +1 create the Controller.
    */

    this._startClock();
    this._updateTodayFromDatabase();
  }

  private _startClock() {
    this._clockSubscriptions.forEach(s => s.unsubscribe());
    this._clockSubscriptions = [];
    this._clock = moment();
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    const clockSub = timer(0, 1000).subscribe((second) => {
      this._clock = moment();
      if (this._clock.format('YYYY-MM-DD') !== this.todayYYYYMMDD) {
        console.log("Not the same day.  i have a belief that this will also fire if you open the app on another pc.")
        this._crossMidnight();
      }
    });
    const msToNextMinute = moment(this._clock).startOf('minute').add(1, 'minute').add(30, 'seconds')
      .diff(moment(this._clock), 'milliseconds');
    const minuteSub = timer(msToNextMinute, 60000).subscribe((minute) => {
      // console.log(moment().format('YYYY-MM-DD hh:mm ss a') + " : every minute updating");
      this._updateTodayFromDatabase();
    });
    this._clockSubscriptions = [clockSub, minuteSub];
  }

  private _updateTodayFromDatabase(crossedMidnight?: boolean) {
    // console.log(this.clock.format('YYYY-MM-DD') + " :getting daybook item for date");
    this.daybookHttpRequestService.getDaybookDayItemByDate$(this.clock.format('YYYY-MM-DD'))
      .subscribe((todayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) => {
        // console.log("todayItem from DB: ", todayItem);
        this._setTodayItem(todayItem, crossedMidnight);
        this._loginComplete$.next(true);
      });
  }

  private _setTodayItem(todayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem },
    crossedMidnight?: boolean) {

    console.log("today controller: ");
    console.log("  prevDay: " + todayItem.prevDay.dateYYYYMMDD);
    console.log(" *thisDay: " + todayItem.thisDay.dateYYYYMMDD + " *");
    console.log("  nextDay: " + todayItem.nextDay.dateYYYYMMDD);
    const todayController: DaybookController = new DaybookController(todayItem);


    // todayItem.setIsToday();
    if (!this._todayController$) {
      this._todayController$ = new BehaviorSubject(todayController);
    } else {
      this._todayController$.next(todayController);
    }


    if (!this._activeDayController$) {

      this._updateActiveDay(todayController);
    } else if (this.activeDayController.dateYYYYMMDD === todayController.dateYYYYMMDD) { this._updateActiveDay(todayController); } else
      if (crossedMidnight === true) {
        if (this.activeDayController.dateYYYYMMDD === moment(todayController.dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD')) {
          console.log("Crossed midnight, active day was "
            + this.activeDayController.dateYYYYMMDD + " , updating to today: " + todayController.dateYYYYMMDD);
          this._updateActiveDay(todayController);
        }
      }
    this._updateChangeSubscriptions();
  }

  private _updateTodayItem(todayItem: DaybookController) {
    // it is implied that the todayContoller has already been established.
    this._todayController$.next(todayItem);
    if (this.activeDayController.dateYYYYMMDD === todayItem.dateYYYYMMDD) {
      this._updateActiveDay(todayItem);
    }
    this._updateChangeSubscriptions();
  }

  private _crossMidnight() {
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    this._updateTodayFromDatabase(true);
  }


  private _updateActiveDay(newController: DaybookController) {
    if (!this._activeDayController$) {
      this._activeDayController$ = new BehaviorSubject(newController);
    } else {
      this._activeDayController$.next(newController);
    }

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
        this._updateController(controller, daysChanged);
      });
      this._daybookItemSubs.push(sub);
    });
  }




  public setActiveDayYYYYMMDD(changedDayYYYYMMDD: string) {
    // console.log('Daybook service: changing the active date to: ' + changedDayYYYYMMDD);
    if (changedDayYYYYMMDD === this.todayYYYYMMDD) {
      // console.log("   active day was today, so updating TODAY item")
      this._updateTodayFromDatabase();
      // console.log("  today item was updated, now setting active day item");
      this._updateActiveDay(this.todayController);
    } else {
      // console.log("   active day was NOT today so updating active day only")
      this.getActiveDateFromDatabase(changedDayYYYYMMDD);

    }
  }
  private getActiveDateFromDatabase(dateYYYYMMDD: string) {
    this.daybookHttpRequestService.getDaybookDayItemByDate$(dateYYYYMMDD)
      .subscribe((activeDayItem: { prevDay: DaybookDayItem, thisDay: DaybookDayItem, nextDay: DaybookDayItem }) => {
        console.log("getting active date item: ", activeDayItem);
        const newController = new DaybookController(activeDayItem);
        this._updateActiveDay(newController);
      });
  }


  /**
   * This method fires when the controller is updated by a change in data, causing the controller to .reload()
   * @param controller 
   * @param daysChanged 
   */
  private _updateController(controller: DaybookController, daysChanged) {
    console.log("Updating the controller in the request service: ", controller)
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
        console.log("Received updated items from forkJoin: ", updatedItems);
        if (!prevDay) { prevDay = controller.previousDay; }
        if (!thisDay) { thisDay = controller.thisDay; }
        if (!nextDay) { nextDay = controller.followingDay; }
        const reloadItem = { prevDay: prevDay, thisDay: thisDay, nextDay: nextDay };


        console.log("Reloading with reload item: ", reloadItem)
        controller.reload(reloadItem);
        if (controller.isToday) {
          this._updateTodayItem(controller);
        } else {
          this._updateActiveDay(controller);
        }
      });
  }

}
