import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TimelogZoomControl } from '../../timelog-zoom-controller/timelog-zoom-control.interface';
import * as moment from 'moment';
import { TimeSelectionRow } from './time-selection-row.class';
import { Subscription } from 'rxjs';
import { DaybookService } from '../../../../../daybook.service';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';

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
  private _availabilitySchedule: TimeSchedule;


  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Output() createNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Input() public set zoomControl(zoomControl: TimelogZoomControl) { this._zoomControl = zoomControl; }

  @HostListener('window:mouseup', ['$event.target']) onMouseUp(){ 
    if(!this._mouseIsInComponent){
      this._reset();
    }
  }


  public get availabilitySchedule(): TimeSchedule { return this._availabilitySchedule; }
  public get rows(): TimeSelectionRow[] { return this._rows; }
  public get zoomControl(): TimelogZoomControl { return this._zoomControl; }
  public get isActive(): boolean { return (this._mouseDownRow ? true : false); }

  ngOnInit() {
    this._availabilitySchedule = (this.daybookService.activeDayController.getColumnAvailability(this.zoomControl));
    this._buildRows(this._calculateDivisor());
    console.log("Rows: " + this.rows.length + " , minutes per: " + this._calculateDivisor())
    console.log("mousedown, and isactive: ", this._mouseDownRow, this.isActive)
  }

  public onMouseLeave() { this._mouseIsInComponent = false; }
  public onMouseEnter() { this._mouseIsInComponent = true; }

  public onMouseDownRow(row: TimeSelectionRow) {
    // console.log("Row mouse down" + row.startTime.format("hh:mm a"))
    if (row.isAvailable) {
      this._mouseDownRow = row;
    } else {
      this._reset();
    }
  }

  public onMouseUpRow(row: TimeSelectionRow) {
    console.log("Row mouse up " + row.startTime.format("hh:mm a") + " - is Available?  " + row.isAvailable);
    if (this._mouseDownRow) {
      if (row.isAvailable) {
        this._mouseUpRow = row;
      } else {
        if (!this._mouseUpRow) {
          if (this._mouseOverRow) {
            console.log("Setting mouseUp row to mouseOver row");
            this._mouseUpRow = this._mouseOverRow;
          } else {
            console.log("Setting mouseUp row to mouseDown row");
            this._mouseUpRow = this._mouseDownRow;
          }
        }
      }
      this._createNewTimeMarks();
    } else {
      console.log("  No mouseDownRow")
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



  private _reset(){
    this._mouseDownRow = null;
    this._mouseUpRow = null;
    this._mouseOverRow = null;
    this.drawNewTLE.emit(null);
    this.createNewTLE.emit(null);
  }
  /**
   * Find the next time that the availability changes value.
   * For example, if currentNewRow.isAvailable === true, 
   * then find the next time at which .isAvailable becomes false.
   * @param newRow current row
   */
  private _findNextAvailabilityChange(currentNewRow): moment.Moment {
    // console.log("To do:  start here.")
    const currentRowIndex = this.rows.indexOf(currentNewRow);
    // const 
    return null;
  }

  private _buildRows(divisorMinutes: number) {
    const durationMinutes: number = this._zoomControl.endTime.diff(this._zoomControl.startTime, 'minutes');
    const rowCount = durationMinutes / divisorMinutes;
    const rows: TimeSelectionRow[] = [];
    let currentTime: moment.Moment = moment(this._zoomControl.startTime);
    for (let i = 0; i < rowCount; i++) {
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow.isAvailable = this._checkAvailability(newRow);
      newRow.nextAvailabilityChange = this._findNextAvailabilityChange(newRow);
      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }
    this._rows = rows;
  }

  // private _getMinStartTime(): moment.Moment {
  //   if (this._availabilitySchedule) {
  //     const valueAtStart = this.availabilitySchedule.hasValueAtTime(this._mouseDownRow.startTime);
  //     const valueAtEnd = this.availabilitySchedule.hasValueAtTime(this._mouseDownRow.endTime);
  //     if (valueAtStart && valueAtEnd) {
  //       console.log('Error:  seemingly impossible:   ' + this._mouseDownRow.startTime.format('hh:mm a') + " to " + this._mouseDownRow.endTime.format('hh:mm a'));
  //       return null;
  //     } else if (valueAtStart && !valueAtEnd) {
  //       return this.availabilitySchedule.getPreviousValueChangeTime(this._mouseDownRow.endTime);
  //     } else if (valueAtEnd && !valueAtStart) {
  //       console.log('Error:  seemingly impossible');
  //       return null;
  //     } else if (!valueAtStart && !valueAtEnd) {
  //       return this.availabilitySchedule.getPreviousValueChangeTime(this._mouseDownRow.startTime);
  //     }
  //   } else {
  //     console.log("Error, no availability to check");
  //     return null;
  //   }
  // }

  // private _getMaxEndTime(currentStartTime: moment.Moment, currentEndTime: moment.Moment): moment.Moment {
  //   const nextTrueTime = this.availabilitySchedule.getNextValueTrueTime(moment(currentStartTime).add(1,'millisecond'));
  //   if(nextTrueTime){
  //     if (currentEndTime.isAfter(nextTrueTime)) {
  //       return nextTrueTime;
  //     }
  //   }
  //   return currentEndTime;
  // }


  private _drawNewTimelogEntry() {
    if (this._mouseDownRow.startTime.isBefore(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseOverRow.startTime))
    } else if(this._mouseDownRow.startTime.isAfter(this._mouseOverRow.startTime)){
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseOverRow.startTime, this._mouseDownRow.startTime))
    }else if(this._mouseDownRow.startTime.isSame(this._mouseOverRow.startTime)){
      console.log("To do:  draw a thing;")
    }
    // console.log("Draw out the new TLE")
  }


  private _createNewTimeMarks() {
    if (this._mouseDownRow.startTime.isSame(this._mouseUpRow.startTime) && this._mouseDownRow.endTime.isSame(this._mouseUpRow.endTime)) {
      // console.log("single click : " + this._mouseDownRow.startTime.format('hh:mm a'))
    } else {
      // console.log("Dragged range : " + this._mouseDownRow.startTime.format('hh:mm a') + this._mouseUpRow.startTime.format('hh:mm a'));
      this.createNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseUpRow.startTime));
      console.log("Creating new TLE")
    }
    this._reset();
  }

  private _checkAvailability(newRow: TimeSelectionRow): boolean {
    /*  
      Reminder:  isAvailable === !isActive  
    */
    let isActive: boolean = false;
    let foundWholeRowSpan = this.availabilitySchedule.fullSchedule.find(item => {
      return newRow.startTime.isSameOrAfter(item.startTime) && newRow.endTime.isSameOrBefore(item.endTime);
    });
    if (foundWholeRowSpan) {
      isActive = foundWholeRowSpan.hasValue;
    } else {
      let foundStart = this.availabilitySchedule.fullSchedule.find(item => {
        return newRow.startTime.isSameOrAfter(item.startTime) && newRow.startTime.isSameOrBefore(item.endTime);
      });
      let foundEnd = this.availabilitySchedule.fullSchedule.find(item => {
        return newRow.endTime.isSameOrAfter(item.startTime) && newRow.endTime.isSameOrBefore(item.endTime);
      })
      if (foundStart && foundEnd) {
        const rowStart: moment.Moment = newRow.startTime;
        const breakPoint: moment.Moment = foundStart.endTime;
        const rowEnd: moment.Moment = newRow.endTime;
        if (!foundStart.endTime.isSame(foundEnd.startTime)) { console.log(" Error: mismatch in time.") }

        const firstPeriodDurationMS = breakPoint.diff(rowStart, 'milliseconds');
        const secondPeriodDurationMS = rowEnd.diff(breakPoint, 'milliseconds');

        if (firstPeriodDurationMS > secondPeriodDurationMS) {
          isActive = foundStart.hasValue;
        } else {
          isActive = foundEnd.hasValue;
        }

      } else {
        console.log("Error:  couldn't find an availability item.");
        console.log("  Found start: ", foundStart);
        console.log("  Found end  : ", foundEnd);
      }
    }
    // console.log("New Row: " + newRow.startTime.format('hh:mm a') + " isAvailable? " + !isActive);
    return !isActive;
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
