import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { Clock } from './clock.class';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ClockService {

  private _clock: Clock;

  constructor() {
    this._clock = new Clock();
    /** The following can be used for testing purposes. */
    // let setTime: moment.Moment = moment().add(1, 'hours');
    // timer(0, 3000).subscribe(()=>{
    //   setTime = moment(setTime).add(1, 'hours');
    //   this._clock.specifyTime(setTime);
    // })
  }

  public get clock(): Clock { return this._clock; }
  public get currentTime(): moment.Moment { return this._clock.currentTime; }
  public get currentTime$(): Observable<moment.Moment> { return this._clock.currentTime$; }

  public get everyClockSecond$(): Observable<moment.Moment> { return this._clock.everyClockSecond$; }
  public get everyClockMinute$(): Observable<moment.Moment> { return this._clock.everyClockMinute$; }
  public get everyClockHour$(): Observable<moment.Moment> { return this._clock.everyClockHour$; }
  public get everyClockDay$(): Observable<moment.Moment> { return this._clock.everyClockDay$; }

}

