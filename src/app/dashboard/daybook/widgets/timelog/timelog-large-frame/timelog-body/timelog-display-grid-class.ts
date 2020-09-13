import * as moment from 'moment';
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { DaybookTimeSchedule } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookTimeScheduleItem } from '../../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';

export class TimelogDisplayGrid {

  constructor(scheduleItems: DaybookTimeScheduleItem[]) {
    this._buildGrid(scheduleItems);
  }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _daybookSchedule: DaybookTimeSchedule;
  private _gridItems: TimelogDisplayGridItem[] = [];

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }
  public get totalViewMilliseconds(): number { return this._endTime.diff(this._startTime, 'milliseconds'); }
  public get gridItems(): TimelogDisplayGridItem[] { return this._gridItems; }

  public ngStyle: any = {};

  public update(scheduleItems: DaybookTimeScheduleItem[], currentlyOpenItemIndex?: number) {
    this._buildGrid(scheduleItems, currentlyOpenItemIndex);
  }

  /**
   * 
   * This method basically just applies a boolean property to each item indicating whether or not an item is open,
   * exclusively for style purposes.
   */
  public openItemByIndex(openItemIndex: number) {
    this.gridItems.forEach(item => {
      if (item.itemIndexes.find(i => i === openItemIndex)) {
        item.isCurrentlyOpen = true;
      } else {
        item.isCurrentlyOpen = false;
      }
    });
  }
  public closeItem() {
    this.gridItems.forEach(item => item.isCurrentlyOpen = false);
  }

  private _buildGrid(scheduleItems: DaybookTimeScheduleItem[], currentlyOpenItemIndex?: number) {
    const displayGridNgStyle: any = {};


    const gridItems: TimelogDisplayGridItem[] = scheduleItems.map(item => {
      const newGridItem = new TimelogDisplayGridItem(item.schedItemStartTime, item.schedItemEndTime, item.displayPercent,
        item.itemIndex, item.scheduleStatus, item.timelogEntry);
      return newGridItem;
    });

    let length = gridItems.length;
    for (let i = 1; i < length; i++) {
      if (gridItems[i - 1].scheduleStatus === gridItems[i].scheduleStatus) {
        let merge = false;
        if (gridItems[i].isActiveItem) {
          if ((gridItems[i].isVerySmallItem) || (gridItems[i - 1].isVerySmallItem)) {
            merge = true;
          }
        }
        if (merge) {
          console.log("WE ARE MERGING.")

          gridItems[i - 1].mergeItem(gridItems[i]);
          gridItems.splice(i, 1);
          length = gridItems.length;
          i--;
        }
      }
    }

    let gridTemplateRows: string = '';
    gridItems.forEach((gridItem) => {
      gridTemplateRows += '' + gridItem.displayPercent + '% ';
    });
    displayGridNgStyle['grid-template-rows'] = gridTemplateRows;
    this.ngStyle = displayGridNgStyle;
    this._gridItems = gridItems;
    console.log("   * GRID ITEMS")
    this._gridItems.forEach(item => console.log("   " + item.toString()))

    if (currentlyOpenItemIndex) {
      this._gridItems.find(item => item.itemIndex === currentlyOpenItemIndex).setAsActiveItem();
    }

  }

}
