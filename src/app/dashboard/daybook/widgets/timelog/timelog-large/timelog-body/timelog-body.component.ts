import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RelativeMousePosition } from '../../../../../../shared/utilities/relative-mouse-position.class';
import * as moment from 'moment';
import { RoundToNearestMinute } from '../../../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { DaybookService } from '../../../../daybook.service';
import { TimelogZoomControl } from '../timelog-zoom-controller/timelog-zoom-control.interface';
import { Subscription, Observable } from 'rxjs';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import { DaybookDayItemSleepProfile } from '../../../../api/data-items/daybook-day-item-sleep-profile.interface';
import { Timelog } from '../../timelog.class';
import { TimeDelineator } from '../../time-delineator.class';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { ScreenSizeService } from '../../../../../../shared/app-screen-size/screen-size.service';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit {

  constructor(private daybookService: DaybookService, private screenSizeService: ScreenSizeService) { }

  private _zoomControl: TimelogZoomControl;
  private _zoomControlSubscription: Subscription = new Subscription();
  @Input() public set zoomControl(zoomControl: TimelogZoomControl) {
    this._zoomControl = zoomControl;
    this.estimateInitialMinutesPerPixel(this.screenSizeService.dimensions.height);
    this.buildTimelog();
  }

  @Input() public set zoomHover(zoom: TimelogZoomControl) {
  }


  ngOnInit() {
    this.estimateInitialMinutesPerPixel(this.screenSizeService.dimensions.height);
    this.screenSizeService.dimensions$.subscribe((dimensions: {width: number, height: number})=>{
      this.estimateInitialMinutesPerPixel(dimensions.height);
    });
  }



  private _activeDay: DaybookDayItem;

  public get startTime(): moment.Moment { return this._zoomControl.startTime; }
  public get endTime(): moment.Moment { return this._zoomControl.endTime; }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();
  public get relativeMousePosition(): RelativeMousePosition { return this._relativeMousePosition; }

  private _timelog: Timelog = null;
  public get timelog(): Timelog { return this._timelog; }

  public get timelogEntryItemsNgStyle(): any { return this._timelog.entryItemsNgStyle; }
  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelog.entryItems; }

  private _mousePosition: { time: moment.Moment, ngStyle: any, crossesExistingTimelogEntry: boolean } = null;
  public get mousePosition(): { time: moment.Moment, ngStyle: any, crossesExistingTimelogEntry: boolean } { return this._mousePosition; };

  private _nowLine: { time: moment.Moment, ngStyle: any } = null;
  public get nowLine(): { time: moment.Moment, ngStyle: any } { return this._nowLine; };

  private _guideLineHours: any[] = [];
  public get guideLineHours(): any[] { return this._guideLineHours; }


  public get timeDelineators(): TimeDelineator[] { return this._timelog.timeDelineators; }
  public get timeDelineatorsNgStyle(): any { return this._timelog.timeDelineatorsNgStyle; };

  private buildTimelog() {
    this._activeDay = this.daybookService.activeDay;
    this.buildGuideLineHours();
    this.updateNowLine();
    this.updateTimelog();
  }

  private buildGuideLineHours() {
    let guideLineHours: { label: string, ngStyle: any, lineNgStyle: any }[] = [];
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
      let lineNgStyle: any = {};
      if (currentTime.isSame(endTime)) {
        ngStyle = {
          "height": "1px",
          "flex-grow": "0",
        }
      }
      let label: string = "";
      if (currentTime.minute() == 0) {
        label = currentTime.format("h") + amPm;
        lineNgStyle = { "border-bottom": "1px solid rgb(220, 220, 220)", }
      } else if (currentTime.minute() == 30) {
        lineNgStyle = { "border-bottom": "1px solid rgb(240, 240, 240)", }
      }

      guideLineHours.push({ label: label, ngStyle: ngStyle, lineNgStyle: lineNgStyle });
      currentTime = moment(currentTime).add(30, "minutes");
    }
    this._guideLineHours = guideLineHours;
  }

  private updateNowLine() {
    let now: moment.Moment = moment();
    if (now.isSameOrAfter(this.startTime) && now.isSameOrBefore(this.endTime)) {
      let totalDurationSeconds: number = this.endTime.diff(this.startTime, "seconds");
      let secondsFromStart: number = now.diff(this.startTime, "seconds");
      let percentFromStart: number = (secondsFromStart / totalDurationSeconds) * 100;
      let percentRemaining: number = 100 - percentFromStart;
      let ngStyle: any = { "grid-template-rows": percentFromStart.toFixed(2) + "% " + percentRemaining.toFixed(2) + "%", };
      this._nowLine = { time: now, ngStyle: ngStyle };
    } else {
      this._nowLine = null;
    }
  }




  private updateTimelog() {
    let timelog: Timelog = new Timelog(this._zoomControl, this._activeDay, this._minutesPerTwentyPixels);
    this._timelog = timelog;
  }

  public onMouseMove(event: MouseEvent) {
    // let start = moment();
    this._relativeMousePosition.onMouseMove(event, "timelog-body-root");
    this.updateMousePosition();
    // console.log("Mouse position update: " + moment().diff(start, "milliseconds") + " ms")
    // this.updateMinutesPerPixel(this.relativeMousePosition.elementHeight);
  }
  public onMouseLeave() {
    this._itemState.onMouseLeave();
    this._mousePosition = null;
  }


  private updateMousePosition() {
    let percentY: number = this.relativeMousePosition.percentY;
    let totalDurationSeconds: number = this.endTime.diff(this.startTime, "seconds");
    let relativeSeconds: number = (percentY * totalDurationSeconds) / 100;
    let percentRemaining: number = 100 - percentY;
    let ngStyle: any = { "grid-template-rows": percentY.toFixed(2) + "% " + percentRemaining.toFixed(2) + "%", };
    let time: moment.Moment = moment(this.startTime).add(relativeSeconds, "seconds");
    // time = RoundToNearestMinute.roundToNearestMinute(moment(this.startTime).add(relativeSeconds, "seconds"), 5);
    let crossesAnyTimelogEntry: boolean = this._timelog.crossesAnyTimelogEntry(time);
    this._mousePosition = { time: time, ngStyle: ngStyle, crossesExistingTimelogEntry: crossesAnyTimelogEntry };
  }
  private estimateInitialMinutesPerPixel(screenHeight: number){
    /**
     * This is not a highly reliable mechanism for determining how many minutes per pixel because it depends on making assumptions
     * based on the current configuration of css and elements which may change.
     
     * In the case of a full sized screen, the screen is 966 pixels and the timelog-body is 841 pixels, therefore the difference = 125. 
     * In the case of the smallest screen (anything less than 622 px), the timelog body is 500px at minimum, 
     * 
     * We can therefore estimate that the height of the timelog-body is:  screenHeight - 125px.
     */
    let elementHeight: number = screenHeight - 125;
    if(elementHeight < 500){
      elementHeight = 500;
    }
    this.updateMinutesPerPixel(elementHeight);
  }
  private _minutesPerTwentyPixels: number = 30;
  private updateMinutesPerPixel(elementHeight: number){
    const totalMinutes = moment(this._zoomControl.endTime).diff(moment(this._zoomControl.startTime), "minutes");
    const minutesPerTwentyPixels = (totalMinutes / elementHeight)*20;
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    if(this._timelog){
      this._timelog.updateEntrySizes(minutesPerTwentyPixels);
    }
  }


  faTimes = faTimes;
  faClock = faClock;
  faPlus = faPlus;
}
