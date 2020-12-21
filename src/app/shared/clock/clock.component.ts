import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription, timer } from 'rxjs';
import { ClockService } from './clock.service';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {

  constructor(private clockService: ClockService) { }


  private _currentTime: moment.Moment;
  private _clockString: string;
  private _clockStringSs: string;
  private _clockStringAm: string; 
  private _dateString :string;
  private _clockSub: Subscription;

  public get clockString(): string { return this._clockString; }
  public get clockStringSs(): string { return this._clockStringSs; }
  public get clockStringAm(): string { return this._clockStringAm; }
  public get dateString(): string { return this._dateString; }

  ngOnInit(): void {
    this._currentTime = this.clockService.currentTime;
    this._setClockString();
    this._clockSub = this.clockService.everyClockSecond$.subscribe(() => {
      this._currentTime = moment(this.clockService.currentTime);
      this._setClockString()
    });

  }

  private _setClockString() {
    this._clockString = moment(this._currentTime).format('h:mm');
    this._clockStringSs = moment(this._currentTime).format('ss');
    this._clockStringAm = moment(this._currentTime).format('a');
    this._dateString = moment(this._currentTime).format('dddd, MMMM Do, YYYY');
  }

  ngOnDestroy() {
    this._clockSub.unsubscribe();
  }

}
