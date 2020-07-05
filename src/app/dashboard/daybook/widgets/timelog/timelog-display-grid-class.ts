import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from "./timelog-delineator.class";
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { TLEFControllerItem } from './timelog-entry-form/TLEF-controller-item.class';
import { DaybookTimeSchedule } from '../../api/daybook-time-schedule/daybook-time-schedule.class';

export class TimelogDisplayGrid {

  constructor(schedule: DaybookTimeSchedule) {
    this._buildGrid(schedule);
  }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment
  private _daybookSchedule: DaybookTimeSchedule;
  private _gridItems: TimelogDisplayGridItem[] = [];

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }
  public get totalViewMilliseconds(): number { return this._endTime.diff(this._startTime, 'milliseconds') };
  public get timeDelineators(): TimelogDelineator[] { return this._daybookSchedule.displayDelineators; }
  public get gridItems(): TimelogDisplayGridItem[] { return this._gridItems; }

  public ngStyle: any = {};

  public update(schedule: DaybookTimeSchedule){
    this._buildGrid(schedule);
  }
  public updateActiveItem(tlefItem: TLEFControllerItem) {
    this.gridItems.forEach(gridItem => {
      if (gridItem.startTime.isSame(tlefItem.startTime)) {
        gridItem.isActiveFormItem = true;
      } else {
        gridItem.isActiveFormItem = false;
      }
    });
  }

  private _buildGrid(schedule: DaybookTimeSchedule) {
    this._daybookSchedule = schedule;
    this._startTime = moment(schedule.startTime);
    this._endTime = moment(schedule.endTime);
    let displayGridNgStyle: any = {};
    let gridItems: TimelogDisplayGridItem[] = this._daybookSchedule.getItemsInRange(this.startTime, this.endTime)
      .map(item => {
        const percent: number = (item.durationMs / this.totalViewMilliseconds) * 100;
        let timelogEntry: TimelogEntryItem = item.timelogEntry;
        const newGridItem = new TimelogDisplayGridItem(item.startTime, item.endTime, percent, item.status, timelogEntry);
        return newGridItem;
      });
    gridItems.forEach((gridItem) => {
      this.timeDelineators.forEach((delineator) => {
        if (delineator.delineatorType === TimelogDelineatorType.DRAWING_TLE_START) {
          if (gridItem.startTime.isSame(delineator.time)) {
            gridItem.setIsDrawing();
          }
        }
      });
    });
    let length = gridItems.length;
    for (let i = 1; i < length; i++) {
      const minPercent = 2.5;
      const smallPercent = 6;
      const largePercent = 15;
      if (gridItems[i - 1].timeScheduleStatus === gridItems[i].timeScheduleStatus) {
        let merge = false;
        if (gridItems[i].isTimelogEntry) {
          // console.log(gridItems[i].percent, gridItems[i - 1].percent)
          if ((gridItems[i].percent < minPercent) || (gridItems[i - 1].percent < minPercent)) {
            merge = true;
            gridItems[i].isVerySmallItem = true;
          } else if (gridItems[i].percent >= minPercent && gridItems[i].percent < smallPercent) {
            gridItems[i].isSmallGridItem = true;
          } else if (gridItems[i].percent >= largePercent) {
            gridItems[i].isLargeGridItem = true;
          }
        }
        if (merge) {
          gridItems[i].timelogEntries.forEach((tle) => gridItems[i - 1].timelogEntries.push(tle));
          gridItems[i - 1].percent = gridItems[i - 1].percent + gridItems[i].percent;
          gridItems[i - 1].changeEndTime(gridItems[i].endTime);
          gridItems[i - 1].isMerged = true;
          if (gridItems[i - 1].percent > smallPercent) {
            gridItems[i - 1].isSmallGridItem = false;
            gridItems[i - 1].isVerySmallItem = false;
          } else if (gridItems[i - 1].percent > minPercent) {
            gridItems[i - 1].isSmallGridItem = true;
            gridItems[i - 1].isVerySmallItem = false;
          } else {
            gridItems[i - 1].isVerySmallItem = true;
          }
          gridItems.splice(i, 1);
          length = gridItems.length;
          i--;
        }
      } else {
        if (gridItems[i].percent < minPercent) {
          gridItems[i].isVerySmallItem = true;
        } else if (gridItems[i].percent >= minPercent && gridItems[i].percent < smallPercent) {
          gridItems[i].isSmallGridItem = true;
        } else if (gridItems[i].percent >= largePercent) {
          gridItems[i].isLargeGridItem = true;
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

    // console.log("Grid items:")
    // this._gridItems.forEach(item => console.log(item.toString()))

  }

}