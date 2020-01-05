import { Component, OnInit, Input } from '@angular/core';
import { TimelogZoomControl } from '../../timelog-zoom-controller/timelog-zoom-control.interface';
import * as moment from 'moment';
import { TimeSelectionRow } from './time-selection-row.class';
import { Subscription } from 'rxjs';
import { DaybookService } from '../../../../../daybook.service';

@Component({
  selector: 'app-time-selection-column',
  templateUrl: './time-selection-column.component.html',
  styleUrls: ['./time-selection-column.component.css']
})
export class TimeSelectionColumnComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _rows: TimeSelectionRow[] = [];
  private _zoomControl: TimelogZoomControl;
  private _mouseDownRow: TimeSelectionRow;
  private _mouseUpRow: TimeSelectionRow;
  private _mouseOverRow: TimeSelectionRow;

  @Input() public set zoomControl(zoomControl: TimelogZoomControl) {
    this._zoomControl = zoomControl;
    this._buildRows(this._calculateDivisor());
  }

  ngOnInit() {
    // if (this._zoomControl) {
    //   console.log("zoom control:", this._zoomControl);
    //   const divisor: number = this._calculateDivisor();
    //   this._buildRows(divisor);
    // } else {
    //   console.log('Error, no zoomControl in time-selection-column');
    // }
  }

  public get rows(): TimeSelectionRow[] { return this._rows; }

  public onMouseLeave() {
    // this._mouseDownRow = null;
  }
  public onMouseEnter() {

  }

  private _buildRows(divisorMinutes: number) {
    // console.log("Building rows.  Divisor is: " + divisorMinutes);
    const durationMinutes: number = this._zoomControl.endTime.diff(this._zoomControl.startTime, 'minutes');
    const rowCount = durationMinutes / divisorMinutes;

    const rows: TimeSelectionRow[] = [];
    let currentTime: moment.Moment = moment(this._zoomControl.startTime);
    for (let i = 0; i < rowCount; i++) {
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow = this._checkAvailability(newRow);
      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }

    this._rows = rows;
    // this._updateMouseEventSubscriptions();
    console.log("This._rows is " + this._rows.length + " , ", this._rows);
  }



  public onMouseDownRow(row: TimeSelectionRow) {
    // console.log("Row mouse down" + row.startTime.format("hh:mm a"))

    // this._mouseDownRow = row;
  }
  public onMouseUpRow(row: TimeSelectionRow) {
    // console.log("Row mouse up " + row.startTime.format("hh:mm a"))

    // this._mouseUpRow = row;
    // if (this._mouseDownRow != null) {
    //   this._createNewTimeMarks();
    // } else {
    //   this._mouseUpRow = null;
    //   this._mouseOverRow = null;
    // }
  }

  public onMouseEnterRow(row: TimeSelectionRow) {
    // if (this._mouseDownRow) {
    //   this._mouseOverRow = row;
    // }
  }

  public onMouseLeaveRow(row: TimeSelectionRow) {

  }



  private _createNewTimeMarks() {
    if (this._mouseDownRow.startTime.isSame(this._mouseUpRow.startTime) && this._mouseDownRow.endTime.isSame(this._mouseUpRow.endTime)) {
      console.log("single click : " + this._mouseDownRow.startTime.format('hh:mm a'))
    } else {
      console.log("Dragged range : " + this._mouseDownRow.startTime.format('hh:mm a') + this._mouseUpRow.startTime.format('hh:mm a'));
    }

    this._mouseDownRow = null;
    this._mouseUpRow = null;
    this._mouseOverRow = null;
  }

  private _checkAvailability(newRow: TimeSelectionRow): TimeSelectionRow {
    // console.log("Ranges: ", this.daybookService.activeDay.timeReferencer.statusTimes.getStatesInRange(newRow.startTime, newRow.endTime));

    // Warning: this method isn't complete


    return newRow;
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
