import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from './api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { AuthStatus } from '../../authentication/auth-status.class';
import { DayTemplatesService } from '../scheduling/day-templates/day-templates.service';
import { ServiceAuthenticates } from '../../authentication/service-authentication/service-authenticates.interface';
import { ScheduleRotationsService } from '../scheduling/schedule-rotations/schedule-rotations.service';

@Injectable({
  providedIn: 'root'
})
export class DaybookService implements ServiceAuthenticates{

  constructor(private daybookHttpRequestService: DaybookHttpRequestService, private scheduleRotationService: ScheduleRotationsService) { }

  private _authStatus: AuthStatus;
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public login$(authStatus: AuthStatus): Observable<boolean>{
    console.log("daybook Logging in to Daybook Service")
    this._authStatus = authStatus;
    if(this.daybookHttpRequestService.daybookDayItems.length == 0){
      console.log("daybook Logging in:  there were no items.  making a new one.")
      this.startANewDay(this._todayYYYYMMDD);
    }
    this.daybookHttpRequestService.daybookDayItems$.subscribe((daybookDayItems: DaybookDayItem[]) => {
      if(daybookDayItems.length > 0){
        this._daybookDayItems$.next(daybookDayItems);
        this.initiateClock();
      }
    });


    return this._loginComplete$.asObservable();
  }

  public logout() {
    this._authStatus = null;
    this.clockSubscription.unsubscribe();
  }

  /**
   *  There are 2 DaybookDayData variables being tracked here, _today and _activeDay
   *  _today is for knowing that the day is still before midnight, and when midnight crosses, to generate a new day, and to update.  Daily task list tool (as opposed to widget), etc.
   *  _activeDay is for the view, whatever day that the user is looking at, including if today.  Starts on today, but then changes if user navigates to a different date. 
   */



  private _clock: moment.Moment;
  private _todayYYYYMMDD: string = moment().format("YYYY-MM-DD");
  private _today: DaybookDayItem;
  private _today$: Subject<DaybookDayItem> = new Subject();
  public get today$(): Observable<DaybookDayItem> {
    return this._today$.asObservable();
  }


  private _activeDayYYYYMMDD: string = moment().format("YYYY-MM-DD");
  private _activeDay: DaybookDayItem;
  private _activeDay$: Subject<DaybookDayItem> = new Subject();
  public get activeDay$(): Observable<DaybookDayItem> {
    return this._today$.asObservable();
  }


  private clockSubscription: Subscription = new Subscription();
  private initiateClock() {
    console.log("daybook Clock initiating ")
    this.clockSubscription.unsubscribe();
    this._clock = moment();
    this.clockSubscription = timer(0, 1000).subscribe((second) => {
      this._clock = moment();
      if (this._clock.format("YYYY-MM-DD") != this._todayYYYYMMDD) {
        console.log("Its not the same day.  we passed midnight")
        this.updateTodayAndActiveDay(this._clock);
      }
    });
    this.updateTodayAndActiveDay(this._clock);
    console.log("daybook NEEEEEEEEEEEEEEEEXT")
    this._loginComplete$.next(true);
  }

  private updateTodayAndActiveDay(time: moment.Moment){
    this._todayYYYYMMDD = moment(time).format("YYYY-MM-DD");
    let todayItem: DaybookDayItem = this.getDaybookDayItemByDate(this._todayYYYYMMDD);
    if(todayItem){
      this._today = todayItem;
      this._today$.next(this._today);
    }else{
      this.startANewDay(this._todayYYYYMMDD);
    }

    if(this._todayYYYYMMDD == this._activeDayYYYYMMDD){
      this._activeDay$.next(this._today);
    }else{
      let activeItem: DaybookDayItem = this.getDaybookDayItemByDate(this._activeDayYYYYMMDD);
      if(activeItem){
        this._activeDay = activeItem;
        this._activeDay$.next(this._activeDay);
      }else{
        console.log("daybook ****Warning: Starting a new Active day - Method disabled.");
        this.startANewDay(this._activeDayYYYYMMDD);
      }
    }
  }

  private getDaybookDayItemByDate(dateYYYYMMDD: string): DaybookDayItem {
    let foundDaybookDayItem: DaybookDayItem = this._daybookDayItems$.getValue().find((daybookDayItem: DaybookDayItem) => {
      return daybookDayItem.dateYYYYMMDD == dateYYYYMMDD;
    });
    if (foundDaybookDayItem) {
      return foundDaybookDayItem;
    } else {
      return null;
    }
  }

  private startANewDay(newDateYYYYMMDD: string): DaybookDayItem{
    console.log("***** Starting a new day: ", newDateYYYYMMDD);
    let newDay: DaybookDayItem = new DaybookDayItem(newDateYYYYMMDD);
    newDay.dayTemplateId = this.scheduleRotationService.dayTemplateForDate(newDateYYYYMMDD).id;
    return this.daybookHttpRequestService.saveDaybookDayItem(newDay);
  }

 




}
