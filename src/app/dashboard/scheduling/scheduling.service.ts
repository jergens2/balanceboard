import { Injectable } from '@angular/core';
import { ScheduleRotation } from './schedule-rotations/schedule-rotation.model';
import { Observable, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { DayTemplate } from './day-templates/day-template.model';
import { ScheduleItem } from './schedule-planner/schedule-item.class';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {

  private _rotation$: BehaviorSubject<ScheduleRotation> = new BehaviorSubject(null);

  public get rotation$(): Observable<ScheduleRotation> {
    return this._rotation$.asObservable();
  } 

  public get rotation(): ScheduleRotation {
    return this._rotation$.getValue();
  }

  public getDayTemplateForDate(date: moment.Moment): DayTemplate{
    /*
      for any provided date, return whatever the designated Day Template is for that date.
    */
    return null;
  }

  public get scheduleItems$(): Observable<ScheduleItem[]> {
    return null;
  }

  constructor() { }
}
