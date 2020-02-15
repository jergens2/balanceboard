import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import * as moment from 'moment';
import { TimeSelectionRow } from '../time-selection-row/time-selection-row.class';
import { Subscription } from 'rxjs';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';
import { DaybookAvailabilityType } from '../../../../../controller/items/daybook-availability-type.enum';
import { TimelogEntryFormService } from '../../../timelog-entry-form/timelog-entry-form.service';
import { DaybookDisplayService } from '../../../../../daybook-display.service';

@Component({
  selector: 'app-time-selection-column',
  templateUrl: './time-selection-column.component.html',
  styleUrls: ['./time-selection-column.component.css']
})
export class TimeSelectionColumnComponent implements OnInit {

  constructor(private daybookDisplayService: DaybookDisplayService, private tlefService: TimelogEntryFormService) { }

  private _rows: TimeSelectionRow[] = [];
  private _mouseIsInComponent: boolean;
  private _startRow: TimeSelectionRow;
  private _endRow: TimeSelectionRow;
  private _timeDelineators: TimelogDelineator[] = [];

  @Output() drawNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Output() createNewTLE: EventEmitter<TimelogEntryItem> = new EventEmitter();
  @Input() public set timeDelineators(delineators: TimelogDelineator[]) {
    this._timeDelineators = delineators;

    this._buildRows(this._calculateDivisor());

  }

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

