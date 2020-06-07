import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';
import { TimelogDelineator } from '../../timelog-delineator.class';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { DaybookController } from '../../../../controller/daybook-controller.class';
import { TimelogDisplayGrid } from '../../timelog-display-grid-class';
import { TimelogDisplayGridItem } from '../../timelog-display-grid-item.class';
import { DaybookDisplayService } from '../../../../daybook-display.service';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService) { }


  private _guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];
  private _isFresh: boolean = true;

  public faTimes = faTimes;
  public faClock = faClock;
  public faPlus = faPlus;
  public get startTime(): moment.Moment { return this.daybookDisplayService.displayStartTime; }
  public get endTime(): moment.Moment { return this.daybookDisplayService.displayEndTime; }
  // public get relativeMousePosition(): RelativeMousePosition { return this._relativeMousePosition; }
  public get guideLineHours(): { label: string, ngStyle: any, lineNgClass: any }[] { return this._guideLineHours; }
  public get timelogDisplayGrid(): TimelogDisplayGrid { return this.daybookDisplayService.timelogDisplayGrid; }
  public get gridItems(): TimelogDisplayGridItem[] { return this.timelogDisplayGrid.gridItems; }
  public get gridItemsNgStyle(): any { return this.timelogDisplayGrid.ngStyle; }
  public get timeDelineators(): TimelogDelineator[] { return this.daybookDisplayService.timelogDelineators; }
  public get activeDayController(): DaybookController { return this.daybookDisplayService.activeDayController; }

  public get isFresh(): boolean { return this._isFresh; }

  // public get minutesPerTwentyPixels(): number { return this._minutesPerTwentyPixels; };
  // public get timeDelineatorsNgStyle(): any { return this._timelogDisplayController.timeDelineatorsNgStyle; };
  public onDrawNewTLE(drawTLE: TimelogEntryItem) {
    this.timelogDisplayGrid.drawTimelogEntry(drawTLE);
  }
  public onCreateNewTLE(timelogEntry: TimelogEntryItem) {
    this.timelogDisplayGrid.createTimelogEntry(timelogEntry);
  }

  public onMouseMove(event: MouseEvent) { }
  public onMouseLeave() { }


  // public drawTLEIsInGridItem(gridItem: TimelogDisplayGridItem): boolean {
  //   console.log("fired when?")
  //   return false;
  // }

  private _updateDisplaySub: Subscription = new Subscription();
  private _gridItemSub: Subscription = new Subscription();


  ngOnInit() {

    this._update();

    this._updateDisplaySub = this.daybookDisplayService.displayUpdated$.subscribe((update) => {
      this._update();

    });

  }
  ngOnDestroy() {
    this._updateDisplaySub.unsubscribe();
    this._gridItemSub.unsubscribe();
  }

  private _update() {
    this._buildTimelog();
    this._gridItemSub.unsubscribe();
    this._gridItemSub = this.daybookDisplayService.tlefController.currentlyOpenTLEFItem$.subscribe((tlef) => {
      // console.log("TLEF: ", tlef)  
      if (tlef !== null) {
        this._setActiveTLEFGridItem();
      } else {
        this.gridItems.forEach(gridItem => gridItem.isActiveFormItem = false);
      }

    });
  }


  public onClickGridItem(gridItem: TimelogDisplayGridItem) {
    this.daybookDisplayService.openTimelogGridItem(gridItem);
  }

  public showNowLine(gridItem: TimelogDisplayGridItem): boolean {
    const now = moment();
    if (now.isSameOrAfter(gridItem.startTime) && now.isSameOrBefore(gridItem.endTime)) {
      // return gridItem.isAvailable;
      return true;
    }
    return false;
  }

  private _buildTimelog() {
    this._buildGuideLineHours();
    this._setActiveTLEFGridItem();
    // this._setIsFresh();
  }

  private _setActiveTLEFGridItem() {
    const controller = this.daybookDisplayService.tlefController;
    // console.log("Controller is: ", controller);
    let activeBarItem = controller.currentlyOpenTLEFItem;
    if (activeBarItem) {
      const foundItem = this.gridItems.find((gridItem) => {
        const isSame = gridItem.startTime.isSame(activeBarItem.startTime) && gridItem.endTime.isSame(activeBarItem.endTime);
        const endsAfterStart = activeBarItem.startTime.isSame(gridItem.startTime) && activeBarItem.endTime.isAfter(gridItem.startTime);
        const isBeforeEnd = activeBarItem.startTime.isAfter(gridItem.startTime) && activeBarItem.endTime.isBefore(gridItem.endTime);
        const endsAtEnd = activeBarItem.endTime.isSame(gridItem.endTime) && activeBarItem.startTime.isBefore(gridItem.endTime);
        return isSame || endsAtEnd || endsAfterStart || isBeforeEnd;
      });
      if (foundItem) {
        this.gridItems.forEach(gridItem => gridItem.isActiveFormItem = false);
        foundItem.isActiveFormItem = true;
        // console.log('Active bar item is set to: [' + this.gridItems.indexOf(foundItem) +']  : ' + foundItem.startTime.format('hh:mm a') + " - " + foundItem.endTime.format('hh:mm a'))
      } else {
        this.gridItems.forEach(gridItem => gridItem.isActiveFormItem = false);
      }
    } else {
      this.gridItems.forEach(gridItem => gridItem.isActiveFormItem = false);
    }
  }

  // private _setIsFresh(){
  //   this._isFresh = this.daybookDisplayService.activeDayController.isNewDay;
  // }

  private _buildGuideLineHours() {
    let guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];
    let startTime: moment.Moment = moment(this.startTime);
    if (!(startTime.minute() == 0 || startTime.minute() == 30)) {
      if (startTime.minute() >= 0 && startTime.minute() < 30) {
        startTime = moment(startTime).startOf("hour")
      } else if (startTime.minute() > 30) {
        startTime = moment(startTime).startOf("hour").add(30, "minutes");
      }
    }
    let endTime: moment.Moment = moment(this.endTime);

    if (!(endTime.minute() == 0 || endTime.minute() == 30)) {
      if (endTime.minute() >= 0 && endTime.minute() < 30) {
        endTime = moment(endTime).minute(30);
      } else if (endTime.minute() > 30) {
        endTime = moment(endTime).startOf("hour").add(1, "hour");
      }
    }

    let currentTime: moment.Moment = moment(startTime);
    while (currentTime.isSameOrBefore(endTime)) {
      let amPm: "a" | "p" = currentTime.hour() >= 12 ? "p" : "a";
      let ngStyle: any = {};
      let lineNgClass: any = "";
      if (currentTime.isSame(endTime)) {
        ngStyle = {
          "height": "1px",
          "flex-grow": "0",
        }
      }
      let label: string = "";
      if (currentTime.minute() == 0) {
        label = currentTime.format("h") + amPm;
        lineNgClass = ['label-line-hour'];
      } else if (currentTime.minute() == 30) {
        lineNgClass = ['label-line-half-hour'];
      }


      guideLineHours.push({ label: label, ngStyle: ngStyle, lineNgClass: lineNgClass });
      currentTime = moment(currentTime).add(30, "minutes");
    }
    this._guideLineHours = guideLineHours;
  }


}
