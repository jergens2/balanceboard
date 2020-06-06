import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimeSelectionRow } from '../time-selection-row/time-selection-row.class';
import { Subscription } from 'rxjs';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';
import { DaybookTimeScheduleStatus } from '../../../../../controller/items/daybook-availability-type.enum';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { DaybookDisplayUpdateType } from '../../../../../controller/items/daybook-display-update.interface';
import { TimeSelectionColumn } from './time-selection-column.class';

@Component({
  selector: 'app-time-selection-column',
  templateUrl: './time-selection-column.component.html',
  styleUrls: ['./time-selection-column.component.css']
})
export class TimeSelectionColumnComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService) { }

  private _rows: TimeSelectionRow[] = [];
  private _mouseIsInComponent: boolean;
  private _startRow: TimeSelectionRow;
  private _endRow: TimeSelectionRow;
  private _timeDelineators: TimelogDelineator[] = [];


  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Output() createNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();


  @HostListener('window:mouseup', ['$event.target']) onMouseUp() {
    if (!this._mouseIsInComponent) {
      this._reset();
    }
  }

  public get rows(): TimeSelectionRow[] { return this._rows; }
  public get startTime(): moment.Moment { return this.daybookDisplayService.displayStartTime; }
  public get endTime(): moment.Moment { return this.daybookDisplayService.displayEndTime; }
  public get startRow(): TimeSelectionRow { return this._startRow; }
  public get endRow(): TimeSelectionRow { return this._endRow; }
  public get timeDelineators(): TimelogDelineator[] { return this._timeDelineators; }

  private _column: TimeSelectionColumn;

  private _displaySub: Subscription = new Subscription();
  private _columnSubs: Subscription[] = [];

  ngOnInit() {
    this._rebuild();
    this._displaySub = this.daybookDisplayService.displayUpdated$.subscribe((update) => {
      this._rebuild();
    });
  }

  private _rebuild() {
    this._timeDelineators = this.daybookDisplayService.timelogDelineators;
    this._column = new TimeSelectionColumn(this.daybookDisplayService);
    this._subscribeToColumn();
  }


  private _subscribeToColumn() {
    this._columnSubs.forEach(sub => sub.unsubscribe());
    this._columnSubs = [
      this._column.deleteDelineator$.subscribe((deleteDelineator) => { this._onDeleteDelineator(deleteDelineator); }),
      this._column.startDragging$.subscribe((startRow) => { this._startDragging(startRow); }),
      this._column.updateDragging$.subscribe((updateRow) => { this._updateDragging(updateRow); }),
      this._column.stopDragging$.subscribe((stopRow) => { this._stopDragging(stopRow); })
    ];
  }

  ngOnDestroy() {
    this._displaySub.unsubscribe();
    this._columnSubs.forEach(s => s.unsubscribe());
    this._columnSubs = [];
  }

  public onMouseLeave() {
    this._mouseIsInComponent = false;
    // this._reset();
    if (!this.startRow) {
      this._reset();
    }
  }
  public onMouseEnter() {
    this._mouseIsInComponent = true;
  }

  private _startDragging(row: TimeSelectionRow) {
    // console.log("_startDragging " + row.startTime.format("hh:mm a") + " ---- " + row.sectionIndex)
    this._startRow = row;
    this._activateSection(this._startRow);
    if (!this._startRow.timelogDelineator) {
      this._startRow.onDrawDelineator(this.startRow.startTime);
    }
  }

  private _updateDragging(updateRow: TimeSelectionRow) {
    this._endRow = updateRow;
    const dragTimes = this._buildSection();
    const startTime = dragTimes.startTime;
    const endTime = dragTimes.endTime;
    this.rows.forEach((row) => {
      row.onDrawDelineator(startTime, endTime);
    });
    if (!startTime.isSame(endTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(startTime, endTime));
    } else {
      this.drawNewTLE.emit(null);
    }
  }

  private _buildSection(): { startTime: moment.Moment, endTime: moment.Moment } {
    const startSectionIndex = this.startRow.sectionIndex;
    const sectionStart = moment(this._getSectionStart(startSectionIndex));
    const sectionEnd = moment(this._getSectionEnd(startSectionIndex));
    let startTime: moment.Moment = moment(this.startRow.startTime);
    let endTime: moment.Moment = moment(this.endRow.startTime);
    if (endTime.isAfter(sectionEnd)) {
      endTime = moment(sectionEnd);
    } else if (endTime.isBefore(startTime)) {
      if (endTime.isBefore(sectionStart)) {
        startTime = moment(sectionStart);
        endTime = moment(this.startRow.startTime);
      } else {
        startTime = moment(this.endRow.startTime);
        endTime = moment(this.startRow.startTime);
      }
    }
    return {
      startTime: startTime,
      endTime: endTime,
    };
  }

  private _stopDragging(stopRow: TimeSelectionRow) {
    if (this.endRow && !this.endRow.startTime.isSame(this.startRow.startTime)) {
      const dragTimes = this._buildSection();
      const startTime = dragTimes.startTime;
      const endTime = dragTimes.endTime;
      this._createNewTimelogEntry(startTime, endTime);
    } else {
      if (stopRow.startTime.isSame(this.startRow.startTime)) {
        this._saveNewTimeDelineator(this.startRow);
      } else {
        console.log('Error with time values');
      }

    }
    this._reset();
  }

  private _onDeleteDelineator(deleteTime: moment.Moment) {
    if (deleteTime) {
      const foundTime = this.timeDelineators
        .filter(item => item.delineatorType === TimelogDelineatorType.SAVED_DELINEATOR)
        .find(item => item.time.isSame(deleteTime));
      if (foundTime) {
        this._timeDelineators.splice(this._timeDelineators.indexOf(foundTime), 1);
        this._timeDelineators = this.timeDelineators.sort((item1, item2) => {
          if (item1.time.isBefore(item2.time)) { return -1; }
          else if (item1.time.isAfter(item2.time)) { return 1; }
          else { return 0; }
        });
        this._rebuild();
        this.daybookDisplayService.activeDayController.deleteDelineator(deleteTime);
      } else {
        console.log("Error: could not delete delineator because time was not found: " + deleteTime.format('hh:mm a'));
      }
    } else {
      console.log('Error:  no deleteTime value provided')
    }
  }

  private _reset() {
    // console.log("COLUMN:  RESET")
    this._rows.forEach((row) => {
      row.reset();
    });
    this._startRow = null;
    this._endRow = null;
    // this._mouseUpRow = null;
    // this._mouseOverRow = null;
    this.drawNewTLE.emit(null);
    this.createNewTLE.emit(null);
  }

  private _activateSection(activateRow: TimeSelectionRow) {
    // console.log("ACTIVATING: " , this.rows)
    this.rows.forEach((row) => {
      if (row.sectionIndex === activateRow.sectionIndex) {
        row.isGrabbingSection = true;
      }
    });
  }

  private _getSectionStart(sectionIndex: number): moment.Moment {
    const availableItems = this.daybookDisplayService.activeDayController.getAvailableScheduleItems();
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].startTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }
  private _getSectionEnd(sectionIndex: number): moment.Moment {
    const availableItems = this.daybookDisplayService.activeDayController.getAvailableScheduleItems();
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].endTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }






  private _saveNewTimeDelineator(actionRow: TimeSelectionRow) {
    const maxDelineators = 16;
    let saveAllDelineators: moment.Moment[] = [];
    const existingValues = this.daybookDisplayService.activeDayController.savedTimeDelineators;
    existingValues.forEach((existingValue) => {
      if (this.daybookDisplayService.activeDayController.isTimeAvailable(existingValue)) {
        saveAllDelineators.push(moment(existingValue));
      }
    });
    if (saveAllDelineators.length < maxDelineators) {
      saveAllDelineators.push(actionRow.startTime);
    }
    saveAllDelineators = saveAllDelineators.sort((item1, item2) => {
      if (item1.isBefore(item2)) { return -1; }
      else if (item1.isAfter(item2)) { return 1; }
      else { return 0; }
    });

    this.daybookDisplayService.activeDayController.saveTimeDelineators(saveAllDelineators);
    this._rebuild();
  }

  private _createNewTimelogEntry(startTime: moment.Moment, endTime: moment.Moment) {
    const saveNewTLE = new TimelogEntryItem(startTime, endTime);
    this.daybookDisplayService.drawNewTimelogEntry(saveNewTLE);
    // console.log("Opening new TLE: " + startTime.format('hh:mm a') + " to " + endTime.format('hh:mm a'))

    this._reset();
    // this.createNewTLE.emit(saveNewTLE);
  }




}