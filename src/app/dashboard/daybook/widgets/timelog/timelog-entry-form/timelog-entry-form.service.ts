import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor() { }


  private _initialTimelogEntry: TimelogEntryItem = null;

  public setInitialTimelogEntry(timelogEntry: TimelogEntryItem){
    this._initialTimelogEntry = timelogEntry;   
  }


  public get initialTimelogEntry(): TimelogEntryItem { return this._initialTimelogEntry; }

}
