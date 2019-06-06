import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { DayData } from '../document-definitions/day-data/day-data.class';
import { DayDataService } from '../document-definitions/day-data/day-data.service';


@Injectable({
  providedIn: 'root'
})
export class TimeViewsService {


  private _loginComplete$: Subject<boolean> = new Subject();

  login$() {
    this._fullDayDataRange = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
    this._currentDayDataRange$.next(this._fullDayDataRange);
    this.fetchDayData(this._fullDayDataRange)
    return this._loginComplete$.asObservable();
  }
  logout() {
    this._fullDayDataRange = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
    this._currentDayDataRange$.next(this._fullDayDataRange);
    this._allRangeData$.next([]);
    this._daybookSubscription.unsubscribe();
  }


  constructor(private dayDataService: DayDataService) { }

  public changeRange(startDate: moment.Moment, endDate: moment.Moment) {
    this._currentDayDataRange$.next({ startDate: startDate, endDate: endDate });
  }

  private _daybookSubscription: Subscription = new Subscription();

  private _fullDayDataRange: { startDate: moment.Moment, endDate: moment.Moment } = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
  private _allRangeData$: BehaviorSubject<DayData[]> = new BehaviorSubject([]);
  public get allRangeData(): DayData[] {
    return this._allRangeData$.getValue();
  }

  private _currentDayDataRange$: BehaviorSubject<{ startDate: moment.Moment, endDate: moment.Moment }> = new BehaviorSubject(this._fullDayDataRange);
  public get currentDayDataRange$(): Observable<{ startDate: moment.Moment, endDate: moment.Moment }> {
    return this._currentDayDataRange$.asObservable();
  }
  public get currentDayDataRange(): { startDate: moment.Moment, endDate: moment.Moment } {
    return this._currentDayDataRange$.getValue();
  }


  private fetchDayData(range: { startDate: moment.Moment, endDate: moment.Moment }) {
    this._daybookSubscription = this.dayDataService.getDaysInRangeHTTP$(range.startDate, range.endDate).subscribe((dayData: DayData[]) => {
      this._allRangeData$.next(dayData);
      this._loginComplete$.next(true);
    });

  }


  public timeViewRangeDayData(startDate: moment.Moment, endDate: moment.Moment): DayData[] {
    let fullRange = this._fullDayDataRange;
    let inRange: boolean = (startDate.isSameOrAfter(fullRange.startDate) && endDate.isSameOrBefore(fullRange.endDate));

    if (inRange) {
      let days: DayData[] = [];
      this.allRangeData.forEach((day: DayData)=>{
        if(day.dateYYYYMMDD >= startDate.format('YYYY-MM-DD') && day.dateYYYYMMDD <= endDate.format('YYYY-MM-DD')){
          days.push(day);
        }
      });
      console.log("returning DAYS", days);
      return days;
    }else{
      console.log("We are out of range boyo");

      //in this case, we need to do a new HTTP fetch
    }



    return [];
  }



}
