import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimelogZoomControl } from '../../timelog-zoom-controller/timelog-zoom-control.interface';
import * as moment from 'moment';
import { TimeSelectionRow } from './time-selection-row.class';
import { Subscription } from 'rxjs';
import { DaybookService } from '../../../../../daybook.service';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';

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
  private _availability: TimeScheduleItem[];

  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Output() createNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Input() public set zoomControl(zoomControl: TimelogZoomControl) { this._zoomControl = zoomControl; }
  @Input() public set availability(availability: TimeScheduleItem[]){ this._availability = availability; }

  public get availability(): TimeScheduleItem[] { return this._availability; }
  public get rows(): TimeSelectionRow[] { return this._rows; }
  
  ngOnInit() {
    this._buildRows(this._calculateDivisor());

    console.log(" TO DO : start in this component ")
    // console.log("Column availability: ", this.availability)
    
    // if (this._zoomControl) {
    //   console.log("zoom control:", this._zoomControl);
    //   const divisor: number = this._calculateDivisor();
    //   this._buildRows(divisor);
    // } else {
    //   console.log('Error, no zoomControl in time-selection-column');
    // }
  }

  

  public onMouseLeave() {

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
      newRow.isAvailable = this._checkAvailability(newRow);
      newRow.nextAvailabilityChange = this._findNextAvailabilityChange(newRow);
      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }

    this._rows = rows;
    // this._updateMouseEventSubscriptions();
    // console.log("This._rows is " + this._rows.length + " , ", this._rows);
  }


  public onMouseDownRow(row: TimeSelectionRow) {
    // console.log("Row mouse down" + row.startTime.format("hh:mm a"))
    if(row.isAvailable){
      this._mouseDownRow = row;
    }else{
      this._mouseDownRow = null;
      this._mouseUpRow = null;
      this._mouseOverRow = null;
    }
  }

  public onMouseUpRow(row: TimeSelectionRow) {
    console.log("Row mouse up " + row.startTime.format("hh:mm a") + " - is Available?  " + row.isAvailable);
    if (this._mouseDownRow) {
      if(row.isAvailable){
        this._mouseUpRow = row;
      }else{
        if(!this._mouseUpRow){
          if(this._mouseOverRow){
            console.log("Setting mouseUp row to mouseOver row");
            this._mouseUpRow = this._mouseOverRow;
          }else{
            console.log("Setting mouseUp row to mouseDown row");
            this._mouseUpRow = this._mouseDownRow;
          }
        }
      }
      this._createNewTimeMarks();
    } else {
      console.log("  No mouseDownRow")
      this._mouseDownRow = null;
      this._mouseUpRow = null;
      this._mouseOverRow = null;
    }
  }

  public onMouseEnterRow(row: TimeSelectionRow) {
    if (this._mouseDownRow) {
      this._mouseOverRow = row;
      if(this._mouseOverRow.isAvailable){
        this._drawNewTimelogEntry();
      }
      
    }
  }

  public onMouseLeaveRow(row: TimeSelectionRow) {

  }

  /**
   * Find the next time that the availability changes value.
   * For example, if currentNewRow.isAvailable === true, 
   * then find the next time at which .isAvailable becomes false.
   * @param newRow current row
   */
  private _findNextAvailabilityChange(currentNewRow): moment.Moment{ 
    // console.log("To do:  start here.")
    const currentRowIndex = this.rows.indexOf(currentNewRow);
    // const 
    return null;
  }


  private _drawNewTimelogEntry() {
    // console.log("Drawing New Timelog Entry?!?!? !? ?! ?!")
    // console.log("  From:  " + this._mouseDownRow.startTime.format('hh:mm a'))
    // console.log("  To:    " + this._mouseOverRow.startTime.format('hh:mm a'))
    this.drawNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseOverRow.startTime))
  }


  private _createNewTimeMarks() {
    // console.log("Creating a new Timelog Entry from a drag event: ")
    // console.log("    from " + this._mouseDownRow.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._mouseUpRow.startTime.format('YYYY-MM-DD hh:mm a'))
    if (this._mouseDownRow.startTime.isSame(this._mouseUpRow.startTime) && this._mouseDownRow.endTime.isSame(this._mouseUpRow.endTime)) {
      // console.log("single click : " + this._mouseDownRow.startTime.format('hh:mm a'))
    } else {
      // console.log("Dragged range : " + this._mouseDownRow.startTime.format('hh:mm a') + this._mouseUpRow.startTime.format('hh:mm a'));
      this.createNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseUpRow.startTime));
    }

    this._mouseDownRow = null;
    this._mouseUpRow = null;
    this._mouseOverRow = null;

  }

  private _checkAvailability(newRow: TimeSelectionRow): boolean {
    /*  
      Reminder:  isAvailable === !isActive  
    */
    let isActive: boolean = false;
    let foundWholeRowSpan = this.availability.find(item => {
      return newRow.startTime.isSameOrAfter(item.startTime) && newRow.endTime.isSameOrBefore(item.endTime);
    });
    if (foundWholeRowSpan) {
      isActive = foundWholeRowSpan.hasValue;
    } else {
      let foundStart = this.availability.find(item => {
        return newRow.startTime.isSameOrAfter(item.startTime) && newRow.startTime.isSameOrBefore(item.endTime);
      });
      let foundEnd = this.availability.find(item => {
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
