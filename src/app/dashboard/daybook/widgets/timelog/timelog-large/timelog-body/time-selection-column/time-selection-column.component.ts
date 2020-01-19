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
  private _mouseDownRow: TimeSelectionRow;
  private _mouseUpRow: TimeSelectionRow;
  private _mouseOverRow: TimeSelectionRow;
  
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
  public get isActive(): boolean { return (this._mouseDownRow ? true : false); }
  public get startTime(): moment.Moment { return this.zoomControl.startTime; }
  public get endTime(): moment.Moment { return this.zoomControl.endTime; }

  ngOnInit() {
    this._timeDelineations = this.daybookService.activeDayController.timeDelineations;
    this.daybookService.activeDayController$.subscribe((valueChanged) => {
      this._timeDelineations = valueChanged.timeDelineations;
      this._buildRows(this._calculateDivisor());
    });
  }

  public onMouseLeave() {
    this._mouseIsInComponent = false;
    // this._reset();
    if (!this._mouseDownRow) {
      this._reset();
    }
  }
  public onMouseEnter() {
    // this._mouseIsInComponent = true; 
  }

  public onMouseDownRow(row: TimeSelectionRow) {
    // console.log("Row mouse down" + row.startTime.format("hh:mm a"))
    if (row.isAvailable) {
      this._mouseDownRow = row;
      if (this._mouseDownRow.delineator) {
        this.onDeleteDelineator(this._mouseDownRow.delineator.time);
      } else {
        this._drawNewTimeDelineator(this._mouseDownRow);
      }

    } else {
      this._reset();
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
      if (this._mouseUpRow.startTime.isSame(this._mouseDownRow.startTime)) {

        this._saveNewTimeDelineator(this._mouseDownRow);
      } else if (this._mouseUpRow.startTime.isBefore(this._mouseDownRow.startTime)) {
        this._saveNewTimelogEntry(this._mouseUpRow, this._mouseDownRow);
      } else if (this._mouseUpRow.startTime.isAfter(this._mouseDownRow.startTime)) {
        this._saveNewTimelogEntry(this._mouseDownRow, this._mouseUpRow);
      } else {
        console.log('Error with time values');
      }
    }
    this._reset();
  }

  public onMouseEnterRow(enterRow: TimeSelectionRow) {
    if (this._mouseDownRow) {
      this._mouseOverRow = enterRow;
      if (enterRow.isAvailable) {
        this.rows.forEach((existingRow) => {
          if (existingRow !== this._mouseDownRow) {
            existingRow.reset();
          }
        });
        this._drawNewTimeDelineator(this._mouseOverRow);
        this._drawNewTimelogEntry();
      } else {
        let nextAvailability: moment.Moment, prevAvailability: moment.Moment;
        if (this._mouseOverRow.startTime.isBefore(this._mouseDownRow.startTime)) {
          nextAvailability = this.daybookService
            .activeDayController.getNextOccurrenceOfValue(this._mouseOverRow.startTime, DaybookAvailabilityType.AVAILABLE);
        } else {
          prevAvailability = this.daybookService
            .activeDayController.getNextOccurrenceOfNotValue(this._mouseDownRow.startTime, DaybookAvailabilityType.AVAILABLE);
          if (prevAvailability) {
            this.rows.forEach((existingRow) => {
              if (existingRow !== this._mouseDownRow) {
                existingRow.reset();
              }
            });
          }
        }
        if (nextAvailability || prevAvailability) {
          let newDelineator: TimelogDelineator;
          this.rows.forEach((existingRow) => {
            if (existingRow !== this._mouseDownRow) {
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
    } else {
      this._reset();
    }
  }

  public onMouseLeaveRow(row: TimeSelectionRow) { }

  public onDeleteDelineator(time: moment.Moment) {
    // console.log("onclickdelete")

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
    this._rows.forEach((row) => {
      row.reset();
    });
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
      // console.log(" " + i + " :" + currentTime.format('hh:mm a') + " to " + moment(currentTime).add(divisorMinutes, 'minutes').format('hh:mm a'))
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow.isAvailable = this._isAvailable(newRow);
      let delineator = this._findDelineator(newRow);
      if (delineator) {
        newRow.setDelineator(delineator);
      }
      rows.push(newRow);
      currentTime = moment(currentTime).add(divisorMinutes, 'minutes');
    }
    this._rows = rows;
  }

  private _isAvailable(newRow) {
    return this.daybookService.activeDayController.isRowAvailable(newRow.startTime, newRow.endTime);
  }
  private _findDelineator(newRow): moment.Moment {
    return this._timeDelineations.find(item =>
      item.isSameOrAfter(newRow.startTime) && item.isBefore(newRow.endTime));
  }

  private _drawNewTimelogEntry() {
    if (this._mouseDownRow.startTime.isBefore(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseDownRow.startTime, this._mouseOverRow.startTime))
    } else if (this._mouseDownRow.startTime.isAfter(this._mouseOverRow.startTime)) {
      this.drawNewTLE.emit(new TimelogEntryItem(this._mouseOverRow.startTime, this._mouseDownRow.startTime))
    } else if (this._mouseDownRow.startTime.isSame(this._mouseOverRow.startTime)) {
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

    // console.log("Saving delinetaor.", actionRow)
    this._timeDelineations.push(actionRow.startTime);
    this._timeDelineations = this._timeDelineations.sort((item1, item2) => {
      if (item1.isBefore(item2)) { return -1; }
      else if (item1.isAfter(item2)) { return 1; }
      else { return 0; }
    })
    this._buildRows(this._calculateDivisor());
    this.daybookService.activeDayController.saveTimeDelineator$(actionRow.startTime);
  }

  private _saveNewTimelogEntry(startRow: TimeSelectionRow, endRow: TimeSelectionRow) {
    console.log("Opening new Timelog entry.")
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
