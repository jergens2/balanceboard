import { Component, OnInit, Input } from '@angular/core';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RelativeMousePosition } from '../../../../../../shared/utilities/relative-mouse-position.class';
import * as moment from 'moment';
import { RoundToNearestMinute } from '../../../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { DaybookService } from '../../../../daybook.service';
import { TimelogZoomButton } from '../timelog-zoom-controller/timelog-zoom-button.interface';
import { Subscription } from 'rxjs';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }



  @Input() public set zoom(zoom: TimelogZoomButton) {
    this._startTime = moment(zoom.startTime);
    this._endTime = moment(zoom.endTime);
    console.log("Zoom changed")
    // console.log("Start time, end time: ", this._startTime.format('hh:mm a'), this._endTime.format('hh:mm a'));
    this.buildTimelog();
  }

  @Input() public set zoomHover(zoom: TimelogZoomButton) {
    console.log("hovering over zoom: ", zoom);
  }


  ngOnInit() {
    // this.daybookService.activeDay$.subscribe((activeDayChanged) => {
    //   this.buildTimelog();
    // });
  }

  private buildTimelog() {
    console.log("Building timelog")
    this.buildGuideLineHours();
    this.updateNowLine();
    this.updateTimelogEntryItems();
  }

  private buildGuideLineHours() {
    let guideLineHours: { label: string, ngStyle: any, lineNgStyle: any }[] = [];
    let startTime: moment.Moment = moment(this._startTime);
    if (!(startTime.minute() == 0 || startTime.minute() == 30)) {
      if (startTime.minute() >= 0 && startTime.minute() < 30) {
        startTime = moment(startTime).startOf("hour")
      } else if (startTime.minute() > 30) {
        startTime = moment(startTime).startOf("hour").add(30, "minutes");
      }
    }
    let endTime: moment.Moment = moment(this._endTime);

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
    if (now.isSameOrAfter(this._startTime) && now.isSameOrBefore(this._endTime)) {
      let totalDurationSeconds: number = this._endTime.diff(this._startTime, "seconds");
      let secondsFromStart: number = now.diff(this._startTime, "seconds");
      let percentFromStart: number = (secondsFromStart / totalDurationSeconds) * 100;
      let percentRemaining: number = 100-percentFromStart;
      let ngStyle: any = { "grid-template-rows": percentFromStart.toFixed(2) + "% " + percentRemaining.toFixed(2) + "%", };
      this._nowLine = {time: now, ngStyle: ngStyle};
    } else {
      this._nowLine = null;
    }
  }

  private updateTimelogEntryItems() {
    let containerStyle: any = {};

    let times: moment.Moment[] = [];
    let currentTime: moment.Moment = moment(this._startTime);
    times.push(currentTime);

    this._timelogEntryItemsNgStyle = containerStyle;
  }

  private _startTime: moment.Moment = moment();
  private _endTime: moment.Moment = moment();

  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();
  public get relativeMousePosition(): RelativeMousePosition { return this._relativeMousePosition; }

  public onMouseMove(event: MouseEvent) {
    this._relativeMousePosition.onMouseMove(event, "timelog-body-root");
    this.updateMousePosition();
  }
  public onMouseLeave() {
    this._itemState.onMouseLeave();
    this._mousePosition = null;
  }



  private updateMousePosition() {
    let percentY: number = this.relativeMousePosition.percentY;
    let totalDurationSeconds: number = this._endTime.diff(this._startTime, "seconds");
    let relativeSeconds: number = (percentY * totalDurationSeconds) / 100;
    let percentRemaining: number = 100 - percentY;
    let ngStyle: any = { "grid-template-rows": percentY.toFixed(2) + "% " + percentRemaining.toFixed(2) + "%", };
    let time: moment.Moment = moment(this._startTime).add(relativeSeconds, "seconds");
    time = RoundToNearestMinute.roundToNearestMinute(moment(this._startTime).add(relativeSeconds, "seconds"), 5);
    this._mousePosition = { time: time, ngStyle: ngStyle };
  }

  private _mousePosition: { time: moment.Moment, ngStyle: any } = null;
  public get mousePosition(): { time: moment.Moment, ngStyle: any } { return this._mousePosition; };

  private _nowLine: { time: moment.Moment, ngStyle: any } = null;
  public get nowLine(): { time: moment.Moment, ngStyle: any } { return this._nowLine; };

  private _timelogBodyNgStyle: any = {};
  public get timelogBodyNgStyle(): any { return this._timelogBodyNgStyle; }

  private _guideLineHours: any[] = [];
  public get guideLineHours(): any[] { return this._guideLineHours; }

  private _timelogEntryItemsNgStyle: any = { "grid-template-rows": "100%" };
  public get timelogEntryItemsNgStyle(): any { return this._timelogEntryItemsNgStyle; }

  private _timelogEntryItems: TimelogEntryItem[] = [];
  public get timelogEntryItems(): TimelogEntryItem[] { return this._timelogEntryItems; }

}
