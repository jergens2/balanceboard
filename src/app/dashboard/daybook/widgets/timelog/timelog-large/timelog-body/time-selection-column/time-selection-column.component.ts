import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TimelogZoomControl } from '../../timelog-zoom-controller/timelog-zoom-control.interface';
import * as moment from 'moment';
import { TimeSelectionRow } from '../time-selection-row/time-selection-row.class';
import { Subscription } from 'rxjs';
import { DaybookService } from '../../../../../daybook.service';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';
import { DaybookAvailabilityType } from '../../../../../controller/items/daybook-availability-type.enum';
import { ToolsService } from '../../../../../../../tools-menu/tools/tools.service';
import { ToolComponents } from '../../../../../../../tools-menu/tools/tool-components.enum';

@Component({
  selector: 'app-time-selection-column',
  templateUrl: './time-selection-column.component.html',
  styleUrls: ['./time-selection-column.component.css']
})
export class TimeSelectionColumnComponent implements OnInit {

  constructor(private daybookService: DaybookService, private toolsService: ToolsService) { }

  private _rows: TimeSelectionRow[] = [];
  private _zoomControl: TimelogZoomControl;
  private _mouseIsInComponent: boolean;
  // // private _mouseDownRow: TimeSelectionRow;
  // private _mouseUpRow: TimeSelectionRow;
  // private _mouseOverRow: TimeSelectionRow;

  private _startRow: TimeSelectionRow;
  private _endRow: TimeSelectionRow;

  private _timeDelineations: moment.Moment[] = [];;



  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  // @Output() drawNewTimeDelineator: EventEmitter<TimelogDelineator> = new EventEmitter();
  @Output() createNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Input() public set zoomControl(zoomControl: TimelogZoomControl) {
    this._zoomControl = zoomControl;
    this._buildRows(this._calculateDivisor());
  }

  @HostListener('window:mouseup', ['$event.target']) onMouseUp() {
    if (!this._mouseIsInComponent) {
      this._reset();
    }
  }

  public get rows(): TimeSelectionRow[] { return this._rows; }
  public get zoomControl(): TimelogZoomControl { return this._zoomControl; }
  // public get isActive(): boolean { return (this._startRow ? true : false); }
  public get startTime(): moment.Moment { return this.zoomControl.startTime; }
  public get endTime(): moment.Moment { return this.zoomControl.endTime; }

  public get startRow(): TimeSelectionRow { return this._startRow; }
  public get endRow(): TimeSelectionRow { return this._endRow; }

