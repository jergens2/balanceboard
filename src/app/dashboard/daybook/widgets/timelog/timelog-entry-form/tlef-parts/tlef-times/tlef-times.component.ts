import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';
import { TLEFFormCase } from '../../tlef-form-case.enum';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';

@Component({
  selector: 'app-tlef-times',
  templateUrl: './tlef-times.component.html',
  styleUrls: ['./tlef-times.component.css']
})
export class TlefTimesComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }


  private _subs: Subscription[] = [];

  private _durationString: string;

  private _currentStart: moment.Moment;
  private _currentEnd: moment.Moment;

  private _startTimeInput: TimeInput;
  private _endTimeInput: TimeInput;

  private _isEditing: boolean = false;
  private _inputSubs: Subscription[] = [];

  public get durationString(): string { return this._durationString; }
  public get isEditing(): boolean { return this._isEditing; }

  public get startTimeInput(): TimeInput { return this._startTimeInput; }
  public get endTimeInput(): TimeInput { return this._endTimeInput; }

  ngOnInit() {
    this._reload();
    this._subs = [this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe(s => this._reload()),];
  }

  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe());
    this._inputSubs.forEach(s => s.unsubscribe());
  }

  public onClickEditTimes() { this._isEditing = true; }
  public get entryStartTime(): string {
    if (this._currentStart) {
      return this._currentStart.format('h:mm a');
    }
    return 'Error with start time';
  }
  public get entryEndTime(): string {
    if (this._currentEnd) {
      return this._currentEnd.format('h:mm a');
    }
    return 'Error with start time';
  }



  private _reload() {
    this._inputSubs.forEach(s => s.unsubscribe());
    if (this.daybookService.tlefController.currentlyOpenTLEFItem) {
      const isSameItem = this.daybookService.tlefController.currentlyOpenTLEFItem.isSameItem;
      const currentItem = this.daybookService.tlefController.currentlyOpenTLEFItem.item;
      this._startTimeInput = currentItem.timeLimiter.startTimeInput;
      this._startTimeInput.changeTime(currentItem.actualStartTime);
      this._startTimeInput.showDate = false;
      this._endTimeInput = currentItem.timeLimiter.endTimeInput;
      this._endTimeInput.changeTime(currentItem.actualEndTime);
      this._endTimeInput.showDate = false;
      if (isSameItem) {
        if (currentItem.formCase === TLEFFormCase.NEW_CURRENT) {
          this._currentEnd = moment(currentItem.actualEndTime);
          this._endTimeInput.changeTime(this._currentEnd);
          this.daybookService.tlefController.makeChangesToTLETimes(this._currentStart, this._currentEnd);
        }
      } else {
        this._isEditing = false;
        this._currentStart = moment(currentItem.actualStartTime);
        this._currentEnd = moment(currentItem.actualEndTime);
      }
      if (!this._currentStart && !this._currentEnd) {
        this._currentStart = moment(currentItem.actualStartTime);
        this._currentEnd = moment(currentItem.actualEndTime);
      }
      this._durationString = DurationString.calculateDurationString(this._currentStart, this._currentEnd);
      this._updateInputSubs();
    } else {
      this._currentStart = moment();
      this._currentEnd = moment();
    }
  }

  private _updateInputSubs() {
    this._inputSubs.forEach(s => s.unsubscribe());
    this._inputSubs = [
      this._startTimeInput.timeValue$.subscribe(val => {
        this._currentStart = moment(val);
        this._checkForChanges();
      }),
      this._endTimeInput.timeValue$.subscribe(val => {
        this._currentEnd = moment(val);
        this._checkForChanges();
      })
    ];
  }

  private _checkForChanges() {
    const currentItem = this.daybookService.tlefController.currentlyOpenTLEFItem.item;
    const startIsSame = this._currentStart.isSame(currentItem.schedItemStartTime);
    const endIsSame = this._currentEnd.isSame(currentItem.schedItemEndTime);
    if (!(startIsSame && endIsSame)) {
      this.daybookService.tlefController.makeChangesToTLETimes(this._currentStart, this._currentEnd);
    }
  }

}
