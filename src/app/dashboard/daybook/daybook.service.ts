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

  private _clockSubscription: Subscription = new Subscription();
  private _todaySubscription: Subscription = new Subscription();
  private _todayChangedSub: Subscription = new Subscription();
  private _activeDayChangedSub: Subscription = new Subscription();

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
    this._clockSubscription.unsubscribe();
    this._todaySubscription.unsubscribe();
  }

  private _initiate() {
    this._startClock();
    this._initiateToday();
  }

  private _startClock() {
    this._clockSubscription.unsubscribe();
    this._clock = moment();
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    this._clockSubscription = timer(0, 1000).subscribe((second) => {
      this._clock = moment();
      if (this._clock.format('YYYY-MM-DD') !== this.todayYYYYMMDD) {
        this._crossMidnight();
      }
    });
  }

  private _initiateToday() {
    this._todaySubscription.unsubscribe();
    this._todaySubscription = this.daybookHttpRequestService.getDaybookDayItemByDate$(this.clock.format('YYYY-MM-DD'))
      .subscribe((todayItem: DaybookDayItem) => {
        this._today$.next(todayItem);
        this._updateActiveDay(todayItem);
        this._loginComplete$.next(true);
      });
  }

  private _crossMidnight() {
    let updateActiveDay = false;
    if (this.activeDay.dateYYYYMMDD === this.todayYYYYMMDD) {
      updateActiveDay = true;
    }
    this._todayYYYYMMDD = this.clock.format('YYYY-MM-DD');
    this._initiateToday();
    if (updateActiveDay) {
      this._updateActiveDay(this.today);
    }
  }

  private _updateActiveDay(newActiveDay: DaybookDayItem) {
    this._activeDay$.next(newActiveDay);
    this._updateChangeSubscriptions();
  }

  private _updateChangeSubscriptions() {
    this._todayChangedSub.unsubscribe();
    this._activeDayChangedSub.unsubscribe();
    if (this.today.dateYYYYMMDD === this.activeDay.dateYYYYMMDD) {
      this._activeDayChangedSub = this.activeDay.dataChanged$
        .subscribe((dataChangedEvent: { prev: boolean, current: boolean, next: boolean }) => {
          this.daybookHttpRequestService.updateDaybookDayItem$(this.activeDay)
            .subscribe((updated) => {
              const prev = this.activeDay.previousDay;
              const next = this.activeDay.followingDay;
              const newActiveDay = updated;
              newActiveDay.previousDay = prev;
              newActiveDay.followingDay = next;
              this._updateActiveDay(newActiveDay);
            });
        });
    } else {

    }
  }

  public get clock(): moment.Moment { return moment(this._clock); }
  public get todayYYYYMMDD(): string { return this._todayYYYYMMDD; }
  // public get today$(): Observable<DaybookDayItem> { return this._today$.asObservable(); }
  public get today(): DaybookDayItem { return this._today$.getValue(); }
  public get activeDay$(): Observable<DaybookDayItem> { return this._activeDay$.asObservable(); }
  public get activeDay(): DaybookDayItem { return this._activeDay$.getValue(); }


  public setActiveDayYYYYMMDD(changedDayYYYYMMDD: string) {
    console.log('Daybook service: changing the active date to: ' + changedDayYYYYMMDD);
    this.updateActiveDay(changedDayYYYYMMDD);
  }
  private updateActiveDay(dateYYYYMMDD: string) {
    this.daybookHttpRequestService.getDaybookDayItemByDate$(dateYYYYMMDD)
      .subscribe((activeDayItem: DaybookDayItem) => {
        this._updateActiveDay(activeDayItem);
      });
  }

  /**
   * This method is for the tool menu item for entering in a new timelog Entry.
   * Implicitly, this tool is for active current use, as in: enter a new timelog entry for the period of time
   * of the previous relevant start time (e.g. wake up) to now.
   */
  public saveTimelogEntry(timelogEntry: TimelogEntryItem, afterMidnightEntry?: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    const dateYYYYMMDD: string = timelogEntry.startTime.format('YYYY-MM-DD');
    if (dateYYYYMMDD === this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    }
    if (daybookDayItem) {
      daybookDayItem.timelog.addTimelogEntryItem(timelogEntry);
      if (afterMidnightEntry) {
        daybookDayItem.followingDay.timelog.addTimelogEntryItem(afterMidnightEntry);
      }
    } else {
      console.log('Error, TLE not saved: no daybook day item');
    }
  }

  public updateTimelogEntry(timelogEntry: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    const dateYYYYMMDD: string = timelogEntry.startTime.format('YYYY-MM-DD');
    if (dateYYYYMMDD === this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    }
    if (daybookDayItem) {
      daybookDayItem.timelog.updateTimelogEntry(timelogEntry);
    } else {
      console.log('Error, cant update timelog entry:  No daybook day item');
    }

  }

  public deleteTimelogEntry(timelogEntry: TimelogEntryItem) {
    let daybookDayItem: DaybookDayItem;
    const dateYYYYMMDD: string = timelogEntry.startTime.format('YYYY-MM-DD');
    if (dateYYYYMMDD === this.activeDay.dateYYYYMMDD) {
      daybookDayItem = this.activeDay;
    }
    if (daybookDayItem) {
      daybookDayItem.timelog.deleteTimelogEntry(timelogEntry);
    } else {
      console.log('Error, can\'t Delete timelog entry:  No daybook day item');
    }
  }

}
