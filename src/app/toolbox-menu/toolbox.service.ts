import { Injectable } from '@angular/core';
import { ToolType } from './tool-type.enum';
import { Observable, BehaviorSubject, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  constructor() { }

  private _toolQueue$: BehaviorSubject<ToolType[]> = new BehaviorSubject([]);
  private _onFormClosed$: Subject<boolean> = new Subject();

  public openTool(tool: ToolType) {
    if (this.currentToolQueue.length > 0) {
      if (this.currentToolQueue.indexOf(tool) > -1) {
        const remainingItems = [];
        this.currentToolQueue.forEach(item => {
          if(item !== tool){
            remainingItems.push(item);
          }
        });
        const newQueue = [tool].concat(remainingItems);
        this._toolQueue$.next(newQueue)
      } else {
        const newQueue = [tool].concat(this.currentToolQueue);
        this._toolQueue$.next(newQueue);
      }

    } else {
      console.log("current length is 0")
      this._toolQueue$.next([tool]);
    }
  }
  public openTools(tools: ToolType[]) {
    this._toolQueue$.next(tools);
  }

  public openNewDayForm() {

    this._toolQueue$.next([ToolType.START_NEW_DAY]);


  }

  public openSleepEntryForm() { this.openTool(ToolType.SLEEP_ENTRY); }
  public openTimelogEntryForm() { this.openTool(ToolType.TIMELOG_ENTRY); }

  public get onFormClosed$(): Observable<boolean> { return this._onFormClosed$.asObservable(); }

  public closeTool() {
    const currentToolQueue = this.currentToolQueue;
    if (currentToolQueue.length <= 1) {
      this._toolQueue$.next([]);
      this._onFormClosed$.next(true);
    } else if (currentToolQueue.length > 1) {
      const newQueue = [];
      for (let i = 1; i < currentToolQueue.length; i++) {
        newQueue.push(currentToolQueue[i]);
      }
      this._toolQueue$.next(newQueue);
    }
  }

  // public get toolIsOpen$(): Observable<boolean> {
  //   const isOpen$: Subject<boolean> = new Subject();
  //   this._toolQueue$.subscribe((toolQueue) => {
  //     console.log("Subscribed")
  //     if (toolQueue.length > 0) {
  //       isOpen$.next(true);
  //     } else {
  //       isOpen$.next(false);
  //     }
  //   });
  //   return isOpen$;
  // }

  public get currentToolQueue$(): Observable<ToolType[]> { return this._toolQueue$.asObservable(); }
  public get currentToolQueue(): ToolType[] { return this._toolQueue$.getValue(); }
  public get queueCount(): number { return this.currentToolQueue.length; }
  public get toolIsOpen(): boolean { return this.queueCount > 0; }

  public get currentTool(): ToolType {
    if (this.toolIsOpen) {
      return this.currentToolQueue[0];
    } else {
      return null;
    }
  }

}
