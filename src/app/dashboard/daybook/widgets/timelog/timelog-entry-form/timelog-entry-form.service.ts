import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import * as moment from 'moment';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private toolBoxService: ToolboxService, private daybookControllerService: DaybookControllerService) { }

  private _isInitiated: boolean = false;
  private _toolIsOpenSub: Subscription = new Subscription();

  private _formChanged$: BehaviorSubject<TLEFFormCase> = new BehaviorSubject(null);

  private _openedTimelogEntry: TimelogEntryItem;
  private _openedSleepEntry: SleepEntryItem;

  public get openedTimelogEntry(): TimelogEntryItem { return this._openedTimelogEntry; }
  public get openedSleepEntry(): SleepEntryItem { return this._openedSleepEntry; }
  public get formCase(): TLEFFormCase { return this._formChanged$.getValue(); }
  public get formChanged$(): Observable<TLEFFormCase> { return this._formChanged$.asObservable(); }
  public get toolIsOpen$(): Observable<boolean> { return this.toolBoxService.toolIsOpen$; }

  public openNewCurrentTimelogEntry(){
    this._initiate();
    const formCase = TLEFFormCase.NEW_CURRENT;
    this._openedTimelogEntry = this.daybookControllerService.todayController.getNewCurrentTLE();
    this.toolBoxService.openTimelogEntryForm();
    this._formChanged$.next(formCase);
    this._openedSleepEntry = null;
  }

  public openTimelogEntry(timelogEntry: TimelogEntryItem){
    this._initiate();
    const formCase: TLEFFormCase = this._determineCase(timelogEntry);
    this._openedTimelogEntry = timelogEntry;
    this.toolBoxService.openTimelogEntryForm();
    this._formChanged$.next(formCase);
    this._openedSleepEntry = null;
  }
  public openSleepEntry(sleepEntry: SleepEntryItem){
    this._initiate();
    this._openedSleepEntry = sleepEntry;
    this.toolBoxService.openSleepEntryForm();
    this._formChanged$.next(TLEFFormCase.SLEEP);
    this._openedTimelogEntry = null;
  }

  private _initiate(){
    if(!this._isInitiated){
      this._isInitiated = true;
      this._toolIsOpenSub.unsubscribe();
      this._toolIsOpenSub = this.toolBoxService.toolIsOpen$.subscribe((toolIsOpen: boolean)=>{
        if(toolIsOpen === false){
          this._closeForm();
        }
      });
    }
  }

  private _closeForm(){
    this._openedSleepEntry = null;
    this._openedTimelogEntry = null;
    this._formChanged$.next(null);
    this._isInitiated = false;
    this._toolIsOpenSub.unsubscribe();
  }

  private _determineCase(entry: TimelogEntryItem): TLEFFormCase {
    let formCase: TLEFFormCase;
    const startTime: moment.Moment = entry.startTime;
    const endTime: moment.Moment = entry.endTime;
    const now: moment.Moment = moment(this.daybookControllerService.clock).startOf('minute');
    const isPrevious: boolean = endTime.isBefore(now);
    const isFuture: boolean = startTime.isAfter(now);
    if (isPrevious) {
      if (entry.isSavedEntry) {
        formCase = TLEFFormCase.EXISTING_PREVIOUS;
      } else {
        formCase = TLEFFormCase.NEW_PREVIOUS;
      }
    } else if (isFuture) {
      if (entry.isSavedEntry) {
        formCase = TLEFFormCase.EXISTING_FUTURE;
      } else {
        formCase = TLEFFormCase.NEW_FUTURE;
      }
    } else {
      if (now.isSame(startTime)) {
        if(entry.isSavedEntry){
          formCase = TLEFFormCase.EXISTING_CURRENT;
        }else{
          formCase = TLEFFormCase.NEW_CURRENT_FUTURE;
        }
      } else if (now.isSame(endTime)) {
        if(entry.isSavedEntry){
          formCase = TLEFFormCase.EXISTING_PREVIOUS
        }else{
          formCase = TLEFFormCase.NEW_CURRENT;
        }
      }else{
        if(entry.isSavedEntry){
          formCase = TLEFFormCase.EXISTING_CURRENT;
        }else{
          formCase = TLEFFormCase.NEW_CURRENT;
        }
      }
    }
    console.log("CASE IS: " + formCase)
    return formCase;
  }



}
