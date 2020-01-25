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
  // private _mouseDownRow: TimeSelectionRow;
  private _mouseUpRow: TimeSelectionRow;
  private _mouseOverRow: TimeSelectionRow;

  private _startRow: TimeSelectionRow;

  private _timeDelineations: moment.Moment[] = [];;



  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Output() drawNewTimeDelineator: EventEmitter<TimelogDelineator> = new EventEmitter();
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

  ngOnInit() {
    this._timeDelineations = Object.assign([], this.daybookService.activeDayController.timeDelineations);
    this.daybookService.activeDayController$.subscribe((valueChanged) => {
      this._timeDelineations = Object.assign([], valueChanged.timeDelineations);
      this._buildRows(this._calculateDivisor());
    });

    console.log("Building rows:")
    this.daybookService.activeDayController.logFullScheduleItems();

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

  public getSectionStart(sectionIndex: number): moment.Moment{
    return this.rows.find(row => row.sectionIndex === sectionIndex).startTime;
  }
  public getSectionEnd(sectionIndex: number): moment.Moment{
    const foundRows = this.rows.filter(row => row.sectionIndex === sectionIndex);
    if(foundRows.length > 0){
      return foundRows[foundRows.length-1].endTime;
    }else{
      console.log('Bigtime error with sections');
    }
  }

  public onMouseDownRow(row: TimeSelectionRow){
    
    
  } 
  public onMouseUpRow(row: TimeSelectionRow){
  }

  public onMouseEnterRow(enterRow: TimeSelectionRow) {
    // enterRow.mouseIsOver = true;
    if (this.startRow) {
      this._mouseOverRow = enterRow;
      if (enterRow.isAvailable) {
        this.rows.forEach((existingRow) => {
          if (existingRow !== this.startRow) {
            existingRow.reset();
          }
        });
        this._drawNewTimeDelineator(this._mouseOverRow);
        this._drawNewTimelogEntry();
      } else {
        let nextAvailability: moment.Moment, prevAvailability: moment.Moment;
        if (this._mouseOverRow.startTime.isBefore(this.startRow.startTime)) {
          nextAvailability = this.daybookService
            .activeDayController.getNextOccurrenceOfValue(this._mouseOverRow.startTime, DaybookAvailabilityType.AVAILABLE);
        } else {
          prevAvailability = this.daybookService
            .activeDayController.getNextOccurrenceOfNotValue(this.startRow.startTime, DaybookAvailabilityType.AVAILABLE);
          if (prevAvailability) {
            this.rows.forEach((existingRow) => {
              if (existingRow !== this.startRow) {
                existingRow.reset();
              }
            });
          }
        }
        if (nextAvailability || prevAvailability) {
          let newDelineator: TimelogDelineator;
          this.rows.forEach((existingRow) => {
            if (existingRow !== this.startRow) {
              existingRow.reset();
            }
          });
          if (nextAvailability) {
            this._mouseOverRow = this.rows.find(item => nextAvailability.isSameOrAfter(item.startTime) && nextAvailability.isSameOrBefore(item.endTime))
            newDelineator = new TimelogDelineator(nextAvailability, TimelogDelineatorType.SAVED_DELINEATOR);
          } else if (prevAvailability) {
            const foundIndex = this.rows.findIndex(item => prevAvailability.isSameOrAfter(item.startTime) && prevAvailability.isSameOrBefore(item.endTime))
            this._mouseOverRow = this.rows[foundIndex + 1];
            newDelineator = new TimelogDelineator(prevAvailability, TimelogDelineatorType.SAVED_DELINEATOR);
          }
          this._drawNewTimeDelineator(this._mouseOverRow, newDelineator);
          this._drawNewTimelogEntry();
        }
      }
      this._reset();
    } else {

    }
  }

  public onMouseLeaveRow(row: TimeSelectionRow) { }

  public onEditDelineator(originalTime: moment.Moment, saveNewDelineator: moment.Moment) {
    this.daybookService.activeDayController.updateDelineator(originalTime, saveNewDelineator);
  }


  private _startDragging(row: TimeSelectionRow) {
    console.log("_startDragging " + row.startTime.format("hh:mm a") + " ---- " + row.sectionIndex)
    this._startRow = row;
    this._activateSection(this._startRow);
    if (!this._startRow.savedDelineatorTime) {
      this._drawNewTimeDelineator(this._startRow);
    }

  }

  private _updateDragging(updateRow: TimeSelectionRow){

  }


  private _stopDragging(stopRow: TimeSelectionRow ){ 
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
    console.log("COLUMN:  RESET")
    this._rows.forEach((row) => {
      row.reset();
    });
    this._startRow = null;
    this._mouseUpRow = null;
    this._mouseOverRow = null;
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
    rows.forEach((row)=>{
      if(row.isAvailable){
        row.earliestAvailability = this._getEarliestAvailability(row.startTime);
        row.latestAvailability = this._getLatestAvailability(row.startTime);
      }
    })
    this._rows = rows;
    this._updateRowSubscriptions();
  }

  private _getEarliestAvailability(rowStart: moment.Moment): moment.Moment{
    return this.daybookService.activeDayController.getEarliestAvailability(rowStart);
  }
  private _getLatestAvailability(rowStart: moment.Moment): moment.Moment{
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
      if(startDragging){
        this._startDragging(startDragging);
      }
    }));
    const updateDragSubs = this.rows.map(row => row.updateDragging$.subscribe((updateDragging: TimeSelectionRow) => {
      if(updateDragging){
        this._updateDragging(updateDragging);
      }
    }));
    const stopDragSbus = this.rows.map(row => row.stopDragging$.subscribe((stopDragging: TimeSelectionRow) => {
      if(stopDragging){
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



  private _isAvailable(newRow): boolean {
    return this.daybookService.activeDayController.isRowAvailable(newRow.startTime, newRow.endTime);
  }
  private _findDelineator(newRow): moment.Moment {
    return this._timeDelineations.find(item =>
      item.isSameOrAfter(newRow.startTime) && item.isBefore(newRow.endTime));
  }

  private _drawNewTimelogEntry() {
    if (this.startRow.startTime.isBefore(this._mouseOverRow.startTime)) {
      const startTime = this.startRow.startTime;
      const endTime = this._mouseOverRow.startTime;
      this.drawNewTLE.emit(new TimelogEntryItem(startTime, endTime))
    } else if (this.startRow.startTime.isAfter(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseOverRow.startTime, this.startRow.startTime))
    } else if (this.startRow.startTime.isSame(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(null);
    }
  }

  private _drawNewTimeDelineator(actionRow: TimeSelectionRow, newDelineator?: TimelogDelineator) {
    // console.log(this._mouseDownRow.startTime.format('hh:mm a') + " : Drawing Delineator")
    if (newDelineator) {

    } else {
      newDelineator = new TimelogDelineator(actionRow.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
    }
    if (newDelineator.time)
      actionRow.onDrawDelineator(newDelineator);
    this.drawNewTimeDelineator.emit(newDelineator);
  }

  private _saveNewTimeDelineator(actionRow: TimeSelectionRow) {
    const maxDelineators = 16;
    if(this._timeDelineations.length < maxDelineators){
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
