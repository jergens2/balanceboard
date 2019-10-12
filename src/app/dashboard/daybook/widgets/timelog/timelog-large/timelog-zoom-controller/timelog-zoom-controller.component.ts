import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomButton } from './timelog-zoom-button.interface';
import { DaybookService } from '../../../../daybook.service';
import { faWrench, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RoundToNearestMinute } from '../../../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';

@Component({
  selector: 'app-timelog-zoom-controller',
  templateUrl: './timelog-zoom-controller.component.html',
  styleUrls: ['./timelog-zoom-controller.component.css']
})
export class TimelogZoomControllerComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookService) { }

  private _currentZoomLevel: TimelogZoomButton;
  @Output() zoomLevel: EventEmitter<TimelogZoomButton> = new EventEmitter();
  @Output() zoomHover: EventEmitter<TimelogZoomButton> = new EventEmitter();

  ngOnInit() {

    let activeDay: DaybookDayItem = this.daybookService.activeDay;

    let awakeStartTime: moment.Moment = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.wakeupTime), 30, "DOWN");
    let awakeEndTime: moment.Moment = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.bedtime), 30, "UP");

    if (activeDay.sleepProfile.wakeupTimeISO != "" && activeDay.sleepProfile.bedtimeISO != "") {
      awakeStartTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.sleepProfile.wakeupTimeISO), 30, "DOWN");
      awakeEndTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.sleepProfile.bedtimeISO), 30, "UP");
    }
    this._wakeCycleZoom = {
      icon: faMoon,
      name: "AWAKE",
      isActive: true,
      isFirst: false,
      isLast: false,
      startTime: awakeStartTime,
      endTime: awakeEndTime,
      itemState: new ItemState(null),
    };
    this._currentZoomLevel = this._wakeCycleZoom;
    let currentTime: moment.Moment = moment();
    this.buildZoomButtons(currentTime);


    this._clockSubscription = this.daybookService.clock$.subscribe((clockTime: moment.Moment) => {
      if (clockTime.diff(currentTime, "minute") >= 1 && this.daybookService.activeDayIsToday) {
        currentTime = moment(clockTime);
        this.buildZoomButtons(currentTime);
      }
    });

    this.daybookService.activeDay$.subscribe((activeDayChanged) => {

      currentTime = moment(activeDayChanged.dateYYYYMMDD);

      this.updateWakeCycleZoom(activeDayChanged);
      this.buildZoomButtons(currentTime);
    });

    this._itemState.mouseIsOver$.subscribe((mouseIsOver: boolean) => {
      if (mouseIsOver === false) {
        this._zoomButtons.forEach((zoomButton) => {
          zoomButton.itemState.onMouseLeave();
        });
      }
    });
  }

  private updateWakeCycleZoom(activeDayChanged: DaybookDayItem){
    const wakeZoomActive: boolean = this._currentZoomLevel.name === "AWAKE";

    let wakeupTime: moment.Moment;
    let bedTime: moment.Moment;

    if (activeDayChanged.sleepProfile.wakeupTimeISO != "" && activeDayChanged.sleepProfile.bedtimeISO != "") {
      wakeupTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.sleepProfile.wakeupTimeISO), 30, "DOWN");
      bedTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.sleepProfile.bedtimeISO), 30, "UP");
      if (wakeupTime.minute() == moment(activeDayChanged.sleepProfile.wakeupTimeISO).minute() &&
        wakeupTime.hour() == moment(activeDayChanged.sleepProfile.wakeupTimeISO).hour()) {
        wakeupTime = moment(wakeupTime).subtract(30, "minutes");
      }
    }else{
      wakeupTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.wakeupTime), 30, "DOWN");
      bedTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.bedtime), 30, "UP");
    }

    this._wakeCycleZoom = {
      icon: faMoon,
      name: "AWAKE",
      isActive: wakeZoomActive,
      isFirst: false,
      isLast: false,
      startTime: wakeupTime,
      endTime: bedTime,
      itemState: new ItemState(null),
    }
    if (wakeZoomActive) {
      this._currentZoomLevel = this._wakeCycleZoom;
    }
  }


  private _clockSubscription: Subscription = new Subscription();
  ngOnDestroy() {
    this._clockSubscription.unsubscribe();
  }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _wakeCycleZoom: TimelogZoomButton;
  private _twentyFourHourZoom: TimelogZoomButton;
  private _eightHourZoom: TimelogZoomButton;
  private _customZoom: TimelogZoomButton;


  private buildZoomButtons(currentTime: moment.Moment) {
    let zoomButtons: TimelogZoomButton[] = [];



    const twentyFourHourZoomActive: boolean = this._currentZoomLevel.name === "24";
    const eightHourZoomActive: boolean = this._currentZoomLevel.name === "8";
    const customZoomActive: boolean = this._currentZoomLevel.name === "CUSTOM";


    this._twentyFourHourZoom = {
      icon: null,
      name: "24",
      isActive: twentyFourHourZoomActive,
      isFirst: true,
      isLast: false,
      startTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day"),
      endTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day").add(24, "hours"),
      itemState: new ItemState(null),
    };

    this._eightHourZoom = {
      icon: null,
      name: "8",
      isActive: eightHourZoomActive,
      isFirst: false,
      isLast: false,
      startTime: RoundToNearestMinute.roundToNearestMinute(moment(currentTime).subtract(4, "hours"), 30, "DOWN"),
      endTime: RoundToNearestMinute.roundToNearestMinute(moment(currentTime).add(4, "hours"), 30, "UP"),
      itemState: new ItemState(null),
    }

    this._customZoom = {
      icon: faWrench,
      name: "CUSTOM",
      isActive: customZoomActive,
      isFirst: false,
      isLast: true,
      startTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day"),
      endTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day").add(24, "hours"),
      itemState: new ItemState(null),
    };

    zoomButtons.push(this._twentyFourHourZoom);
    zoomButtons.push(this._wakeCycleZoom);
    zoomButtons.push(this._eightHourZoom);
    zoomButtons.push(this._customZoom);

    this._zoomButtons = zoomButtons;
    this.zoomLevel.emit(this._currentZoomLevel);
  }

  public onClickButton(clickedButton: TimelogZoomButton) {
    this._zoomButtons.forEach((button) => {
      if (button.name === clickedButton.name) {
        button.isActive = true;
      } else {
        button.isActive = false;
      }
    });
    this._currentZoomLevel = clickedButton;
    this.zoomLevel.emit(this._currentZoomLevel);
  }
  public onZoomHover(button: TimelogZoomButton) {
    this.zoomHover.emit(button);
  }


  private _zoomButtons: TimelogZoomButton[] = [];
  public get zoomButtons(): TimelogZoomButton[] { return this._zoomButtons; }


  faMoon = faMoon;

}