  ngOnInit() {
    this._timeDelineations = Object.assign([], this.daybookService.activeDayController.timeDelineations);
    this.daybookService.activeDayController$.subscribe((valueChanged) => {
      if(!this.startRow){
        this._timeDelineations = Object.assign([], valueChanged.timeDelineations);
        this._buildRows(this._calculateDivisor());
      }
    });
    // console.log("Building rows:")
    // this.daybookService.activeDayController.logFullScheduleItems();
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

  public onEditDelineator(originalTime: moment.Moment, saveNewDelineator: moment.Moment) {
    this.daybookService.activeDayController.updateDelineator(originalTime, saveNewDelineator);
  }



  private _startDragging(row: TimeSelectionRow) {
    console.log("_startDragging " + row.startTime.format("hh:mm a") + " ---- " + row.sectionIndex)
    this._startRow = row;
    this._activateSection(this._startRow);
    if (!this._startRow.savedDelineatorTime) {
      this._startRow.onDrawDelineator(this.startRow.startTime);
    }
  }

  private _updateDragging(updateRow: TimeSelectionRow) {
    this._endRow = updateRow;
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
    this.rows.forEach((row)=>{
      row.onDrawDelineator(startTime, endTime);
    });
    this.drawNewTLE.emit(new TimelogEntryItem(startTime, endTime));
    // this._drawNewTimelogEntry(startTime, endTime);
  }

  private _stopDragging(stopRow: TimeSelectionRow) {
    if (stopRow.startTime.isSame(this.startRow.startTime)) {
      this._saveNewTimeDelineator(this.startRow);
    } else if (stopRow.startTime.isBefore(this.startRow.startTime)) {
      this._saveNewTimelogEntry(stopRow, this.startRow);
    } else if (stopRow.startTime.isAfter(this.startRow.startTime)) {
      this._saveNewTimelogEntry(this.startRow, stopRow);
    } else {
      console.log('Error with time values');
    }
    this._reset();
  }

  private _onDeleteDelineator(time: moment.Moment) {
    const foundTime = this._timeDelineations.find(item => item.isSame(time));
    if (foundTime) {
      this._timeDelineations.splice(this._timeDelineations.indexOf(foundTime), 1);
      this._timeDelineations = this._timeDelineations.sort((item1, item2) => {
        if (item1.isBefore(item2)) { return -1; }
        else if (item1.isAfter(item2)) { return 1; }
        else { return 0; }
      })
      this._buildRows(this._calculateDivisor());
      this.daybookService.activeDayController.deleteDelineator(time);
    } else {
      console.log("Error: could not delete delineator because time was not found: " + time.format('hh:mm a'));
    }
  }

  private _reset() {
    // console.log("COLUMN:  RESET")
    this._rows.forEach((row) => {
      row.reset();
    });
    this._startRow = null;
    // this._mouseUpRow = null;
    // this._mouseOverRow = null;
    this.drawNewTLE.emit(null);
    this.createNewTLE.emit(null);
  }

  private _buildRows(divisorMinutes: number) {
    this._reset();
    const durationMinutes: number = this._zoomControl.endTime.diff(this._zoomControl.startTime, 'minutes');
    const rowCount = durationMinutes / divisorMinutes;
    const rows: TimeSelectionRow[] = [];
    let currentTime: moment.Moment = moment(this._zoomControl.startTime);
    for (let i = 0; i < rowCount; i++) {
      // console.log(" " + i + " :" + currentTime.format('hh:mm a') + " to " + moment(currentTime).add(divisorMinutes, 'minutes').format('hh:mm a'))
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow.isAvailable = this._isAvailable(newRow);
      if (newRow.isAvailable) {
        newRow.sectionIndex = this._findSectionIndex(newRow);
      }
      let delineator = this._findDelineator(newRow);
      if (delineator) {
        newRow.setDelineator(delineator);
      }

      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }
    rows.forEach((row) => {
      if (row.isAvailable) {
        row.earliestAvailability = this._getEarliestAvailability(row.startTime);
        row.latestAvailability = this._getLatestAvailability(row.startTime);
      }
    })
    this._rows = rows;
    this._updateRowSubscriptions();
  }

  private _getEarliestAvailability(rowStart: moment.Moment): moment.Moment {
    return this.daybookService.activeDayController.getEarliestAvailability(rowStart);
  }
  private _getLatestAvailability(rowStart: moment.Moment): moment.Moment {
    return this.daybookService.activeDayController.getLatestAvailability(rowStart);
  }


  private _rowSubscriptions: Subscription[] = [];
  private _updateRowSubscriptions() {
    this._rowSubscriptions.forEach(s => s.unsubscribe());
    this._rowSubscriptions = [];
    const deleteSubscriptions = this.rows.map(row => row.deleteDelineator$.subscribe((del: moment.Moment) => {
      this._onDeleteDelineator(del);
    }));
    const editSubscriptions = this.rows.map(row => row.editDelineator$.subscribe((saveNewDelineator: moment.Moment) => {
      this.onEditDelineator(row.savedDelineatorTime, saveNewDelineator);
    }));
    const startDragSubs = this.rows.map(row => row.startDragging$.subscribe((startDragging: TimeSelectionRow) => {
      if (startDragging) {
        this._startDragging(startDragging);
      }
    }));
    const updateDragSubs = this.rows.map(row => row.updateDragging$.subscribe((updateDragging: TimeSelectionRow) => {
      if (updateDragging) {
        this._updateDragging(updateDragging);
      }
    }));
    const stopDragSbus = this.rows.map(row => row.stopDragging$.subscribe((stopDragging: TimeSelectionRow) => {
      if (stopDragging) {
        this._stopDragging(stopDragging);
      }
    }));
    this._rowSubscriptions = [
      ...deleteSubscriptions,
      ...editSubscriptions,
      ...startDragSubs,
      ...stopDragSbus,
      ...updateDragSubs,
    ];
  }

  private _activateSection(activateRow: TimeSelectionRow) {
    // console.log("ACTIVATING: " , this.rows)
    this.rows.forEach((row) => {
      if (row.sectionIndex === activateRow.sectionIndex) {
        row.isGrabbingSection = true;
      }
    });
  }

  private _findSectionIndex(newRow: TimeSelectionRow): number {
    const availableItems = this.daybookService.activeDayController
      .fullScheduleItems.filter(item => item.value === DaybookAvailabilityType.AVAILABLE);


    if (availableItems.length === 0) {
      console.log('Error: no item found')
      return -1;
    } else if (availableItems.length === 1) {
      return 0;
    } else if (availableItems.length > 1) {
      let foundIndex: number = availableItems.findIndex((scheduleItem) => {
        const startsBefore = newRow.startTime.isSameOrBefore(scheduleItem.startTime) && newRow.endTime.isAfter(scheduleItem.startTime);
        const endsAfter = newRow.startTime.isBefore(scheduleItem.endTime) && newRow.endTime.isSameOrAfter(scheduleItem.endTime);
        const isIn = newRow.startTime.isSameOrAfter(scheduleItem.startTime) && newRow.startTime.isSameOrBefore(scheduleItem.endTime);
        return (startsBefore || endsAfter || isIn);
      });
      if (foundIndex === -1) { console.log('Error: could not find item') }
      return foundIndex;
    }

  }
  private _getSectionStart(sectionIndex: number): moment.Moment {
    const availableItems = this.daybookService.activeDayController.fullScheduleItems
      .filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].startTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }
  private _getSectionEnd(sectionIndex: number): moment.Moment {
    const availableItems = this.daybookService.activeDayController.fullScheduleItems
      .filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].endTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }



  private _isAvailable(newRow): boolean {
    return this.daybookService.activeDayController.isRowAvailable(newRow.startTime, newRow.endTime);
  }
  private _findDelineator(newRow): moment.Moment {
    return this._timeDelineations.find(item =>
      item.isSameOrAfter(newRow.startTime) && item.isBefore(newRow.endTime));
  }

  // private _drawNewTimelogEntry(startTime: moment.Moment, endTime: moment.Moment) {
  //   // console.log("Emitting new Timelog Entry, from: " + startTime.format('hh:mm a') + ' to ' + endTime.format('hh:mm a'));
  //   this.drawNewTLE.emit(new TimelogEntryItem(startTime, endTime));
  // }



  private _saveNewTimeDelineator(actionRow: TimeSelectionRow) {
    const maxDelineators = 16;
    if (this._timeDelineations.length < maxDelineators) {
      this._timeDelineations.push(actionRow.startTime);
      this._timeDelineations = this._timeDelineations.sort((item1, item2) => {
        if (item1.isBefore(item2)) { return -1; }
        else if (item1.isAfter(item2)) { return 1; }
        else { return 0; }
      });
      this._buildRows(this._calculateDivisor());
      this.daybookService.activeDayController.saveTimeDelineator$(actionRow.startTime);
    }
  }

  private _saveNewTimelogEntry(startRow: TimeSelectionRow, endRow: TimeSelectionRow) {
    console.log("Opening new Timelog entry.: " + startRow.startTime.format('hh:mm a') + endRow.startTime.format('hh:mm a'))
    // this.toolsService.openTool(ToolComponents.TimelogEntry)
  }


  private _calculateDivisor(): number {

    // for performance reasons we don't want too many, but for functionality reasons we don't want too few.
    //  100-200 seems like a pretty good range.
    const nearestTo = 100;
    const durationMinutes: number = this._zoomControl.endTime.diff(this._zoomControl.startTime, 'minutes');
    let nearest = 5;
    let nearestDistance = Math.abs(nearestTo - (durationMinutes / nearest));
    [5, 10, 15, 30, 60].forEach((numberOfMinutes) => {
      const divisions = durationMinutes / numberOfMinutes;
      const distanceTo = Math.abs(nearestTo - divisions);
      if (distanceTo < nearestDistance) {
        nearestDistance = distanceTo;
        nearest = numberOfMinutes;
      }
    });
    return nearest;
  }

}