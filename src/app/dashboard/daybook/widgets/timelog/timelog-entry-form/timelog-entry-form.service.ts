import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import * as moment from 'moment';
import { SleepEntryItem } from './sleep-entry-form/sleep-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DisplayGridBarItem } from './daybook-grid-items-bar/display-grid-bar-item.class';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { DaybookController } from '../../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../../controller/items/daybook-availability-type.enum';
import { DaybookTimePosition } from '../../../daybook-time-position-form/daybook-time-position.enum';
import { TLEFFooterMode } from './tlef-footer-mode.enum';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private toolBoxService: ToolboxService) { }

  private _isInitiated: boolean = false;
  private _toolIsOpenSub: Subscription = new Subscription();
  // private _daybookSub: Subscription = new Subscription();

  private _formChanged$: BehaviorSubject<TLEFFormCase> = new BehaviorSubject(null);
  private _footerMode$: BehaviorSubject<TLEFFooterMode> = new BehaviorSubject(null);

  private _openedTimelogEntry: TimelogEntryItem;
  private _openedSleepEntry: SleepEntryItem;

  private _showDeleteButton: boolean = false;
  private _showSaveButton: boolean = false;
  private _showCloseButton: boolean = false;
  

  public get openedTimelogEntry(): TimelogEntryItem { return this._openedTimelogEntry; }
  public get openedSleepEntry(): SleepEntryItem { return this._openedSleepEntry; }
  public get formCase(): TLEFFormCase { return this._formChanged$.getValue(); }

  public get formChanged$(): Observable<TLEFFormCase> { return this._formChanged$.asObservable(); }
  public get toolIsOpen$(): Observable<boolean> { return this.toolBoxService.toolIsOpen$; }
  public get toolIsOpen(): boolean { return this.toolBoxService.toolIsOpen; }

  public get footerMode(): TLEFFooterMode { return this._footerMode$.getValue(); }

  public get showDeleteButton(): boolean { return this._showDeleteButton; }
  public get showSaveButton(): boolean { return this._showSaveButton; }
  public get showCloseButton(): boolean { return this._showCloseButton; }

  // public get gridBarItems(): DisplayGridBarItem[] { return this.daybookService.gridBarItems; }
  // public setFooterMode(mode: TLEFFooterMode){
  //   this._footerMode$.next(mode);
  // }

  public openStartNewDay() {
    this._closeForm();
    this.toolBoxService.openNewDayForm();
  }

  public openTimelogEntry(timelogEntry: TimelogEntryItem, currentTimePosition = DaybookTimePosition.NORMAL) {
    this._initiate();
    const formCase: TLEFFormCase = this._determineCase(timelogEntry);
    this._openedTimelogEntry = timelogEntry;

    if (currentTimePosition === DaybookTimePosition.NEW_DAY ||
      currentTimePosition === DaybookTimePosition.APPROACHING_SLEEP ||
      currentTimePosition === DaybookTimePosition.UNCLEAR) {
      this.toolBoxService.openNewDayForm();
    } else {
      this.toolBoxService.tlefServiceOpenTimelogEntryForm();
    }
    this._setFooterMode(formCase);
    this._formChanged$.next(formCase);
    this._openedSleepEntry = null;

  }
  public openSleepEntry(sleepEntry: SleepEntryItem, currentTimePosition = DaybookTimePosition.NORMAL) {
    const formCase = TLEFFormCase.SLEEP;
    this._openedSleepEntry = sleepEntry;
    if (currentTimePosition === DaybookTimePosition.NEW_DAY ||
      currentTimePosition === DaybookTimePosition.APPROACHING_SLEEP ||
      currentTimePosition === DaybookTimePosition.UNCLEAR) {
      this.toolBoxService.openNewDayForm();
    } else {
      this.toolBoxService.openSleepEntryForm();
    }
    this._formChanged$.next(formCase);
    this._openedTimelogEntry = null;
  }

  private _initiate() {
    if (!this._isInitiated) {
      this._isInitiated = true;
      this._toolIsOpenSub.unsubscribe();
      this._toolIsOpenSub = this.toolBoxService.toolIsOpen$.subscribe((toolIsOpen: boolean) => {
        if (toolIsOpen === false) {
          this._closeForm();
        }
      });

    }
  }

  // public changesMade(){
  //   this._footerMode$.next(TLEFFooterMode.MODIFY_EXISTING);
  // }

  private _setFooterMode(formCase:TLEFFormCase){
    const isNew = (formCase === TLEFFormCase.NEW_CURRENT || formCase === TLEFFormCase.NEW_CURRENT_FUTURE || formCase === TLEFFormCase.NEW_FUTURE || formCase === TLEFFormCase.NEW_PREVIOUS);
    if(isNew){
      this._showDeleteButton = false;
      this._footerMode$.next(TLEFFooterMode.NEW);
    }else{
      this._showDeleteButton = true;
      this._footerMode$.next(TLEFFooterMode.VIEW_EXISTING);
    }
  }

  private _closeForm() {
    // this.gridBarItems.forEach(item => item.isActive = false);
    // this._openedSleepEntry = null;
    // this._openedTimelogEntry = null;
    // this._formChanged$.next(null);
    // this._isInitiated = false;
    // this._toolIsOpenSub.unsubscribe();
    // this._daybookSub.unsubscribe();
  }

  private _determineCase(entry: TimelogEntryItem): TLEFFormCase {
    let formCase: TLEFFormCase;
    const startTime: moment.Moment = entry.startTime;
    const endTime: moment.Moment = entry.endTime;
    const now: moment.Moment = moment().startOf('minute');
    const isPrevious: boolean = endTime.isBefore(now);
    const isFuture: boolean = startTime.isAfter(now);
    if (isPrevious) {
      if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_PREVIOUS; }
      else { formCase = TLEFFormCase.NEW_PREVIOUS; }
    } else if (isFuture) {
      if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_FUTURE; }
      else { formCase = TLEFFormCase.NEW_FUTURE; }
    } else {
      if (entry.isSavedEntry) {
        formCase = TLEFFormCase.EXISTING_CURRENT;
      } else if (!entry.isSavedEntry) {
        if (now.isSame(startTime)) { formCase = TLEFFormCase.NEW_CURRENT_FUTURE; }
        else if (now.isAfter(startTime)) { formCase = TLEFFormCase.NEW_CURRENT; }
      }
    }
    // console.log("CASE IS: " + formCase)
    return formCase;
  }


}
