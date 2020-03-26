import { Injectable } from '@angular/core';
import { ToolType } from './tool-type.enum';
import { Observable, BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor() { }

  private _currentTool$: BehaviorSubject<ToolType> = new BehaviorSubject(null);
  private _toolIsOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public openTool(component: ToolType) {
    this._currentTool$.next(component);
    this._toolIsOpen$.next(true);
  }

  public openNewDayForm(){
    this._currentTool$.next(ToolType.START_NEW_DAY);
    this._toolIsOpen$.next(true);
  }

  public openSleepEntryForm(){
    this._currentTool$.next(ToolType.SLEEP_ENTRY);
    this._toolIsOpen$.next(true);
  }

  public openTimelogEntryForm(){
    this._currentTool$.next(ToolType.TIMELOG_ENTRY);
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


}
