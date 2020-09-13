import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';
import { TimelogDelineator } from './timelog-delineator.class';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { TimelogDisplayGridItem } from './timelog-display-grid-item.class';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import { TimelogDisplayGrid } from './timelog-display-grid-class';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit, OnDestroy {

  constructor(private daybookDisplayService: DaybookDisplayService) { }


  private _guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];
  private _isFresh = true;
  private _updateDisplaySub: Subscription = new Subscription();
  private _drawTLESub: Subscription = new Subscription();

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
  private _isDrawingNewTLE = false;
  public get isDrawingNewTLE(): boolean { return this._isDrawingNewTLE; }

  public get isFresh(): boolean { return this._isFresh; }

  // public get minutesPerTwentyPixels(): number { return this._minutesPerTwentyPixels; };
  // public get timeDelineatorsNgStyle(): any { return this._timelogDisplayController.timeDelineatorsNgStyle; };


  public onMouseMove(event: MouseEvent) { }
  public onMouseLeave() { }


  // public drawTLEIsInGridItem(gridItem: TimelogDisplayGridItem): boolean {
  //   console.log("fired when?")
  //   return false;
  // }




  ngOnInit() {
    this._update();
    // this._updateDisplaySub = this.daybookDisplayService.displayUpdated$.subscribe((update) => {
    //   this._update();
    // });
  }
  ngOnDestroy() {
    this._updateDisplaySub.unsubscribe();
    this._drawTLESub.unsubscribe();
  }

  private _update() {
    this._buildTimelog();
    this._drawTLESub.unsubscribe();
    this._drawTLESub = this.daybookDisplayService.currentlyDrawingTLE$.subscribe((drawTLE) => {
      if (drawTLE) {
        this._isDrawingNewTLE = true;
      } else {
        this._isDrawingNewTLE = false;
      }
    });
  }


  public onClickGridItem(gridItem: TimelogDisplayGridItem) {
    this.daybookDisplayService.displayManager.openItemByIndex(gridItem.itemIndex);
  }

  private _buildTimelog() {

    this._buildGuideLineHours();

  }

  private _buildGuideLineHours() {
    const guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];
    let startTime: moment.Moment = moment(this.startTime);
    if (!(startTime.minute() === 0 || startTime.minute() === 30)) {
      if (startTime.minute() >= 0 && startTime.minute() < 30) {
        startTime = moment(startTime).startOf('hour');
      } else if (startTime.minute() > 30) {
        startTime = moment(startTime).startOf('hour').add(30, 'minutes');
      }
    }
    let endTime: moment.Moment = moment(this.endTime);

    if (!(endTime.minute() === 0 || endTime.minute() === 30)) {
      if (endTime.minute() >= 0 && endTime.minute() < 30) {
        endTime = moment(endTime).minute(30);
      } else if (endTime.minute() > 30) {
        endTime = moment(endTime).startOf('hour').add(1, 'hour');
      }
    }

    let currentTime: moment.Moment = moment(startTime);
    while (currentTime.isSameOrBefore(endTime)) {
      const amPm: 'a' | 'p' = currentTime.hour() >= 12 ? 'p' : 'a';
      let ngStyle: any = {};
      let lineNgClass: any = '';
      if (currentTime.isSame(endTime)) {
        ngStyle = {
          'height': '1px',
          'flex-grow': '0',
        };
      }
      let label = '';
      if (currentTime.minute() === 0) {
        label = currentTime.format('h') + amPm;
        lineNgClass = ['label-line-hour'];
      } else if (currentTime.minute() === 30) {
        lineNgClass = ['label-line-half-hour'];
      }


      guideLineHours.push({ label: label, ngStyle: ngStyle, lineNgClass: lineNgClass });
      currentTime = moment(currentTime).add(30, 'minutes');
    }
    this._guideLineHours = guideLineHours;
  }


}
