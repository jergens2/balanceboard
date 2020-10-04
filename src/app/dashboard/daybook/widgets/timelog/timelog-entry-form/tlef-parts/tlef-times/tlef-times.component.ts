import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TimeInput } from '../../../../../../../shared/components/time-input/time-input.class';

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
    console.log("RELOADING")
    if (this.daybookService.tlefController.currentlyOpenTLEFItem) {
      const currentItem = this.daybookService.tlefController.currentlyOpenTLEFItem;
      if (this.daybookService.tlefController.currentlyOpenTLEFItem.isTLEItem) {
        this._entryItem = currentItem.getInitialTLEValue();
      }
      this._entryStartTime = moment(currentItem.actualStartTime);
      this._entryEndTime = moment(currentItem.actualEndTime);
      this._startTimeInput = currentItem.timeLimiter.startTimeInput;
      this._endTimeInput = currentItem.timeLimiter.endTimeInput;
      this._originalStart = moment(currentItem.actualStartTime);
      this._originalEnd = moment(currentItem.actualEndTime);
      this._updateInputSubs();


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
    if (!(this._entryItem.startTime.isSame(this._originalStart) && this._entryItem.endTime.isSame(this._originalEnd))) {
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
