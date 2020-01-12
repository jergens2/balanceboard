
import { TimelogZoomControl } from './timelog-large/timelog-zoom-controller/timelog-zoom-control.interface';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from './timelog-delineator.class';
import { faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { DaybookController } from '../../controller/daybook-controller.class';
import { TimelogDisplayGridItemType } from './timelog-display-grid-item.enum';

export class TimelogDisplayController {

  /**
   * The TimelogDisplayController is the primary class for the production of the Timelog widget in the daybook, used by timelog-body.component
   */
  constructor(timelogZoomControl: TimelogZoomControl, activeDayController: DaybookController, minutesPerTwentyPixels: number) {
    this._timelogZoomControl = timelogZoomControl;
    this._activeDayController = activeDayController;
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    this._update();
  }

  private _log: string[] = [];
  private _minutesPerTwentyPixels: number;
  private _timelogZoomControl: TimelogZoomControl;
  private _timeDelineators: TimelogDelineator[] = [];
  private _entryItems: TimelogEntryItem[] = [];
  private _activeDayController: DaybookController;

  private _displayGridNgStyle: any = {};
  private _gridItems: TimelogDisplayGridItemType[] = [];
  // private _entryItemsNgStyle: any = { 'grid-template-rows': '1fr' };
  // private _timeDelineatorsNgStyle: any = { 'grid-template-rows': '1fr' };

  private _defaultDayStructureTimes: moment.Moment[] = [];


  public faMoon = faMoon;
  public faSun = faSun;

  public get frameStart(): moment.Moment { return this._timelogZoomControl.startTime; }
  public get wakeupTime(): moment.Moment { return this._activeDayController.sleepController.firstWakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._activeDayController.sleepController.fallAsleepTime; }
  public get frameEnd(): moment.Moment { return this._timelogZoomControl.endTime; }

  public get gridItems(): TimelogDisplayGridItemType[] { return this._gridItems; }
  public get displayGridNgStyle(): any { return this._displayGridNgStyle; }

  // public get entryItemsNgStyle(): any { return this._entryItemsNgStyle; }
  public get entryItems(): TimelogEntryItem[] { return this._entryItems; }

  public get timeDelineators(): TimelogDelineator[] { return this._timeDelineators; }
  // public get timeDelineatorsNgStyle(): any { return this._timeDelineatorsNgStyle; }

  public get defaultDayStructureTimes(): moment.Moment[] { return this._defaultDayStructureTimes; }

  public addTimeDelineator(time: moment.Moment) {
    // if (!this.crossesAnyTimelogEntry(time)) {
    //   console.log("method disabled")
    //   // this._activeDay.timelog.addTimeDelineator(time.toISOString());
    //   // this.update();
    // }
  }
  public drawNewTLE(timelogEntry: TimelogEntryItem) {
    console.log("Timelog.Class: Drawing new TLE: ", timelogEntry)

  }
  public addTemporaryDelineator(time: moment.Moment) {

  }
  public removeTimeDelineator(delineator: TimelogDelineator) {
    console.log("method disabled")
    // this._activeDay.timelog.removeTimeDelineator(delineator.time.toISOString());
    // this.update();
  }

  public updateEntrySizes(minutesPerTwentyPixels: number) {
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    // console.log("Minutes per 20 pixels (approx): ", this._minutesPerTwentyPixels);
    this._entryItems.forEach((entryItem) => {
      if (entryItem.durationSeconds < (this._minutesPerTwentyPixels * 60)) {
        entryItem.isSmallSize = true;
      } else {
        entryItem.isSmallSize = false;
      }
    });
  }


  /**  private methods**/
  private _update() {
    this._setDefaultDayStructureTimes();
    this._loadTimelogDelineators();
    this._buildGrid();
    // this._updateTimeDelineators();
    // this._updateTimelogEntryItems();

    this._logToConsole();
  }
  private _logToConsole() {
    console.log("Constructing TimelogDisplayController - logToConsole is ON")
    this._log.forEach((logEntry) => {
      console.log("   " + logEntry);
    });
  }
  private get totalViewMilliseconds(): number {
    return this._timelogZoomControl.endTime.diff(this._timelogZoomControl.startTime, 'milliseconds');
  }

  private _buildGrid() {
    const checkValues = this.totalViewMilliseconds - (this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'));
    if (checkValues !== 0) {
      console.log("Error:  mismatching times:")
      console.log("  ZoomControl ms: " + this.totalViewMilliseconds);
      console.log("   Calculated ms: " + this._timeDelineators[this._timeDelineators.length - 1].time.diff(this._timeDelineators[0].time, 'milliseconds'))
    } else {
      if (this.timeDelineators.length >= 2) {
        let displayGridNgStyle: any = {
          "display": "grid"
        };
        let currentTime: moment.Moment = this.timeDelineators[0].time;
        let gridItemTypes: TimelogDisplayGridItemType[] = [];
        let percentages: { gridItem: TimelogDisplayGridItemType, percent: number }[] = [];
        for (let i = 1; i < this.timeDelineators.length; i++) {
          const diff: number = this.timeDelineators[i].time.diff(currentTime, 'milliseconds');
          const gridItem: TimelogDisplayGridItemType = this._getGridItem(this.timeDelineators[i - 1].delineatorType, this.timeDelineators[i].delineatorType);
          console.log("Grid item produced from: Start: " + this.timeDelineators[i - 1].delineatorType + ", End: " + this.timeDelineators[i].delineatorType + "  produces: " + gridItem)
          const percent = (diff / this.totalViewMilliseconds) * 100;
          percentages.push({
            gridItem: gridItem,
            percent: percent,
          });
          currentTime = moment(this.timeDelineators[i].time);
        }
        let percentagesLength = percentages.length;
        for (let i = 1; i < percentagesLength; i++) {
          if(percentages[i-1].gridItem === percentages[i].gridItem){
            percentages[i-1].percent = percentages[i-1].percent + percentages[i].percent;
            percentages.splice(i, 1);
            percentagesLength = percentages.length;
            i--;
          }
        }
        percentages.forEach(percentage => gridItemTypes.push(percentage.gridItem));
        let gridTemplateRows: string = "";
        percentages.forEach((percentage) => {
          console.log("PERCENTAGE:  " + percentage.percent + " item: " + percentage.gridItem)
          gridTemplateRows += "" + percentage.percent.toFixed(3) + "% ";
        });
        displayGridNgStyle['grid-template-rows'] = gridTemplateRows;
        console.log("Display grid style: ", displayGridNgStyle);
        console.log("grid items:  ", gridItemTypes);
        this._displayGridNgStyle = displayGridNgStyle;
        this._gridItems = gridItemTypes;
      } else {
        console.log("No Time Delineators.  ")
      }
    }
  }




  private _getGridItem(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): TimelogDisplayGridItemType {
    let startsWith: TimelogDisplayGridItemType = this._gridItemStartsWith(startDelineator, endDelineator);
    let endsWith: TimelogDisplayGridItemType = this._gridItemEndsWith(startDelineator, endDelineator);
    if (startsWith) {
      return startsWith;
    } else {
      if (endsWith) {
        return endsWith;
      } else {
        console.log('Error:  could not find a grid item type from the provided delineators (start, end): ', startDelineator, endDelineator)
        return null;
      }
    }
  }


  private _gridItemStartsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): TimelogDisplayGridItemType {
    if (startDelineator === TimelogDelineatorType.FALLASLEEP_TIME) {
      return TimelogDisplayGridItemType.SLEEP_END;
    } else if (startDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
      return TimelogDisplayGridItemType.TIMELOG_ENTRY;
    } else if (startDelineator === TimelogDelineatorType.NOW) {
      if (endDelineator === TimelogDelineatorType.FALLASLEEP_TIME ||
        endDelineator === TimelogDelineatorType.FRAME_END ||
        endDelineator === TimelogDelineatorType.DAY_STRUCTURE ||
        endDelineator === TimelogDelineatorType.SAVED_DELINEATOR ||
        endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_START) {
        return TimelogDisplayGridItemType.AVAILABLE;
      }
    }
    return null;
  }
  private _gridItemEndsWith(startDelineator: TimelogDelineatorType, endDelineator: TimelogDelineatorType): TimelogDisplayGridItemType {
    if (endDelineator === TimelogDelineatorType.WAKEUP_TIME) {
      return TimelogDisplayGridItemType.SLEEP_START;
    } else if (endDelineator === TimelogDelineatorType.NOW) {
      return TimelogDisplayGridItemType.AVAILABLE;
    } else if (endDelineator === TimelogDelineatorType.TIMELOG_ENTRY_END) {
      return TimelogDisplayGridItemType.TIMELOG_ENTRY;
    }
    return null;
  }


  private _loadTimelogDelineators() {
    const nowTime = moment();

    const timelogDelineators: TimelogDelineator[] = [];
    timelogDelineators.push(new TimelogDelineator(this.frameStart, TimelogDelineatorType.FRAME_START));
    timelogDelineators.push(new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME));
    if (this._activeDayController.isToday) {
      timelogDelineators.push(new TimelogDelineator(nowTime, TimelogDelineatorType.NOW));
    }
    timelogDelineators.push(new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME));
    timelogDelineators.push(new TimelogDelineator(this.frameEnd, TimelogDelineatorType.FRAME_END));

    this._activeDayController.timeDelineatorController.timeDelineations.forEach((timeDelineation) => {
      timelogDelineators.push(new TimelogDelineator(timeDelineation, TimelogDelineatorType.SAVED_DELINEATOR));
    });
    this._activeDayController.timelogEntryController.timelogEntryItems.forEach((timelogEntryItem) => {
      timelogDelineators.push(new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START));
      timelogDelineators.push(new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END));
    });

    const sortedDelineators = this._sortDelineators(timelogDelineators);
    this._timeDelineators = sortedDelineators;
    let logItems: string[] = [];
    sortedDelineators.forEach(sd => logItems.push("  Sorted Delineator: " + sd.time.format('YYYY-MM-DD hh:mm a') + " : " + sd.delineatorType))
    this._log = this._log.concat(logItems);
  }

  private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
    const sortedDelineators = timelogDelineators
      .filter((delineator) => { return delineator.time.isSameOrAfter(this.frameStart) && delineator.time.isSameOrBefore(this.frameEnd); })
      .sort((td1, td2) => {
        if (td1.time.isBefore(td2.time)) { return -1; }
        else if (td1.time.isAfter(td2.time)) { return 1; }
        else { return 0; }
      });
    let filteredDelineators: TimelogDelineator[] = [sortedDelineators[0]];
    for (let i = 1; i < sortedDelineators.length; i++) {
      const lastIndex = filteredDelineators.length - 1
      let lastFilteredDelineator = filteredDelineators[lastIndex];
      if (sortedDelineators[i].time.isSame(lastFilteredDelineator.time)) {
        const orderedTypes: TimelogDelineatorType[] = [TimelogDelineatorType.FRAME_START,
        TimelogDelineatorType.FRAME_END,
        TimelogDelineatorType.WAKEUP_TIME,
        TimelogDelineatorType.FALLASLEEP_TIME,
        TimelogDelineatorType.NOW,
        TimelogDelineatorType.TIMELOG_ENTRY_START,
        TimelogDelineatorType.TIMELOG_ENTRY_END,
        TimelogDelineatorType.SAVED_DELINEATOR,
        TimelogDelineatorType.DAY_STRUCTURE,
        ];
        const sortIndexOfExisting: number = orderedTypes.findIndex(type => {
          return type === lastFilteredDelineator.delineatorType;
        });
        const sortIndexOfNew: number = orderedTypes.findIndex(type => {
          return type === sortedDelineators[i].delineatorType;
        });
        if (sortIndexOfExisting > sortIndexOfNew) {
          filteredDelineators.splice(lastIndex, 1, sortedDelineators[i]);
        }
      } else {
        filteredDelineators.push(sortedDelineators[i]);
      }
    }
    return filteredDelineators
  }

  private _setDefaultDayStructureTimes() {
    this._defaultDayStructureTimes = [
      moment(this._activeDayController.dateYYYYMMDD).hour(0).startOf('hour'),
      moment(this._activeDayController.dateYYYYMMDD).hour(6).startOf('hour'),
      moment(this._activeDayController.dateYYYYMMDD).hour(12).startOf('hour'),
      moment(this._activeDayController.dateYYYYMMDD).hour(18).startOf('hour'),
      moment(this._activeDayController.dateYYYYMMDD).hour(24).startOf('hour'),
    ];
  }

}