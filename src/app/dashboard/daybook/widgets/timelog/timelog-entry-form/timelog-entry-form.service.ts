import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor() { }


  private _activeFormEntry$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);

  public setTimelogEntry(timelogEntry: TimelogEntryItem){
    this._activeFormEntry$.next(timelogEntry);   
  }
  public getInitialTimelogEntry(): TimelogEntryItem { 
    const value = this._activeFormEntry$.getValue();
    this._activeFormEntry$.next(null);
    return value; 
  }
  public get activeFormEntry$(): Observable<TimelogEntryItem> { 
    return this._activeFormEntry$.asObservable();
  }



}
