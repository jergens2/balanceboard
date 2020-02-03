import { Injectable } from '@angular/core';
import { ToolComponents } from './tool-components.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
// tslint:disable-next-line: max-line-length
import { TimelogEntryItem } from '../../dashboard/daybook/widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';


@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }

  private _timelogEntryStorage$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
  private _currentTool$: BehaviorSubject<{ component: ToolComponents, data: any }> = new BehaviorSubject(null);

  private _toolIsOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public openTool(component: ToolComponents, data?: any) {
    this._currentTool$.next({ component: component, data: data });
    this._toolIsOpen$.next(true);
  }
  public openToolNewTimelogEntry(){
    this._currentTool$.next({ component: ToolComponents.TimelogEntry, data: null });
    this._toolIsOpen$.next(true);
  }

  public closeTool(component?: ToolComponents) {
    if (component == this.currentTool.component) {
      this._currentTool$.next(null);
    } else {
      this._currentTool$.next(null);
    }
    this._toolIsOpen$.next(false);
  }


  public get toolIsOpen(): boolean { return this._toolIsOpen$.getValue(); }
  public get toolIsOpen$(): Observable<boolean> { return this._toolIsOpen$.asObservable(); }

  public get currentTool$(): Observable<{ component: ToolComponents, data: any }> {
    return this._currentTool$.asObservable();
  }
  public get currentTool(): { component: ToolComponents, data: any } {
    return this._currentTool$.getValue();
  }


  public setTimelogEntry(timelogEntry: TimelogEntryItem) {
    this._timelogEntryStorage$.next(timelogEntry);
  }

  public get timelogEntryStorage$(): Observable<TimelogEntryItem> { return this._timelogEntryStorage$.asObservable(); }
  public get timelogEntryStorage(): TimelogEntryItem {
    const value = this._timelogEntryStorage$.getValue();
    this._timelogEntryStorage$.next(null);
    return value;
  }
}
