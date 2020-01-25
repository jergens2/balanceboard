import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from "./timelog-delineator.class";
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';

export class TimelogDisplayGrid {

  constructor(startTime: moment.Moment, endTime: moment.Moment, delineators: TimelogDelineator[], activeDayController: DaybookController) {
    this._startTime = moment(startTime);
    this._endTime = moment(endTime);
    this._timeDelineators = delineators;
    this._activeController = activeDayController;

    // console.log("Building TimelogDisplayGrid: (startTime, endTime, delineators, activeDayController", startTime, endTime, delineators, activeDayController )
    this._buildGrid();
    console.log("TimelogDisplayGrid is built.")
    this.gridItems.forEach((item) => {
      console.log("   " + item.type + " : " + item.startTime.format('hh:mm a') + " to " + item.endTime.format('hh:mm a'))
    })

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



  private _buildGrid() {
    

    const scheduleSlice = this._activeController.getScheduleSlice(this.startTime, this.endTime);
    // scheduleSlice.forEach((item)=>{ console.log("   "+item.toString())})

    let allDelineatorTimes: moment.Moment[] = this.timeDelineators.map(item => item.time).sort((time1, time2) => {
      if (time1.isBefore(time2)) { return -1; }
      else if (time1.isAfter(time2)) { return 1; }
      else { return 0; }
    });
    let reducedTimes: moment.Moment[] = [allDelineatorTimes[0]];
    for (let i = 1; i < allDelineatorTimes.length; i++) {
      const foundItem = reducedTimes.find(item => item.isSame(allDelineatorTimes[i]));
      if (!foundItem) {
        reducedTimes.push(allDelineatorTimes[i]);
      }
    }
    allDelineatorTimes = reducedTimes;
    // console.log("All delineator times: ")
    // reducedTimes.forEach((item) => {
    //   console.log("    " + item.format('YYYY-MM-DD hh:mm a'))
    // })
    const checkValues = this.totalViewMilliseconds - (this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'));
    if (checkValues !== 0) {
      console.log("Error:  mismatching times:")
      console.log("  ZoomControl ms: " + this.totalViewMilliseconds);
      console.log("   Calculated ms: " + this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'))
    } else {
      // at the very minimum there shall always be 2:  FRAME_START and FRAME_END delineators.
      if (this.timeDelineators.length >= 2) {
        let displayGridNgStyle: any = {};
        let currentTime: moment.Moment = this.timeDelineators[0].time;
        let gridItems: TimelogDisplayGridItem[] = [];
        for (let i = 1; i < this.timeDelineators.length; i++) {
          // console.log("Grid item times: " + this.timeDelineators[i - 1].time.format('YYYY-MM-DD hh:mm a') + " to " + this.timeDelineators[i].time.format('YYYY-MM-DD hh:mm a'))
          let timelogEntry: TimelogEntryItem;
          const diff: number = this.timeDelineators[i].time.diff(currentTime, 'milliseconds');
          const percent = (diff / this.totalViewMilliseconds) * 100;
          const startTime = this.timeDelineators[i - 1].time;
          const endTime = this.timeDelineators[i].time;
          const typeFound: DaybookAvailabilityType = this._getGridItemType(this.timeDelineators[i - 1].delineatorType, this.timeDelineators[i].delineatorType);
          if (typeFound) {
            const newGridItem = new TimelogDisplayGridItem(startTime, endTime, percent, typeFound);
            if (typeFound === DaybookAvailabilityType.TIMELOG_ENTRY) {
              newGridItem.timelogEntries = [this._activeController.timelogEntryItems.find(tle => tle.startTime.isSame(startTime))];
            }
            gridItems.push(newGridItem);
            currentTime = moment(this.timeDelineators[i].time);
          } else {

          }
        }
        let length = gridItems.length;
        for (let i = 1; i < length; i++) {
          if (gridItems[i - 1].type === gridItems[i].type && gridItems[i].type) {
            let merge = false;
            if (gridItems[i].type === DaybookAvailabilityType.TIMELOG_ENTRY) {
              const minPercent = 4.75;
              const smallPercent = 6; // from 4.75 to 6
              if ((gridItems[i].percent < minPercent) || (gridItems[i - 1].percent < minPercent)) {
                // console.log("one of the items was less than minPercent " + minPercent, gridItems[i].percent, gridItems[i-1].percent )
                merge = true;
                gridItems[i-1].timelogEntries.push(...gridItems[i].timelogEntries);
              }else if(gridItems[i].percent < smallPercent){
                gridItems[i].isSmallGridItem = true;
              }
            } else {
              merge = true;
            }
            if (merge) {
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



  private _getGridItemType(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
    let startsWith: DaybookAvailabilityType = this._gridItemStartsWith(startDelineator, endDelineator);
    let endsWith: DaybookAvailabilityType = this._gridItemEndsWith(startDelineator, endDelineator);
    if (startsWith) {
      return startsWith;
    } else {
      if (endsWith) {
        return endsWith;
      } else {
        // console.log('Error:  could not find a grid item type from the provided delineators (start, end): ', startDelineator, endDelineator)
        return null;
      }
    }
  }


  private _gridItemStartsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
    if (startDelineator === TimelogDelineatorType.FALLASLEEP_TIME) {
      return DaybookAvailabilityType.SLEEP;
    } else if (startDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
      return DaybookAvailabilityType.TIMELOG_ENTRY;
    } else if (startDelineator === TimelogDelineatorType.NOW) {
      if (endDelineator === TimelogDelineatorType.FALLASLEEP_TIME ||
        endDelineator === TimelogDelineatorType.FRAME_END ||
        endDelineator === TimelogDelineatorType.DAY_STRUCTURE ||
        endDelineator === TimelogDelineatorType.SAVED_DELINEATOR ||
        endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
        return DaybookAvailabilityType.AVAILABLE;
      }
    }
    return null;
  }
  private _gridItemEndsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): DaybookAvailabilityType {
    if (endDelineator === TimelogDelineatorType.WAKEUP_TIME) {
      return DaybookAvailabilityType.SLEEP;
    } else if (endDelineator === TimelogDelineatorType.NOW) {
      return DaybookAvailabilityType.AVAILABLE;
    } else if (endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_END) {
      return DaybookAvailabilityType.TIMELOG_ENTRY;
    }
    return null;
  }

}