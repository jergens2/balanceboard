import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import * as moment from 'moment';



@Injectable({
  providedIn: 'root'
})
export class TimeViewsService {


  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(true);


  login$() {
    console.log("Time Views Service:  What does this service do?  Do we still need it after the restructuring?  ")
    this._range = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
    this._loginComplete$.next(true);
    return this._loginComplete$.asObservable();
  }
  logout() {
    this._range = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
    this._currentRange$.next(this._range);
    this._daybookSubscription.unsubscribe();
  }


  constructor() { }

  public changeRange(startDate: moment.Moment, endDate: moment.Moment) {
    this._currentRange$.next({ startDate: startDate, endDate: endDate });
  }

  private _daybookSubscription: Subscription = new Subscription();

  private _range: { startDate: moment.Moment, endDate: moment.Moment } = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };


  
  private _currentRange$: BehaviorSubject<{ startDate: moment.Moment, endDate: moment.Moment }> = new BehaviorSubject(this._range);
  public get currentRange$(): Observable<{ startDate: moment.Moment, endDate: moment.Moment }> {
    return this._currentRange$.asObservable();
  }
  public get currentRange(): { startDate: moment.Moment, endDate: moment.Moment } {
    return this._currentRange$.getValue();
  }



  


}
