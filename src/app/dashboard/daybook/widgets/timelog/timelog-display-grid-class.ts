import * as moment from 'moment';
import { TimelogDelineator, TimelogDelineatorType } from "./timelog-delineator.class";
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { TimelogEntryItem } from './timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookController } from '../../controller/daybook-controller.class';
import { DaybookAvailabilityType } from '../../controller/items/daybook-availability-type.enum';
import { TimeScheduleItem } from '../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TLEFController } from './timelog-entry-form/TLEF-controller.class';
import { TLEFControllerItem } from './timelog-entry-form/TLEF-controller-item.class';

export class TimelogDisplayGrid {

  constructor(startTime: moment.Moment, endTime: moment.Moment, delineators: TimelogDelineator[], activeDayController: DaybookController, tlefController: TLEFController) {
    // console.log("Constructing timelogDisplayGrid: delineators: ", delineators);
    this._startTime = moment(startTime);
    this._endTime = moment(endTime);
    this._timeDelineators = delineators;
    this._activeController = activeDayController;
    this._tlefController = tlefController;
    this._buildGrid();
  }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment
  private _timeDelineators: TimelogDelineator[];
  private _activeController: DaybookController;
  private _tlefController: TLEFController;


  private _gridItems: TimelogDisplayGridItem[] = [];

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }
  public get totalViewMilliseconds(): number { return this._endTime.diff(this._startTime, 'milliseconds') };
  public get timeDelineators(): TimelogDelineator[] { return this._timeDelineators; }
  public get gridItems(): TimelogDisplayGridItem[] { return this._gridItems; }

  public ngStyle: any = {};


  /**
   * This method is for DRAWING the item, as in, user is actively dragging and drawing
   */
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

  /** 
   *  This method is to create the item after user stops dragging.
   */
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
    // this._tlefController.tlefItems.forEach((item) => {
    //   console.log(item.toString())
    // })
    let displayGridNgStyle: any = {};
    const gridItems: TimelogDisplayGridItem[] = [];
    this._tlefController.tlefItems.forEach((item: TLEFControllerItem) => {

      const itemMs = moment(item.endTime).diff(moment(item.startTime), 'milliseconds');
      const percent: number = (itemMs / this.totalViewMilliseconds) * 100;
      const availability: DaybookAvailabilityType = this._activeController.getDaybookAvailability(item.startTime, item.endTime);
      const newGridItem = new TimelogDisplayGridItem(item.startTime, item.endTime, percent, availability);
      gridItems.push(newGridItem);
    });
    gridItems.forEach((gridItem) => {
      this._activeController.timelogEntryItems.forEach((timelogEntry) => {
        if (timelogEntry.startTime.isSameOrAfter(gridItem.startTime) && timelogEntry.endTime.isSameOrBefore(gridItem.endTime)) {
          gridItem.timelogEntries.push(timelogEntry);
        } else {

        }
      })
    });
    for(let i=0; i<gridItems.length; i++){
      gridItems[i].setItemIndex(i);
    }
    let length = gridItems.length;
    for (let i = 1; i < length; i++) {
      const minPercent = 2.5;
      const smallPercent = 6;
      const largePercent = 15;
      if (gridItems[i - 1].availabilityType === gridItems[i].availabilityType) {
        let merge = false;
        if (gridItems[i].isTimelogEntry) {
          // console.log(gridItems[i].percent, gridItems[i - 1].percent)
          if ((gridItems[i].percent < minPercent) || (gridItems[i - 1].percent < minPercent)) {
            merge = true;
            gridItems[i].isVerySmallItem = true;
          } else if (gridItems[i].percent >= minPercent && gridItems[i].percent < smallPercent) {
            gridItems[i].isSmallGridItem = true;
          }else if(gridItems[i].percent >= largePercent){
            gridItems[i].isLargeGridItem = true;
          }
        }
        if (merge) {
          gridItems[i].timelogEntries.forEach((tle) => gridItems[i - 1].timelogEntries.push(tle));
          gridItems[i - 1].percent = gridItems[i - 1].percent + gridItems[i].percent;
          gridItems[i - 1].endTime = gridItems[i].endTime;
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
        }else if(gridItems[i].percent >= largePercent){
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