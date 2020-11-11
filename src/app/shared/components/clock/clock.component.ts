import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {

  constructor() { }

  private _clock: moment.Moment;
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
    this._clock = moment();
    this._setClockString();
    const msToNextSec: number = moment().startOf('second').add(1, 'second').diff(moment(), 'milliseconds');
    this._clockSub = timer(msToNextSec, 1).subscribe(tick => {
      this._clock = moment();
      this._setClockString()
    });

  }

  private _setClockString() {
    this._clockString = moment(this._clock).format('h:mm');
    this._clockStringSs = moment(this._clock).format('ss');
    this._clockStringAm = moment(this._clock).format('a');
    this._dateString = moment(this._clock).format('dddd, MMMM Do, YYYY');
  }

  ngOnDestroy() {
    this._clockSub.unsubscribe();
  }

}
