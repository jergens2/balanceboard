import { Injectable } from '@angular/core';
import { DaybookHttpRequestService } from './api/daybook-http-request.service';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DaybookDayItem } from './api/daybook-day-item.class';
import { AuthStatus } from '../../authentication/auth-status.class';
import { DayTemplatesService } from '../scheduling/day-templates/day-templates.service';
import { ServiceAuthenticates } from '../../authentication/service-authentication/service-authenticates.interface';

@Injectable({
  providedIn: 'root'
})
export class DaybookService implements ServiceAuthenticates{

  constructor(private daybookHttpRequestService: DaybookHttpRequestService, private dayTemplatesService: DayTemplatesService) { }

  private authStatus: AuthStatus;
  private _daybookDayItems$: BehaviorSubject<DaybookDayItem[]> = new BehaviorSubject([]);
  private _loginComplete$: Subject<boolean> = new Subject();
  public login$(authStatus: AuthStatus): Observable<boolean>{
    this.authStatus = authStatus;
    this._daybookDayItems$.next(this.daybookHttpRequestService.daybookDayItems);
    this.daybookHttpRequestService.daybookDayItems$.subscribe((daybookDayItems: DaybookDayItem[]) => {
      this._daybookDayItems$.next(daybookDayItems);
      this.updateTodayAndActiveDay();
    });
    this.initiateClock();
    return this._loginComplete$;
  }

  public logout() {
    this.authStatus = null;
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


  private _activeDayYYYYMMDD: string;
  private _activeDay: DaybookDayItem;
  private _activeDay$: Subject<DaybookDayItem> = new Subject();
  public get activeDay$(): Observable<DaybookDayItem> {
    return this._today$.asObservable();
  }


  private clockSubscription: Subscription = new Subscription();
  private initiateClock() {

    this.clockSubscription = timer(0, 1000).subscribe((second) => {
      this._clock = moment();
      if (this._clock.format("YYYY-MM-DD") != this._todayYYYYMMDD) {
        this._todayYYYYMMDD = moment(this._clock).format('YYYY-MM-DD');
        this._today = this.getDaybookDayItemByDate(this._todayYYYYMMDD);
        this._today$.next(this._today);
      }
    });
    this._loginComplete$.next(true);
  }

  private updateTodayAndActiveDay(){
    this._today = this.getDaybookDayItemByDate(this._todayYYYYMMDD);
    this._today$.next(this._today);
    this._activeDay = this.getDaybookDayItemByDate(this._activeDayYYYYMMDD);
    this._activeDay$.next(this._activeDay);
  }

  private getDaybookDayItemByDate(dateYYYYMMDD: string): DaybookDayItem {
    let foundDaybookDayItem: DaybookDayItem = this._daybookDayItems$.getValue().find((daybookDayItem: DaybookDayItem) => {
      return daybookDayItem.dateYYYYMMDD == dateYYYYMMDD;
    });

    if (foundDaybookDayItem) {
      console.log("The daybookDayItem already exists, Nexting()");
      this._today$.next(this._today);
      if(this._activeDayYYYYMMDD == this._todayYYYYMMDD){
        this._activeDayYYYYMMDD = Object.assign("", this._todayYYYYMMDD);
        this._activeDay = Object.assign({}, this._today);
        this._activeDay$.next(this._activeDay);
      }
      return foundDaybookDayItem;
    } else {
      console.log("the daybookDayItem did not exist, starting and saving a new one.");
      return this.startANewDay(this._todayYYYYMMDD);
    }


  }

  private startANewDay(newDateYYYYMMDD: string): DaybookDayItem{
    let newDay: DaybookDayItem = new DaybookDayItem(newDateYYYYMMDD);
    newDay.dayTemplateId = this.dayTemplatesService.dayTemplateForDate(newDateYYYYMMDD).id;
    console.log("id is added;", newDay);
    return this.daybookHttpRequestService.saveDaybookDayItem(newDay);
  }

 




}
