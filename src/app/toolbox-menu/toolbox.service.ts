import { Injectable } from '@angular/core';
import { ToolType } from './tool-type.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
// tslint:disable-next-line: max-line-length
import { TimelogEntryItem } from '../dashboard/daybook/widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { SleepEntryItem } from '../dashboard/daybook/widgets/timelog/timelog-entry-form/sleep-entry-form/sleep-entry-item.class';
import { TimelogEntryFormService } from '../dashboard/daybook/widgets/timelog/timelog-entry-form/timelog-entry-form.service';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor() { }

  private _currentTool$: BehaviorSubject<ToolType> = new BehaviorSubject(null);
  private _toolIsOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public openTool(component: ToolType) {
    if(component === ToolType.TimelogEntry){
      this.openToolNewTimelogEntry();
    }
    this._currentTool$.next(component);
    this._toolIsOpen$.next(true);
  }
  public openToolNewTimelogEntry() {
    this._currentTool$.next(ToolType.TimelogEntry);
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


  // public openTimelogEntry(timelogEntry: TimelogEntryItem) {
  //   this.timelogEntryFormService.setTimelogEntry(timelogEntry);
  //   this._currentTool$.next(ToolType.TimelogEntry);
  // }



}
