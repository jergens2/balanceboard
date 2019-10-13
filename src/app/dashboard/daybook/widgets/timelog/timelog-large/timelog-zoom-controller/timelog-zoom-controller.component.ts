import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomControl } from './timelog-zoom-control.interface';
import { DaybookService } from '../../../../daybook.service';
import { faWrench, faSun } from '@fortawesome/free-solid-svg-icons';
import { Subscription, timer } from 'rxjs';
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

  private _currentZoomLevel: TimelogZoomControl;
  @Output() zoomLevel: EventEmitter<TimelogZoomControl> = new EventEmitter();
  @Output() zoomHover: EventEmitter<TimelogZoomControl> = new EventEmitter();


  private _currentTime: moment.Moment = moment();

  ngOnInit() {

    let activeDay: DaybookDayItem = this.daybookService.activeDay;

    let awakeStartTime: moment.Moment = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.wakeupTime), 30, "DOWN");
    let awakeEndTime: moment.Moment = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.bedtime), 30, "UP");

    if (activeDay.sleepProfile.wakeupTimeISO != "" && activeDay.sleepProfile.bedtimeISO != "") {
      awakeStartTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.sleepProfile.wakeupTimeISO), 30, "DOWN");
      awakeEndTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDay.sleepProfile.bedtimeISO), 30, "UP");
    }
    this._wakeCycleZoom = {
      icon: faSun,
      name: "AWAKE",
      isActive: true,
      isFirst: false,
      isLast: false,
      startTime: awakeStartTime,
      endTime: awakeEndTime,
      itemState: new ItemState(null),
    };
    this._currentZoomLevel = this._wakeCycleZoom;
    this._currentTime = moment();
    this.buildZoomButtons();


    let nextMinute: moment.Moment = moment().startOf("minute").add(1, "minute");
    let msUntilNextMinute: number = nextMinute.diff(moment(), "milliseconds");
    this._clockSubscription = timer(msUntilNextMinute, 60000).subscribe((tick) => {
      console.log("Clock passed the minute")
      this._currentTime = moment();
      console.log("this._currentTime =  ", this._currentTime.format("hh:mm:ss a"))
      this.buildZoomButtons();
    });


    this.daybookService.activeDay$.subscribe((activeDayChanged) => {
      console.log("Zoom day changed:")
      let changedDate: moment.Moment = moment(activeDayChanged.dateYYYYMMDD);
      this._currentTime = moment(this._currentTime).year(changedDate.year()).month(changedDate.month()).date(changedDate.date());

      this.updateWakeCycleZoom(activeDayChanged);
      this.buildZoomButtons();
    });

    this._itemState.mouseIsOver$.subscribe((mouseIsOver: boolean) => {
      if (mouseIsOver === false) {
        this._zoomButtons.forEach((zoomButton) => {
          zoomButton.itemState.onMouseLeave();
        });
      }
    });
  }

  private updateWakeCycleZoom(activeDayChanged: DaybookDayItem) {
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
    } else {
      wakeupTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.wakeupTime), 30, "DOWN");
      bedTime = RoundToNearestMinute.roundToNearestMinute(moment(activeDayChanged.bedtime), 30, "UP");
    }

    this._wakeCycleZoom = {
      icon: faSun,
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

  private _wakeCycleZoom: TimelogZoomControl;
  private _twentyFourHourZoom: TimelogZoomControl;
  private _eightHourZoom: TimelogZoomControl;
  private _customZoom: TimelogZoomControl;


  private buildZoomButtons() {
    let zoomButtons: TimelogZoomControl[] = [];



    const twentyFourHourZoomActive: boolean = this._currentZoomLevel.name === "24";
    const eightHourZoomActive: boolean = this._currentZoomLevel.name === "8";
    const customZoomActive: boolean = this._currentZoomLevel.name === "CUSTOM";


    this._twentyFourHourZoom = {
      icon: null,
      name: "24",
      isActive: twentyFourHourZoomActive,
      isFirst: true,
      isLast: false,
      startTime: moment(this._currentTime).startOf("day"),
      endTime: moment(this._currentTime).startOf("day").add(24, "hours"),
      itemState: new ItemState(null),
    };

    this._eightHourZoom = {
      icon: null,
      name: "8",
      isActive: eightHourZoomActive,
      isFirst: false,
      isLast: false,
      startTime: RoundToNearestMinute.roundToNearestMinute(moment(this._currentTime).subtract(4, "hours"), 30, "DOWN"),
      endTime: RoundToNearestMinute.roundToNearestMinute(moment(this._currentTime).add(4, "hours"), 30, "UP"),
      itemState: new ItemState(null),
    }
   
    this._customZoom = {
      icon: faWrench,
      name: "CUSTOM",
      isActive: customZoomActive,
      isFirst: false,
      isLast: true,
      startTime: moment(this._currentTime).startOf("day"),
      endTime: moment(this._currentTime).startOf("day").add(24, "hours"),
      itemState: new ItemState(null),
    };

    if (twentyFourHourZoomActive) {
      this._currentZoomLevel = this._twentyFourHourZoom;
    } else if (eightHourZoomActive) {
      this._currentZoomLevel = this._eightHourZoom;
    } else if (customZoomActive) {
      this._currentZoomLevel = this._customZoom;
    }

    zoomButtons.push(this._twentyFourHourZoom);
    zoomButtons.push(this._wakeCycleZoom);
    if (this.daybookService.activeDayIsToday) {
      zoomButtons.push(this._eightHourZoom);
      zoomButtons.push(this._customZoom);
    } else {
      this._wakeCycleZoom.isLast = true;
      if (this._currentZoomLevel.name != this._twentyFourHourZoom.name && this._currentZoomLevel.name != this._wakeCycleZoom.name) {
        this._wakeCycleZoom.isActive = true;
        this._currentZoomLevel = this._wakeCycleZoom;
      }
    }

    this._zoomButtons = zoomButtons;
    console.log("Emitting this current zoom level: ", this._currentZoomLevel, this._currentZoomLevel.startTime.format("hh:mm a"), this._currentZoomLevel.endTime.format("hh:mm a"))
    this.zoomLevel.emit(this._currentZoomLevel);
  }

  public onClickButton(clickedButton: TimelogZoomControl) {
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
  public onZoomHover(button: TimelogZoomControl) {
    this.zoomHover.emit(button);
  }


  private _zoomButtons: TimelogZoomControl[] = [];
  public get zoomButtons(): TimelogZoomControl[] { return this._zoomButtons; }


  faSun = faSun;

}
