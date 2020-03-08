import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from "./timelog-delineator.class";
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';
import { TimeScheduleItem } from '../../../../shared/utilities/time-utilities/time-schedule-item.class';

export class TimelogDisplayGrid {

  constructor(startTime: moment.Moment, endTime: moment.Moment, delineators: TimelogDelineator[], activeDayController: DaybookController) {
    console.log("Constructing timelogDisplayGrid: delineators: ", delineators);
    this._startTime = moment(startTime);
    this._endTime = moment(endTime);
    this._timeDelineators = delineators;
    this._activeController = activeDayController;
    this._buildGrid();
  }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment
  private _timeDelineators: TimelogDelineator[];
  private _activeController: DaybookController;


  private _gridItems: TimelogDisplayGridItem[] = [];

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }
  public get totalViewMilliseconds(): number { return this._endTime.diff(this._startTime, 'milliseconds') };
  public get timeDelineators(): TimelogDelineator[] { return this._timeDelineators; }
  public get gridItems(): TimelogDisplayGridItem[] { return this._gridItems; }

  public ngStyle: any = {};


  public drawTimelogEntry(drawTLE: TimelogEntryItem) {
    if (drawTLE) {
      const foundItem = this.gridItems.find((gridItem) => {
        return drawTLE.startTime.isSameOrAfter(gridItem.startTime) && drawTLE.endTime.isSameOrBefore(gridItem.endTime);
      });
      if (foundItem) {
        this.gridItems.forEach(item => item.stopDrawing());
        foundItem.onDrawTimelogEntry(drawTLE);
      } else {
        this.gridItems.forEach(item => item.stopDrawing());
        console.log('Error : no found item to draw timelog entry')
      }
    } else {
      this.gridItems.forEach(item => item.stopDrawing());
    }
  }

  public createTimelogEntry(drawTLE: TimelogEntryItem) {
    if (drawTLE) {
      const foundItem = this.gridItems.find((gridItem) => {
        return drawTLE.startTime.isSameOrAfter(gridItem.startTime) && drawTLE.endTime.isSameOrBefore(gridItem.endTime);
      });
      if (foundItem) {
        this.gridItems.forEach(item => item.stopCreating());
        foundItem.onCreateTimelogEntry(drawTLE);
      } else {
        this.gridItems.forEach(item => item.stopCreating());
        console.log('Error : no found item to draw timelog entry')
      }
    }
  }

  public setActiveItemByIndex(currentActiveIndex: number) {

    this.gridItems.forEach((item) => {
      item.isActiveFormItem = false;
    });
    this.gridItems[currentActiveIndex].isActiveFormItem = true;
  }

  private _buildGrid() {

    // console.log("Building grid.")
    // this._activeController.logFullScheduleItems();

    console.log("Time delineators: ", this._timeDelineators)
    const checkValues = this.totalViewMilliseconds - (this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'));
    if (checkValues !== 0) {
      console.log("Error:  mismatching times:")
      console.log("  ZoomControl ms: " + this.totalViewMilliseconds);
      console.log("   Calculated ms: " + this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'))
    } else {
      // at the very minimum there will be 2:  FRAME_START and FRAME_END delineators.
      if (this.timeDelineators.length >= 2) {

        let displayGridNgStyle: any = {};
        let currentTime: moment.Moment = this.timeDelineators[0].time;
        let gridItems: TimelogDisplayGridItem[] = [];
        gridItems = this._activeController.getScheduleSlice(this.startTime, this.endTime).map((scheduleItem: TimeScheduleItem<DaybookAvailabilityType>) => {
          const diff: number = scheduleItem.endTime.diff(scheduleItem.startTime, 'milliseconds');
          const percent = (diff / this.totalViewMilliseconds) * 100;
          return new TimelogDisplayGridItem(scheduleItem.startTime, scheduleItem.endTime, percent, scheduleItem.value);
        });
        gridItems.forEach((gridItem) => {
          this._activeController.timelogEntryItems.forEach((timelogEntry) => {
            if (timelogEntry.startTime.isSameOrAfter(gridItem.startTime) && timelogEntry.endTime.isSameOrBefore(gridItem.endTime)) {
              gridItem.timelogEntries.push(timelogEntry);
            } else {

            }
          })
        });
        let length = gridItems.length;
        for (let i = 1; i < length; i++) {
          if (gridItems[i - 1].availability === gridItems[i].availability) {
            let merge = false;
            if (gridItems[i].availability === DaybookAvailabilityType.TIMELOG_ENTRY) {
              /**
               * This is the part where it is determined at which percentage to cut off small items and merge them into bigger items.
               */
              const minPercent = 4.75;
              const smallPercent = 6;
              if ((gridItems[i].percent < minPercent) || (gridItems[i - 1].percent < minPercent)) {
                merge = true;
              } else if (gridItems[i].percent < smallPercent) {
                gridItems[i].isSmallGridItem = true;
              }
            } else if (gridItems[i].availability === DaybookAvailabilityType.AVAILABLE) {
              merge = false;
            } else {
              merge = true;
            }
            if (merge) {
              gridItems[i].timelogEntries.forEach((tle)=> gridItems[i - 1].timelogEntries.push(tle));
              gridItems[i - 1].percent = gridItems[i - 1].percent + gridItems[i].percent;
              gridItems[i - 1].endTime = gridItems[i].endTime;
              gridItems[i - 1].isMerged = true;
              gridItems.splice(i, 1);
              length = gridItems.length;
              i--;
            }
          }
        }
        let gridTemplateRows: string = "";
        gridItems.forEach((gridItem) => {
          gridTemplateRows += "" + gridItem.percent.toFixed(3) + "% ";
        });
        displayGridNgStyle['grid-template-rows'] = gridTemplateRows;
        this.ngStyle = displayGridNgStyle;
        this._gridItems = gridItems;
      } else {
        console.log("Bigtime error: No Time Delineators.  ")
      }
    }
  }

  public updateOnToolChange(toolChange: { startTime: moment.Moment, endTime: moment.Moment }) {
    if (toolChange) {
      // console.log("Tool change "  +  toolChange.startTime.format('YYYY-MM-DD hh:mm a') + " to " + toolChange.endTime.format('YYYY-MM-DD hh:mm a'))

      const foundItem = this.gridItems.find((item) => {
        const startsAfterStart = item.startTime.isSameOrAfter(toolChange.startTime);
        const startsBeforeEnd = item.startTime.isSameOrBefore(toolChange.endTime);
        const endsAfterStart = item.endTime.isSameOrAfter(toolChange.startTime);
        const endsBeforeEnd = item.endTime.isSameOrBefore(toolChange.endTime);
        return startsAfterStart && startsBeforeEnd && endsAfterStart && endsBeforeEnd;
      });
      if (foundItem) {
        this.gridItems.forEach((item) => {
          item.isActiveFormItem = false;
        });
        foundItem.isActiveFormItem = true;
      } else {
        console.log("Error: unable to find grid item from toolChange " + toolChange.startTime.format('hh:mm a') + " to " + toolChange.endTime.format('hh:mm a'))
      }
    } else {
      this.gridItems.forEach((item) => {
        item.isActiveFormItem = false;
      });
    }

  }

}