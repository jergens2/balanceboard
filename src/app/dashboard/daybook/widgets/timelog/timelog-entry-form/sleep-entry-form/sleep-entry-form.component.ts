import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { SleepEntryItem } from './sleep-entry-item.class';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import * as moment from 'moment';
import { Subscription, from } from 'rxjs';
import { DurationString } from '../../../../../../shared/time-utilities/duration-string.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBed } from '@fortawesome/free-solid-svg-icons';
import { TimeInput } from '../../../../../../shared/components/time-input/time-input.class';

@Component({
  selector: 'app-sleep-entry-form',
  templateUrl: './sleep-entry-form.component.html',
  styleUrls: ['./sleep-entry-form.component.css']
})
export class SleepInputFormComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }

  private _sleepItem: SleepEntryItem;
  private _wakeupTime: moment.Moment;
  private _fallAsleepTime: moment.Moment;

  private _setNewWakeupTime: moment.Moment;
  private _setNewFallAsleepTime: moment.Moment;

  private _isEditingWakeupTime: boolean = false;
  private _isEditingFallAsleepTime: boolean = false;

  private _startTimeInput: TimeInput;
  private _endTimeInput: TimeInput;


  public faBed: IconDefinition = faBed;

  public get sleepItem(): SleepEntryItem { return this._sleepItem; }
  public get isWakeupTime(): boolean { return this.sleepItem.endTime.isSame(this._wakeupTime); }
  public get isFallAsleepTime(): boolean { return this.sleepItem.startTime.isSame(this._fallAsleepTime); }
  public get wakeupTime(): moment.Moment { return this._wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }
  public get isEditingFallAsleepTime(): boolean { return this._isEditingFallAsleepTime; }
  public get isEditingWakeupTime(): boolean { return this._isEditingWakeupTime; }
  public get startTimeInput(): TimeInput { return this._startTimeInput; }
  public get endTimeInput(): TimeInput { return this._endTimeInput; }

  public get sleepDuration(): string {
    return DurationString.calculateDurationString(this.sleepItem.startTime, this.sleepItem.endTime);
  }

  private _dbSubs: Subscription[] = [];

  ngOnInit() {
    this._update();
    // this.tlefService.formChanged$.subscribe(change => this._update());
    this._dbSubs = [
      // this.daybookService.displayUpdated$.subscribe((change: DaybookDisplayUpdate) => {
      //   if(change){
      //     this._update();
      //   }
      // }),
      this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((update) => {
        if (update) {
          if (update.item.isSleepItem) {
            this._update();
          }
        }
      })
      // this.daybookService.tlefController.gridBar.activeGridBarItem$.subscribe(change => this._update())
    ];
  }

  ngOnDestroy() {
    this._sleepItem = null;
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._wakeupTime = null;
    this._fallAsleepTime = null;
  }



  private _update() {
    if (this.daybookService.tlefController.formIsOpen) {
      this._sleepItem = this.daybookService.tlefController.currentlyOpenTLEFItem.item.getInitialSleepValue();

      const index = this.daybookService.tlefController.currentlyOpenTLEFItem.item.itemIndex;
      const sleepItem = this.daybookService.displayManager.displayItems.find(item => item.itemIndex === index);
      console.log("Sleep ITEM: " + sleepItem.actualStartTime.format('hh:mm a') + " to " + sleepItem.actualEndTime.format('hh:mm a'))
      console.log(sleepItem.timeLimiter.toString());

      this._wakeupTime = moment(this.daybookService.displayManager.wakeupTime);
      this._fallAsleepTime = moment(this.daybookService.displayManager.fallAsleepTime);

      this._setNewWakeupTime = moment(this._wakeupTime);
      this._setNewFallAsleepTime = moment(this._fallAsleepTime);
    }

  }



  public onClickEditWakeupTime() {
    this._isEditingFallAsleepTime = false;
    this._isEditingWakeupTime = true;
  }
  public onClickEditFallAsleepTime() {
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = true;
  }


  public onWakeupTimeChanged(newTime: moment.Moment) {
    this._setNewWakeupTime = newTime;
  }
  public onFallAsleepTimeChanged(newTime: moment.Moment) {
    this._setNewFallAsleepTime = newTime;
  }
  public onClickSaveWakeupTime() {
    // if (this.daybookService.activeDayController.wakeupTimeIsSet) {
    //   if (!this._setNewWakeupTime.isSame(this._wakeupTime)) {
    //     this.daybookService.activeDayController.setWakeupTime(this._setNewWakeupTime);
    //   }
    // } else {
    //   this.daybookService.activeDayController.setWakeupTime(this._setNewWakeupTime);
    // }
    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = false;
  }

  public onClickSaveFallAsleepTime() {
    // console.log("SAVING FALL ASLEEP TIME")
    // if (this.daybookService.activeDayController.fallAsleepTimeIsSet) {
    //   if (!this._setNewFallAsleepTime.isSame(this._fallAsleepTime)) {
    //     this.daybookService.activeDayController.setFallAsleepTime(this._setNewFallAsleepTime);
    //   }
    // } else {
    //   this.daybookService.activeDayController.setFallAsleepTime(this._setNewFallAsleepTime);
    // }

    this._isEditingWakeupTime = false;
    this._isEditingFallAsleepTime = false;
  }

  public get previousDay(): string {
    return '(' + this.sleepItem.startTime.format('MMM Do') + ')';
  }

  public get followingDay(): string {
    return '(' + this.sleepItem.endTime.format('MMM Do') + ')';
  }


  public onClickFallAsleepTime() {
    this._isEditingFallAsleepTime = true;
  }
  public onCloseFallAsleepTime() {
    this._isEditingFallAsleepTime = false;
  }

}
