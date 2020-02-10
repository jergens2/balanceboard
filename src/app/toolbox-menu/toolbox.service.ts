import { Injectable } from '@angular/core';
import { ToolType } from './tool-type.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
// tslint:disable-next-line: max-line-length
import { TimelogEntryItem } from '../dashboard/daybook/widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { SleepEntryItem } from '../dashboard/daybook/widgets/timelog/sleep-entry-form/sleep-entry-item.class';
import { TimelogEntryFormService } from '../dashboard/daybook/widgets/timelog/timelog-entry-form/timelog-entry-form.service';


@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor(private timelogEntryFormService: TimelogEntryFormService) { }

  // private _timelogEntryStorage$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
  private _sleepInputStorage$: BehaviorSubject<SleepEntryItem> = new BehaviorSubject(null);
  private _currentTool$: BehaviorSubject<ToolType> = new BehaviorSubject(null);

  private _toolIsOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public openTool(component: ToolType) {
    this._currentTool$.next(component);
    this._toolIsOpen$.next(true);
  }
  public openToolNewTimelogEntry() {
    this._currentTool$.next(ToolType.TimelogEntry);
    this._toolIsOpen$.next(true);
  }

  public openToolSleepInput(sleepItem: SleepEntryItem) {
    this._sleepInputStorage$.next(sleepItem);
    this._currentTool$.next(ToolType.SleepInput);
    this._toolIsOpen$.next(true);
  }

  public closeTool() {
    this._currentTool$.next(null);
    this._toolIsOpen$.next(false);
  }


  public get toolIsOpen(): boolean { return this._toolIsOpen$.getValue(); }
  public get toolIsOpen$(): Observable<boolean> { return this._toolIsOpen$.asObservable(); }

  public get currentTool$(): Observable<ToolType> { return this._currentTool$.asObservable(); }
  public get currentTool(): ToolType { return this._currentTool$.getValue(); }


  public openTimelogEntry(timelogEntry: TimelogEntryItem) {
    this.timelogEntryFormService.setTimelogEntry(timelogEntry);
    this._currentTool$.next(ToolType.TimelogEntry);
  }


  // public get timelogEntryStorage$(): Observable<TimelogEntryItem> { return this._timelogEntryStorage$.asObservable(); }
  // public get timelogEntryStorage(): TimelogEntryItem {
  //   const value = this._timelogEntryStorage$.getValue();
  //   this._timelogEntryStorage$.next(null);
  //   return value;
  // }

  public get sleepInputStorage$(): Observable<SleepEntryItem> { return this._sleepInputStorage$.asObservable(); }
  public get sleepInputStorage(): SleepEntryItem { 
    const value = this._sleepInputStorage$.getValue();
    this._sleepInputStorage$.next(null);
    return value;
  }
}