  ngOnInit() {
    this._buildRows(this._calculateDivisor());
    this.daybookDisplayService.displayUpdated$.subscribe((changed) => {
      this._buildRows(this._calculateDivisor());
    });
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
    this.daybookDisplayService.activeDayController.updateDelineator(originalTime, saveNewDelineator);
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
    if(!startTime.isSame(endTime)){
      this.drawNewTLE.emit(new TimelogEntryItem(startTime, endTime));
    }else{
      this.drawNewTLE.emit(null);
    }

    // this._drawNewTimelogEntry(startTime, endTime);
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

    if (this.endRow  && !this.endRow.startTime.isSame(this.startRow.startTime)) {
      const dragTimes = this._buildSection();
      const startTime = dragTimes.startTime;
      const endTime = dragTimes.endTime;
      this._saveNewTimelogEntry(startTime, endTime);
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
        this._buildRows(this._calculateDivisor());
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

  private _buildRows(divisorMinutes: number) {
    this._reset();
    const durationMinutes: number = this.endTime.diff(this.startTime, 'minutes');
    const rowCount = durationMinutes / divisorMinutes;
    const rows: TimeSelectionRow[] = [];
    let currentTime: moment.Moment = moment(this.startTime);
    for (let i = 0; i < rowCount; i++) {
      // console.log(" " + i + " :" + currentTime.format('hh:mm a') + " to " + moment(currentTime).add(divisorMinutes, 'minutes').format('hh:mm a'))
      let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(divisorMinutes, 'minutes'), i);
      newRow.isAvailable = this.daybookDisplayService.activeDayController.isRangeAvailable(newRow.startTime, newRow.endTime);
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
    return this.daybookDisplayService.activeDayController.getEarliestAvailability(rowStart);
  }
  private _getLatestAvailability(rowStart: moment.Moment): moment.Moment {
    return this.daybookDisplayService.activeDayController.getLatestAvailability(rowStart);
  }


  private _rowSubscriptions: Subscription[] = [];
  private _updateRowSubscriptions() {
    this._rowSubscriptions.forEach(s => s.unsubscribe());
    this._rowSubscriptions = [];
    const deleteSubscriptions = this.rows.map(row => row.deleteDelineator$.subscribe((del: moment.Moment) => {
      this._onDeleteDelineator(del);
    }));
    const editSubscriptions = this.rows.map(row => row.editDelineator$.subscribe((saveNewDelineator: moment.Moment) => {
      this.onEditDelineator(row.timelogDelineator.time, saveNewDelineator);
    }));
    const startDragSubs = this.rows.map(row => row.startDragging$.subscribe((startDragging: TimeSelectionRow) => {
      if (startDragging) { this._startDragging(startDragging); }
    }));
    const updateDragSubs = this.rows.map(row => row.updateDragging$.subscribe((updateDragging: TimeSelectionRow) => {
      if (updateDragging) { this._updateDragging(updateDragging); }
    }));
    const stopDragSbus = this.rows.map(row => row.stopDragging$.subscribe((stopDragging: TimeSelectionRow) => {
      if (stopDragging) { this._stopDragging(stopDragging); }
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
    const availableItems = this.daybookDisplayService.activeDayController
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
    const availableItems = this.daybookDisplayService.activeDayController.fullScheduleItems
      .filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].startTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }
  private _getSectionEnd(sectionIndex: number): moment.Moment {
    const availableItems = this.daybookDisplayService.activeDayController.fullScheduleItems
      .filter(item => item.value === DaybookAvailabilityType.AVAILABLE);
    if (availableItems.length >= sectionIndex + 1) {
      return availableItems[sectionIndex].endTime;
    } else {
      console.log('Error with finding section end time.');
      return null;
    }
  }


  private _findDelineator(newRow: TimeSelectionRow): TimelogDelineator {
    const priority = [
      TimelogDelineatorType.FRAME_START,
      TimelogDelineatorType.FRAME_END,
      TimelogDelineatorType.NOW,
      TimelogDelineatorType.WAKEUP_TIME,
      TimelogDelineatorType.FALLASLEEP_TIME,
      TimelogDelineatorType.SAVED_DELINEATOR,
      TimelogDelineatorType.TIMELOG_ENTRY_START,
      TimelogDelineatorType.TIMELOG_ENTRY_END,
      TimelogDelineatorType.DAY_STRUCTURE,
    ];
    const percentThreshold: number = 0.03;
    const totalViewMS = this.endTime.diff(this.startTime, 'milliseconds');
    const rangeMS = totalViewMS * percentThreshold;
    const rangeStart = moment(newRow.startTime).subtract(rangeMS, 'milliseconds');
    const rangeEnd = moment(newRow.startTime).add(rangeMS, 'milliseconds');
    const foundRangeItems = this.timeDelineators.filter(item => {
      return item.time.isSameOrAfter(rangeStart) && item.time.isSameOrBefore(rangeEnd);
    });
    if (foundRangeItems.length > 0) {
      const foundItems = this.timeDelineators.filter(item =>
        item.time.isSameOrAfter(newRow.startTime) && item.time.isBefore(newRow.endTime));
      let foundDelineator: TimelogDelineator;
      if (foundItems.length > 0) {
        if (foundItems.length === 1) {
          foundDelineator = foundItems[0];
        } else if (foundItems.length > 1) {

          let foundItem = foundItems[0];
          for (let i = 1; i < foundItems.length; i++) {
            if (priority.indexOf(foundItems[i].delineatorType) < priority.indexOf(foundItems[i - 1].delineatorType)) {
              foundItem = foundItems[i];
            }
          }
          foundDelineator = foundItem;
        }
        if (foundRangeItems.length == 1) {
          return foundDelineator;
        } else if (foundRangeItems.length > 1) {
          if (priority.indexOf(foundDelineator.delineatorType) <= 8) {
            // console.log("its less than or equal to 5: " , priority[priority.indexOf(foundDelineator.delineatorType)])
            return foundDelineator
          } else {
            // console.log("its greater than 5: " , priority[priority.indexOf(foundDelineator.delineatorType)])
            let mostPriority = priority.indexOf(foundRangeItems[0].delineatorType);
            for (let i = 0; i < foundRangeItems.length; i++) {
              let thisItemPriority = priority.indexOf(foundRangeItems[i].delineatorType);
              if (thisItemPriority < mostPriority) {
                mostPriority = thisItemPriority;
              }
            }
            if (priority.indexOf(foundDelineator.delineatorType) === mostPriority) {
              return foundDelineator;
            }
          }
        }
      }
    }
    return null;
  }



  private _saveNewTimeDelineator(actionRow: TimeSelectionRow) {
    const maxDelineators = 16;
    let saveAllDelineators: moment.Moment[] = [];
    const existingValues = this.daybookDisplayService.activeDayController.savedTimeDelineators;
    5
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
    this._buildRows(this._calculateDivisor());
  }

  private _saveNewTimelogEntry(startTime: moment.Moment, endTime: moment.Moment) {
    const saveNewTLE = new TimelogEntryItem(startTime, endTime);
    this.tlefService.openTimelogEntry(saveNewTLE);
    // console.log("Opening new TLE: " + startTime.format('hh:mm a') + " to " + endTime.format('hh:mm a'))

    this._reset();
    this.createNewTLE.emit(saveNewTLE);
  }


  private _calculateDivisor(): number {

    // for performance reasons we don't want too many, but for functionality reasons we don't want too few.
    //  100-200 seems like a pretty good range.
    const nearestTo = 100;
    const durationMinutes: number = this.endTime.diff(this.startTime, 'minutes');
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