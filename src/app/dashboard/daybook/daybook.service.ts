import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from './api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { AuthStatus } from '../../authentication/auth-status.class';
import { ServiceAuthenticates } from '../../authentication/service-authentication/service-authenticates.interface';
import { ActivityCategoryDefinitionService } from '../activities/api/activity-category-definition.service';
import { TimelogEntryItem } from './widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';


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
  private _today$: BehaviorSubject<DaybookDayItem> = new BehaviorSubject(null);
  private _todayYYYYMMDD: string = moment().format('YYYY-MM-DD');
  private _activeDay$: BehaviorSubject<DaybookDayItem> = new BehaviorSubject(null);

  private _clockSubscriptions: Subscription[] = [];
  private _daybookItemSubs: Subscription[] = [];

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
    this._activeDay$.next(null);
    this._today$.next(null);
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
      .subscribe((todayItem: DaybookDayItem) => {
        this._setTodayItem(todayItem, crossedMidnight);
        this._loginComplete$.next(true);
      });
  }

  private _setTodayItem(todayItem: DaybookDayItem, crossedMidnight?: boolean) {
    todayItem.setIsToday();
    this._today$.next(todayItem);
    if (!this.activeDay) { this._updateActiveDay(this.today); } else
      if (this.activeDay.dateYYYYMMDD === todayItem.dateYYYYMMDD) { this._updateActiveDay(todayItem); } else
        if (crossedMidnight === true) {
          if (this.activeDay.dateYYYYMMDD === moment(todayItem.dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD')) {
            console.log("Crossed midnight, active day was "
              + this.activeDay.dateYYYYMMDD + " , updating to today: " + todayItem.dateYYYYMMDD);
            this._updateActiveDay(todayItem);
          }
        }
    this._updateChangeSubscriptions();
  }

  private _crossMidnight() {
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    this._updateTodayFromDatabase(true);
  }


  private _updateActiveDay(newActiveDay: DaybookDayItem) {
    // console.log("Updating active day : " + newActiveDay);
    this._activeDay$.next(newActiveDay);
    this._updateChangeSubscriptions();
  }

  private _updateChangeSubscriptions() {
    // console.log("Updating change subscriptions");
    this._daybookItemSubs.forEach(s => s.unsubscribe());
    this._daybookItemSubs = [];
    const items: DaybookDayItem[] = [this.today];
    if (this.today.dateYYYYMMDD !== this.activeDay.dateYYYYMMDD) {
      // console.log("  Active day is not today")
      items.push(this.activeDay);
    }
    items.forEach((daybookDayItem: DaybookDayItem) => {
      // console.log("Subscribing to daybookDayItem: " + daybookDayItem.dateYYYYMMDD);
      const sub = daybookDayItem.dataChanged$
        .subscribe((dataChangedEvent: { prev: boolean, current: boolean, next: boolean }) => {
          // console.log(daybookDayItem.dateYYYYMMDD + " : Data changed event:")
          this.daybookHttpRequestService.updateDaybookDayItem$(daybookDayItem)
            .subscribe((updated) => {
              const prev = daybookDayItem.previousDay;
              const next = daybookDayItem.followingDay;
              const newActiveDay = updated;
              newActiveDay.previousDay = prev;
              newActiveDay.followingDay = next;
              if (newActiveDay.dateYYYYMMDD === this.today.dateYYYYMMDD) {
                // console.log("    setting today item after change")
                this._setTodayItem(newActiveDay);
              } else if (newActiveDay.dateYYYYMMDD === this.activeDay.dateYYYYMMDD) {
                // console.log("   setting active day item after change");
                this._updateActiveDay(newActiveDay);
              }
            });
        });
      this._daybookItemSubs.push(sub);
    });
  }

  public get clock(): moment.Moment { return moment(this._clock); }
  public get todayYYYYMMDD(): string { return this._todayYYYYMMDD; }
  // public get today$(): Observable<DaybookDayItem> { return this._today$.asObservable(); }
  public get today(): DaybookDayItem { return this._today$.getValue(); }
  public get activeDay$(): Observable<DaybookDayItem> { return this._activeDay$.asObservable(); }
  public get activeDay(): DaybookDayItem { return this._activeDay$.getValue(); }


  public setActiveDayYYYYMMDD(changedDayYYYYMMDD: string) {
    // console.log('Daybook service: changing the active date to: ' + changedDayYYYYMMDD);
    if (changedDayYYYYMMDD === this.todayYYYYMMDD) {
      // console.log("   active day was today, so updating TODAY item")
      this._updateTodayFromDatabase();
      // console.log("  today item was updated, now setting active day item");
      this._updateActiveDay(this.today);
    } else {
      // console.log("   active day was NOT today so updating active day only")
      this.getActiveDateFromDatabase(changedDayYYYYMMDD);

    }
  }
  private getActiveDateFromDatabase(dateYYYYMMDD: string) {
    this.daybookHttpRequestService.getDaybookDayItemByDate$(dateYYYYMMDD)
      .subscribe((activeDayItem: DaybookDayItem) => {
        this._updateActiveDay(activeDayItem);
      });
  }


}
