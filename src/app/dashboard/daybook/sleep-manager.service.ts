import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SleepManagerService {

  constructor() { }

  private _clock: moment.Moment;
  public initiate(){
    this._clock = moment();
  }
}
