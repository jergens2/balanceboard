import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { SleepEntryItem } from './sleep-entry-item.class';
import { TimelogEntryFormService } from '../timelog-entry-form.service';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-sleep-entry-form',
  templateUrl: './sleep-entry-form.component.html',
  styleUrls: ['./sleep-entry-form.component.css']
})
export class SleepInputFormComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService, private tlefService: TimelogEntryFormService) { }

  public get sleepItem(): SleepEntryItem { return this._sleepItem; }

  public get isWakeupTime(): boolean { return this.sleepItem.endTime.isSame(this._wakeupTime); }
  public get isFallAsleepTime(): boolean { return this.sleepItem.startTime.isSame(this._fallAsleepTime); }

  public get wakeupTime(): moment.Moment { return this._wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }

  public get sleepDuration(): string { 
    return DurationString.calculateDurationString(this.sleepItem.startTime, this.sleepItem.endTime);
  }

  private _dbSubs: Subscription[] = [];

  ngOnInit() {
    this._update();
    // this.tlefService.formChanged$.subscribe(change => this._update());
    this._dbSubs = [
      this.daybookService.displayUpdated$.subscribe(change => this._update()),
      this.daybookService.activeGridBarItem$.subscribe(change => this._update())
    ]

  }

  ngOnDestroy() {
    this._sleepItem = null;
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._wakeupTime = null;
    this._fallAsleepTime = null;
  }

  private _sleepItem: SleepEntryItem;
  private _wakeupTime: moment.Moment;
  private _fallAsleepTime: moment.Moment;

  private _setNewWakeupTime: moment.Moment;
  private _setNewFallAsleepTime: moment.Moment;

  private _isEditingWakeupTime: boolean = false;
  private _isEditingFallAsleepTime: boolean = false;

  private _update() {

    this._sleepItem = this.tlefService.openedSleepEntry;
    
    this._wakeupTime = moment(this.daybookService.wakeupTime);
    this._fallAsleepTime = moment(this.daybookService.fallAsleepTime);

    this._setNewWakeupTime = moment(this._wakeupTime);
    this._setNewFallAsleepTime = moment(this._fallAsleepTime);
  }



  public onClickEditWakeupTime() {
    this._isEditingFallAsleepTime = false;
    this._isEditingWakeupTime = true;
  }
  public onClickEditFallAsleepTime() { 
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = true;
  }
  public get isEditingWakeupTime(): boolean { return this._isEditingWakeupTime; }
  public get isEditingFallAsleepTime(): boolean { return this._isEditingFallAsleepTime; }

  public onWakeupTimeChanged(newTime: moment.Moment) {
    this._setNewWakeupTime = newTime;
  }
  public onClickSaveWakeupTime() {
    if (!this._setNewWakeupTime.isSame(this._wakeupTime)) {
      this.daybookService.activeDayController.setWakeupTime(this._setNewWakeupTime);
    }
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = false;
  }

  public onClickSaveFallAsleepTime() {
    if (!this._setNewWakeupTime.isSame(this._wakeupTime)) {
      this.daybookService.activeDayController.setFallAsleepTime(this._setNewWakeupTime);
    }
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = false;
  }

  public get previousDay(): string {
    return '(' + this.sleepItem.startTime.format('MMM Do') + ')';
  }

  public get followingDay(): string {
    return '(' + this.sleepItem.endTime.format('MMM Do') + ')';
  }

}
