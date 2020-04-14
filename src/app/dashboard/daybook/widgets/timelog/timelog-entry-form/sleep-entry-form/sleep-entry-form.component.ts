import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { SleepEntryItem } from './sleep-entry-item.class';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import * as moment from 'moment';
import { Subscription, from } from 'rxjs';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from '../../../../controller/items/daybook-display-update.interface';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBed } from '@fortawesome/free-solid-svg-icons'; 

@Component({
  selector: 'app-sleep-entry-form',
  templateUrl: './sleep-entry-form.component.html',
  styleUrls: ['./sleep-entry-form.component.css']
})
export class SleepInputFormComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }


  public faBed: IconDefinition = faBed;

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
      this.daybookService.displayUpdated$.subscribe((change: DaybookDisplayUpdate) => {

          this._update();
        

      }),
      // this.daybookService.tlefController.gridBar.activeGridBarItem$.subscribe(change => this._update())
    ];
    
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
    this._sleepItem = this.daybookService.tlefController.currentlyOpenTLEFItem.getInitialSleepValue();

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
  public onFallAsleepTimeChanged(newTime: moment.Moment) {
    this._setNewFallAsleepTime = newTime;
  }
  public onClickSaveWakeupTime() {
    if (this.daybookService.activeDayController.wakeupTimeIsSet) {
      if (!this._setNewWakeupTime.isSame(this._wakeupTime)) {
        this.daybookService.activeDayController.setWakeupTime(this._setNewWakeupTime);
      }
    } else {
      this.daybookService.activeDayController.setWakeupTime(this._setNewWakeupTime);
    }
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = false;
  }

  public onClickSaveFallAsleepTime() {
    console.log("SAVING FALL ASLEEP TIME")
    if (this.daybookService.activeDayController.fallAsleepTimeIsSet) {
      if (!this._setNewFallAsleepTime.isSame(this._fallAsleepTime)) {
        this.daybookService.activeDayController.setFallAsleepTime(this._setNewFallAsleepTime);
      }
    } else {
      this.daybookService.activeDayController.setFallAsleepTime(this._setNewFallAsleepTime);
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
