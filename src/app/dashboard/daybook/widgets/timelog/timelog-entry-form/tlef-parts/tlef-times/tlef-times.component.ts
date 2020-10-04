import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';
import { TLEFFormCase } from '../../tlef-form-case.enum';

@Component({
  selector: 'app-tlef-times',
  templateUrl: './tlef-times.component.html',
  styleUrls: ['./tlef-times.component.css']
})
export class TlefTimesComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }


  private _subs: Subscription[] = [];
  private _entryItem: TimelogEntryItem;
  private _entryStartTime: moment.Moment;
  private _entryEndTime: moment.Moment;

  private _originalStart: moment.Moment;
  private _originalEnd: moment.Moment;

  private _startTimeInput: TimeInput;
  private _endTimeInput: TimeInput;

  private _isEditing: boolean = false;
  private _inputSubs: Subscription[] = [];

  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get durationString(): string { return this.entryItem.durationString; }
  public get isEditing(): boolean { return this._isEditing; }

  public get startTimeInput(): TimeInput { return this._startTimeInput; }
  public get endTimeInput(): TimeInput { return this._endTimeInput; }

  ngOnInit() {
    // console.log("Opening component")
    this._reload();
    this._subs = [
      this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe(s => this._reload()),

    ];
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [];
  }

  private _reload() {
    if (this.daybookService.tlefController.currentlyOpenTLEFItem) {
      const currentItem = this.daybookService.tlefController.currentlyOpenTLEFItem;
      console.log("RELOADING tlef times: from " + currentItem)
      if (this.isEditing) {
        if (this._entryStartTime && this._entryEndTime) {
          if (!this._entryStartTime.isSame(currentItem.actualStartTime) && !this._entryEndTime.isSame(currentItem.actualEndTime)) {
            if (currentItem.formCase !== TLEFFormCase.NEW_CURRENT) {
              this._isEditing = false;
            }

          }
        }
      }
      if (this.daybookService.tlefController.currentlyOpenTLEFItem.isTLEItem) {
        if (!this._entryItem) {
          this._entryItem = currentItem.getInitialTLEValue();
        }
      }
      if (!this._entryStartTime) {
        this._entryStartTime = moment(currentItem.actualStartTime);
      }
      if (!this._entryEndTime) {
        this._entryEndTime = moment(currentItem.actualEndTime);
      }
      this._startTimeInput = currentItem.timeLimiter.startTimeInput;
      this._startTimeInput.showDate = false;
      this._endTimeInput = currentItem.timeLimiter.endTimeInput;
      this._endTimeInput.showDate = false;
      if (!this._originalStart && !this._originalEnd) {
        this._originalStart = moment(currentItem.actualStartTime);
        this._originalEnd = moment(currentItem.actualEndTime);
      }




      this._updateInputSubs();
      if (currentItem.formCase === TLEFFormCase.NEW_CURRENT) {
        this._entryItem.setEndTime(currentItem.actualEndTime);
        this._entryEndTime = moment(currentItem.actualEndTime);
        this._endTimeInput.changeTime(this._entryEndTime);
      }
    } else {
      this._entryItem = null;
      this._entryStartTime = moment();
      this._entryEndTime = moment();
    }

  }


  private _updateInputSubs() {
    this._inputSubs.forEach(s => s.unsubscribe());
    this._inputSubs = [
      this._startTimeInput.timeValue$.subscribe(val => {
        this._entryItem.setStartTime(val);
        this._entryStartTime = moment(val);
        this._checkForChanges();
      }),
      this._endTimeInput.timeValue$.subscribe(val => {
        this._entryItem.setEndTime(val);
        this._entryEndTime = moment(val);
        this._checkForChanges();

      })
    ];

  }

  private _checkForChanges() {
    console.log("**** TLEF: Checking for changes to times.")
    if (!(this._entryItem.startTime.isSame(this._originalStart) && this._entryItem.endTime.isSame(this._originalEnd))) {
      console.log("**** TLEF: changes were made!!!")
      this.daybookService.tlefController.makeChangesToTLETimes(this._entryStartTime, this._entryEndTime);
    }
  }

  public get entryStartTime(): string {
    if (this._entryStartTime) {
      return this._entryStartTime.format('h:mm a');
    }
    return 'Error with start time';
  }
  public get entryEndTime(): string {
    if (this._entryEndTime) {
      return this._entryEndTime.format('h:mm a');
    }
    return 'Error with start time';
  }


  public onClickEditTimes() {
    this._isEditing = true;
  }

}
