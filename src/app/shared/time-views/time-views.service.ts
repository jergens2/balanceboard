import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { Day } from '../../dashboard/daybook/day/day.model';
import { DaybookService } from '../../dashboard/daybook/daybook.service';


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


  constructor(private daybookService: DaybookService) { }

  public changeRange(startDate: moment.Moment, endDate: moment.Moment) {
    this._currentDayDataRange$.next({ startDate: startDate, endDate: endDate });
  }

  private _daybookSubscription: Subscription = new Subscription();

  private _fullDayDataRange: { startDate: moment.Moment, endDate: moment.Moment } = { startDate: moment().subtract(366, "days"), endDate: moment().add(366, "days") };
  private _allRangeData$: BehaviorSubject<Day[]> = new BehaviorSubject([]);
  public get allRangeData(): Day[] {
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
    this._daybookSubscription = this.daybookService.getDaysInRangeHTTP$(range.startDate, range.endDate).subscribe((dayData: Day[]) => {
      this._allRangeData$.next(dayData);
      this._loginComplete$.next(true);
    });

  }


  public timeViewRangeDayData(startDate: moment.Moment, endDate: moment.Moment): Day[] {
    let fullRange = this._fullDayDataRange;
    let inRange: boolean = (startDate.isSameOrAfter(fullRange.startDate) && endDate.isSameOrBefore(fullRange.endDate));

    if (inRange) {
      let days: Day[] = [];
      this.allRangeData.forEach((day: Day)=>{
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
