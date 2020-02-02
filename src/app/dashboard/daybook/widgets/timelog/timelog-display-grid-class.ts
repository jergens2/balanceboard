import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from "./timelog-delineator.class";
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';
import { TimeScheduleItem } from '../../../../shared/utilities/time-utilities/time-schedule-item.class';

export class TimelogDisplayGrid {

  constructor(startTime: moment.Moment, endTime: moment.Moment, delineators: TimelogDelineator[], activeDayController: DaybookController) {
    this._startTime = moment(startTime);
    this._endTime = moment(endTime);
    this._timeDelineators = delineators;
    this._activeController = activeDayController;

    // console.log("Building TimelogDisplayGrid: (startTime, endTime, delineators, activeDayController", startTime, endTime, delineators, activeDayController )
    this._buildGrid();
    // console.log("TimelogDisplayGrid is built. (" + this.gridItems.length + " grid items)")
    // this.gridItems.forEach((item) => {
    //   console.log("   " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a') + " : " + item.type)
    // })

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
    if(drawTLE){
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
    }else{
      this.gridItems.forEach(item => item.stopDrawing());
    }
  }

  public createTimelogEntry(drawTLE: TimelogEntryItem){
    if(drawTLE){
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

  private _buildGrid() {
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
              // from 4.75 to 6 
              const minPercent = 4.75;
              const smallPercent = 6; 
              console.log("Grid item percent: " + gridItems[i].percent)
              if ((gridItems[i].percent < minPercent) || (gridItems[i - 1].percent < minPercent)) {
                console.log("one of the items was less than minPercent " + minPercent, gridItems[i].percent, gridItems[i-1].percent )
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
              console.log("MERGE")
              gridItems[i - 1].timelogEntries.push(...gridItems[i].timelogEntries);
              gridItems[i - 1].percent = gridItems[i - 1].percent + gridItems[i].percent;
              gridItems[i - 1].endTime = gridItems[i].endTime;
              gridItems.splice(i, 1);
              length = gridItems.length;
              i--;
            }
          }
        }

        let gridTemplateRows: string = "";
        gridItems.forEach((gridItem) => {
          // console.log("PERCENTAGE:  " + gridItem.percent + " item: " + gridItem.type + " start: " + gridItem.startTime.format('hh:mm a') + " to end: " + gridItem.endTime.format('hh:mm a'))
          gridTemplateRows += "" + gridItem.percent.toFixed(3) + "% ";
        });
        displayGridNgStyle['grid-template-rows'] = gridTemplateRows;
        // console.log("Display grid style: ", displayGridNgStyle);
        // console.log("grid items:  ", gridItems);
        this.ngStyle = displayGridNgStyle;
        this._gridItems = gridItems;
      } else {
        console.log("Bigtime error: No Time Delineators.  ")
      }
    }
  }



  // private _getGridItemType(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
  //   let startsWith: DaybookAvailabilityType = this._gridItemStartsWith(startDelineator, endDelineator);
  //   let endsWith: DaybookAvailabilityType = this._gridItemEndsWith(startDelineator, endDelineator);
  //   if (startsWith) {
  //     return startsWith;
  //   } else {
  //     if (endsWith) {
  //       return endsWith;
  //     } else {
  //       // console.log('Error:  could not find a grid item type from the provided delineators (start, end): ', startDelineator, endDelineator)
  //       return null;
  //     }
  //   }
  // }


  // private _gridItemStartsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
  //   if (startDelineator === TimelogDelineatorType.FALLASLEEP_TIME) {
  //     return DaybookAvailabilityType.SLEEP;
  //   } else if (startDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
  //     return DaybookAvailabilityType.TIMELOG_ENTRY;
  //   } else if (startDelineator === TimelogDelineatorType.NOW) {
  //     if (endDelineator === TimelogDelineatorType.FALLASLEEP_TIME ||
  //       endDelineator === TimelogDelineatorType.FRAME_END ||
  //       endDelineator === TimelogDelineatorType.DAY_STRUCTURE ||
  //       endDelineator === TimelogDelineatorType.SAVED_DELINEATOR ||
  //       endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
  //       return DaybookAvailabilityType.AVAILABLE;
  //     }
  //   } else if (startDelineator === TimelogDelineatorType.SAVED_DELINEATOR) {
  //     return DaybookAvailabilityType.AVAILABLE;
  //   }
  //   return null;
  // }
  // private _gridItemEndsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
  //   if (endDelineator === TimelogDelineatorType.WAKEUP_TIME) {
  //     return DaybookAvailabilityType.SLEEP;
  //   } else if (endDelineator === TimelogDelineatorType.NOW) {
  //     return DaybookAvailabilityType.AVAILABLE;
  //   } else if (endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_END) {
  //     return DaybookAvailabilityType.TIMELOG_ENTRY;
  //   }
  //   return null;
  // }

}