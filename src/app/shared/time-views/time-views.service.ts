import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class TimeViewsService {

  constructor() { }

  public changeRange(startDate: moment.Moment, endDate: moment.Moment){
    this._range.next({startDate: startDate, endDate:endDate});
  }

  private _range: Subject<{startDate:moment.Moment, endDate: moment.Moment}> = new Subject(); 
  public get rangeChanged$(): Observable<{startDate:moment.Moment, endDate: moment.Moment}> {
    return this._range.asObservable();
  }
}
