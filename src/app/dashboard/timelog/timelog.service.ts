import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeMark } from './time-mark.model';
import { CategorizedActivity } from './categorized-activity.model';

@Injectable({
  providedIn: 'root'
})
export class TimelogService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  private _timeMarksSubject: BehaviorSubject<TimeMark[]> = new BehaviorSubject<TimeMark[]>(null);
  private _activitiesSubject: BehaviorSubject<CategorizedActivity> = new BehaviorSubject<CategorizedActivity>(null);

  get timeMarks(): Observable<TimeMark[]>{
    return this._timeMarksSubject.asObservable();
  }
  // get activities(): Observable<CategorizedActivity>{
  //   return this._activitiesSubject.asObservable();
  // }

  



}
