import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TimelogZoomControl } from '../../timelog-zoom-controller/timelog-zoom-control.interface';
import * as moment from 'moment';
import { TimeSelectionRow } from './time-selection-row.class';
import { Subscription } from 'rxjs';
import { DaybookService } from '../../../../../daybook.service';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';

@Component({
  selector: 'app-time-selection-column',
  templateUrl: './time-selection-column.component.html',
  styleUrls: ['./time-selection-column.component.css']
})
export class TimeSelectionColumnComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _rows: TimeSelectionRow[] = [];
  private _zoomControl: TimelogZoomControl;
  private _mouseIsInComponent: boolean;
  private _mouseDownRow: TimeSelectionRow;
  private _mouseUpRow: TimeSelectionRow;
  private _mouseOverRow: TimeSelectionRow;


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
  public get isActive(): boolean { return (this._mouseDownRow ? true : false); }

  ngOnInit() {
    // this._buildRows(this._calculateDivisor());
    this.daybookService.activeDayController$.subscribe((valueChanged) => {this._buildRows(this._calculateDivisor());
    });
  }

  public onMouseLeave() { this._mouseIsInComponent = false; }
  public onMouseEnter() { this._mouseIsInComponent = true; }

  public onMouseDownRow(row: TimeSelectionRow) {
    // console.log("Row mouse down" + row.startTime.format("hh:mm a"))
    if (row.isAvailable) {
      this._mouseDownRow = row;
    } else{
      const nextRowIndex = row.rowIndex + 1;
      if((nextRowIndex+1) <= this.rows.length){
        if (this.rows[row.rowIndex + 1].isAvailable) {
          this._mouseDownRow = row;
        }else{
          this._reset();
        }
      }
       else {
        this._reset();
      }
    } 
  }

  public onMouseUpRow(row: TimeSelectionRow) {
    // console.log("Row mouse up " + row.startTime.format("hh:mm a") + " - is Available?  " + row.isAvailable);
    if (this._mouseDownRow) {
      if (row.isAvailable) {
        this._mouseUpRow = row;
      } else {
        if (!this._mouseUpRow) {
          if (this._mouseOverRow) {
            // console.log("Setting mouseUp row to mouseOver row");
            this._mouseUpRow = this._mouseOverRow;
          } else {
            // console.log("Setting mouseUp row to mouseDown row");
            this._mouseUpRow = this._mouseDownRow;
          }
        }
      }
      this._createNewTimeMarks();
    } else {
      this._reset();
    }
  }

  public onMouseEnterRow(row: TimeSelectionRow) {
    if (this._mouseDownRow) {
      this._mouseOverRow = row;
      this._drawNewTimelogEntry();
    }
  }

  public onMouseLeaveRow(row: TimeSelectionRow) { }



  private _reset() {
    this._mouseDownRow = null;
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
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow.isAvailable = this.daybookService.activeDayController.isRowAvailable(newRow.startTime, newRow.endTime);
      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }
    this._rows = rows;
  }

  
  private _drawNewTimelogEntry() {
    if (this._mouseDownRow.startTime.isBefore(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseOverRow.startTime))
    } else if (this._mouseDownRow.startTime.isAfter(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseOverRow.startTime, this._mouseDownRow.startTime))
    } else if (this._mouseDownRow.startTime.isSame(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(null);
      this._drawNewTimeDelineator();
      
    }
    // console.log("Draw out the new TLE")
  }

  private _drawNewTimeDelineator(){
    let newDelineator: TimelogDelineator = new TimelogDelineator(this._mouseDownRow.startTime, TimelogDelineatorType.SAVED_DELINEATOR);
    this.drawNewTimeDelineator.emit(newDelineator);
  }

  private _createNewTimeMarks() {
    if (this._mouseDownRow.startTime.isSame(this._mouseUpRow.startTime) && this._mouseDownRow.endTime.isSame(this._mouseUpRow.endTime)) {
      // console.log("single click : " + this._mouseDownRow.startTime.format('hh:mm a'))
    } else {
      this.createNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseUpRow.startTime));
    }
    this._reset();
  }

  private _calculateDivisor(): number {
    // looking for approximately 100 items
    const nearestTo = 50;
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
