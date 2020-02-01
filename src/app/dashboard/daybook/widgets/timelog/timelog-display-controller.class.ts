
import { TimelogZoomControl } from './timelog-large/timelog-zoom-controller/timelog-zoom-control.interface';
import { TimelogEntryItem } from './timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from './timelog-delineator.class';
import { faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { DaybookController } from '../../controller/daybook-controller.class';
import { TimelogDisplayGrid } from './timelog-display-grid-class';

export class TimelogDisplayController {

  /**
   * The TimelogDisplayController is the primary class for the production of the Timelog widget in the daybook, used by timelog-body.component
   */
  constructor(timelogZoomControl: TimelogZoomControl, activeDayController: DaybookController, minutesPerTwentyPixels: number) {
    this._timelogZoomControl = timelogZoomControl;
    this._activeDayController = activeDayController;
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    this._update();
    // console.log("TIMELOG_ZOOM: " + this._atimelogZoomControl.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._timelogZoomControl.endTime.format('YYYY-MM-DD hh:mm a'));
  }

  private _log: string[] = [];
  private _minutesPerTwentyPixels: number;
  private _timelogZoomControl: TimelogZoomControl;
  private _timeDelineators: TimelogDelineator[] = [];
  private _entryItems: TimelogEntryItem[] = [];
  private _activeDayController: DaybookController;
  private _displayGrid: TimelogDisplayGrid;

  private _defaultDayStructureTimes: moment.Moment[] = [];


  public faMoon = faMoon;
  public faSun = faSun;

  public get frameStart(): moment.Moment { return this._timelogZoomControl.startTime; }
  public get wakeupTime(): moment.Moment { return this._activeDayController.wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._activeDayController.fallAsleepTime; }
  public get frameEnd(): moment.Moment { return this._timelogZoomControl.endTime; }
  public get entryItems(): TimelogEntryItem[] { return this._entryItems; }
  public get timeDelineators(): TimelogDelineator[] { return this._timeDelineators; }
  public get defaultDayStructureTimes(): moment.Moment[] { return this._defaultDayStructureTimes; }
  public get displayGrid(): TimelogDisplayGrid { return this._displayGrid; }



  public addTimeDelineator(time: moment.Moment) {
  }
  public addTemporaryDelineator(time: moment.Moment) {

  }
  public removeTimeDelineator(delineator: TimelogDelineator) {
    console.log("method disabled")
    // this._activeDay.timelog.removeTimeDelineator(delineator.time.toISOString());
    // this.update();
  }

  // public drawTimelogEntry(drawTLE: TimelogEntryItem){
  //   this.displayGrid.drawTimelogEntry(drawTLE);
  // }

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

    // this._logToConsole();
  }
  private _logToConsole() {
    console.log("Constructing TimelogDisplayController - logToConsole is ON")
    this._log.forEach((logEntry) => {
      console.log("   " + logEntry);
    });
  }


  private _buildGrid() {
    let newGrid: TimelogDisplayGrid = new TimelogDisplayGrid(this.frameStart, this.frameEnd, this._timeDelineators, this._activeDayController);
    this._displayGrid = newGrid;
  }




  private _loadTimelogDelineators() {
    const nowTime = moment();

    const timelogDelineators: TimelogDelineator[] = [];
    const frameStartDelineator = new TimelogDelineator(this.frameStart, TimelogDelineatorType.FRAME_START);
    timelogDelineators.push(frameStartDelineator);

    const wakeupDelineator = new TimelogDelineator(this.wakeupTime, TimelogDelineatorType.WAKEUP_TIME);
    timelogDelineators.push(wakeupDelineator);


    if (this._activeDayController.isToday) {
      timelogDelineators.push(new TimelogDelineator(nowTime, TimelogDelineatorType.NOW));
    }



    timelogDelineators.push(new TimelogDelineator(this.fallAsleepTime, TimelogDelineatorType.FALLASLEEP_TIME));
    timelogDelineators.push(new TimelogDelineator(this.frameEnd, TimelogDelineatorType.FRAME_END));

    this._activeDayController.timeDelineations.forEach((timeDelineation) => {
      timelogDelineators.push(new TimelogDelineator(timeDelineation, TimelogDelineatorType.SAVED_DELINEATOR));
    });
    this._activeDayController.timelogEntryItems.forEach((timelogEntryItem) => {
      const timeDelineatorStart = new TimelogDelineator(timelogEntryItem.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START);
      const timeDelineatorEnd = new TimelogDelineator(timelogEntryItem.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END);
      timeDelineatorStart.nextDelineator = timeDelineatorEnd;
      timeDelineatorStart.timelogEntryStart = timelogEntryItem;
      timeDelineatorEnd.previousDelineator = timeDelineatorStart;
      timeDelineatorEnd.timelogEntryEnd = timelogEntryItem;
      timelogDelineators.push(timeDelineatorStart);
      timelogDelineators.push(timeDelineatorEnd);
    });

    const sortedDelineators = this._sortDelineators(timelogDelineators);
    this._timeDelineators = sortedDelineators;
    let logItems: string[] = [];
    sortedDelineators.forEach(sd => logItems.push("  Sorted Delineator: " + sd.time.format('YYYY-MM-DD hh:mm a') + " : " + sd.delineatorType))
    this._log = this._log.concat(logItems);
  }

  private _sortDelineators(timelogDelineators: TimelogDelineator[]): TimelogDelineator[] {
    let sortedDelineators = timelogDelineators
      .filter((delineator) => { return delineator.time.isSameOrAfter(this.frameStart) && delineator.time.isSameOrBefore(this.frameEnd); })
      .sort((td1, td2) => {
        if (td1.time.isBefore(td2.time)) { return -1; }
        else if (td1.time.isAfter(td2.time)) { return 1; }
        else {
          return 0;
        }
      });
    const priority = [
      TimelogDelineatorType.FRAME_START,
      TimelogDelineatorType.FRAME_END,
      TimelogDelineatorType.NOW,
      TimelogDelineatorType.WAKEUP_TIME,
      TimelogDelineatorType.FALLASLEEP_TIME,
      TimelogDelineatorType.TIMELOG_ENTRY_START,
      TimelogDelineatorType.TIMELOG_ENTRY_END,
      TimelogDelineatorType.SAVED_DELINEATOR,
      TimelogDelineatorType.DAY_STRUCTURE,
    ];
    if(sortedDelineators.length > 0){
      for (let i = 1; i < sortedDelineators.length; i++){
        if(sortedDelineators[i].time.isSame(sortedDelineators[i-1].time)){
          const thisPriorityIndex = priority.indexOf(sortedDelineators[i].delineatorType);
          const prevPriorityIndex = priority.indexOf(sortedDelineators[i-1].delineatorType);
          // lower priority index is higher priority
          if(thisPriorityIndex < prevPriorityIndex){
            sortedDelineators.splice(i-1,1);
          }else if(thisPriorityIndex > prevPriorityIndex){
            sortedDelineators.splice(i, 1);
          }else{
            console.log('Error somehow with delineators.');
          }
          i--;
        }
      }
    }
    return sortedDelineators;
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