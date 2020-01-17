import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomControl } from './timelog-zoom-control.interface';
import { DaybookService } from '../../../../daybook.service';
import { faWrench, faSun, faListUl } from '@fortawesome/free-solid-svg-icons';
import { Subscription, timer } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { TimeUtilities } from '../../../../../../shared/utilities/time-utilities/time-utilities';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import { DaybookController } from '../../../../controller/daybook-controller.class';

@Component({
  selector: 'app-timelog-zoom-controller',
  templateUrl: './timelog-zoom-controller.component.html',
  styleUrls: ['./timelog-zoom-controller.component.css']
})
export class TimelogZoomControllerComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private _currentZoomLevel: TimelogZoomControl;
  @Output() public zoomControl: EventEmitter<TimelogZoomControl> = new EventEmitter();
  @Output() public zoomHover: EventEmitter<TimelogZoomControl> = new EventEmitter();


  private _currentTime: moment.Moment = moment();

  ngOnInit() {

    this._currentTime = moment();
    this._updateWakeCycleZoom(this.daybookService.activeDayController);
    this._buildZoomButtons();
    this.daybookService.activeDayController$.subscribe((activeDayChanged) => {
      let changedDate: moment.Moment = moment(activeDayChanged.dateYYYYMMDD);
      this._currentTime = moment(this._currentTime).year(changedDate.year()).month(changedDate.month()).date(changedDate.date());
      this._updateWakeCycleZoom(activeDayChanged);
      this._buildZoomButtons();
    });
  }


  private _updateWakeCycleZoom(activeDayChanged: DaybookController) {
    const wakeZoomActive: boolean = this._currentZoomLevel ? this._currentZoomLevel.name === "AWAKE" : true;
    
    let wakeupTime: moment.Moment = activeDayChanged.wakeupTime;
    let fallAsleepTime: moment.Moment = activeDayChanged.fallAsleepTime;
    console.log("Wakeup time is " + wakeupTime.format('hh:mm a'))
    let frameStart: moment.Moment;
    let frameEnd: moment.Moment;
    if(wakeupTime.minute() >= 0 && wakeupTime.minute() < 15){
      frameStart = moment(wakeupTime).startOf('hour').subtract(30, 'minutes');
    }else if(wakeupTime.minute() >= 15 && wakeupTime.minute() < 45){
      frameStart = moment(wakeupTime.startOf('hour'));
    }else if(wakeupTime.minute() >= 45){
      frameStart = moment(wakeupTime).startOf('hour').add('30 minutes');
    }

    if(fallAsleepTime.minute() >= 0 && fallAsleepTime.minute() < 15){
      frameEnd = moment(fallAsleepTime).startOf('hour').add(30, 'minutes');
    }else if(fallAsleepTime.minute() >= 15 && fallAsleepTime.minute() < 45){
      frameEnd = moment(fallAsleepTime.startOf('hour')).add(1, 'hour');
    }else if(fallAsleepTime.minute() >= 45){
      frameEnd = moment(fallAsleepTime).startOf('hour').add(1, 'hour').add(30, 'minutes');
    }

    console.log(" zoom controller vs sleep controller.  (wakeup, frameStart, fallasleep, frameENd)");
    console.log("   " + activeDayChanged.wakeupTime.format('hh:mm a') + " --> " + frameStart.format('hh:mm a'))
    console.log("   " + activeDayChanged.fallAsleepTime.format('hh:mm a') + " --> " + frameEnd.format('hh:mm a'))

    this._wakeCycleZoom = {
      icon: faSun,
      name: "AWAKE",
      isActive: wakeZoomActive,
      isFirst: false,
      isLast: false,
      startTime: frameStart,
      endTime: frameEnd
    };
    if (wakeZoomActive) {
      this._currentZoomLevel = this._wakeCycleZoom;
    }
  }


  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _wakeCycleZoom: TimelogZoomControl;
  private _twentyFourHourZoom: TimelogZoomControl;
  private _eightHourZoom: TimelogZoomControl;
  private _listZoom: TimelogZoomControl;
  private _customZoom: TimelogZoomControl;



  private _buildZoomButtons() {
    let zoomButtons: TimelogZoomControl[] = [];

    let changedValue: TimelogZoomControl;

    const twentyFourHourZoomActive: boolean = this._currentZoomLevel.name === "24";
    const eightHourZoomActive: boolean = this._currentZoomLevel.name === "8";
    const customZoomActive: boolean = this._currentZoomLevel.name === "CUSTOM";
    const listZoomActive: boolean = this._currentZoomLevel.name === "LIST";
    const wakeZoomActive: boolean = this._currentZoomLevel.name === "AWAKE";


    this._twentyFourHourZoom = {
      icon: null,
      name: "24",
      isActive: twentyFourHourZoomActive,
      isFirst: true,
      isLast: false,
      startTime: moment(this._currentTime).startOf("day"),
      endTime: moment(this._currentTime).startOf("day").add(24, "hours")
    };

    this._eightHourZoom = {
      icon: null,
      name: "8",
      isActive: eightHourZoomActive,
      isFirst: false,
      isLast: false,
      startTime: TimeUtilities.roundDownToFloor(moment(this._currentTime).subtract(4, "hours"), 30),
      endTime: TimeUtilities.roundUpToCeiling(moment(this._currentTime).add(4, "hours"), 30)
    };

    this._listZoom = {
      icon: faListUl,
      name: "LIST",
      isActive: listZoomActive,
      isFirst: false,
      isLast: false,
      startTime: moment(this._currentTime).startOf("day"),
      endTime: moment(this._currentTime).startOf("day").add(24, "hours"),
    };

    this._customZoom = {
      icon: faWrench,
      name: "CUSTOM",
      isActive: customZoomActive,
      isFirst: false,
      isLast: true,
      startTime: moment(this._currentTime).startOf("day"),
      endTime: moment(this._currentTime).startOf("day").add(24, "hours"),
    };

    if (twentyFourHourZoomActive) {
      changedValue = this._twentyFourHourZoom;
    } else if (eightHourZoomActive) {
      changedValue = this._eightHourZoom;
    } else if (customZoomActive) {
      changedValue = this._customZoom;
    } else if (listZoomActive) {
      changedValue = this._listZoom;
    } else if (wakeZoomActive) {
      changedValue = this._wakeCycleZoom;
    } else {
      console.log("Error with zoom")
    }

    zoomButtons.push(this._twentyFourHourZoom);
    zoomButtons.push(this._wakeCycleZoom);
    zoomButtons.push(this._listZoom);
    if (this.daybookService.activeDayController.isToday) {
      zoomButtons.push(this._eightHourZoom);
      zoomButtons.push(this._customZoom);
    } else {
      this._listZoom.isLast = true;
      if (this._currentZoomLevel.name == "AWAKE") {
        this._wakeCycleZoom.isActive = true;
        changedValue = this._wakeCycleZoom;
      }
    }

    this._zoomButtons = zoomButtons;
    // this.
    // console.log("Emitting from rebuild: ", this._currentZoomLevel, this._currentZoomLevel.startTime.format("hh:mm a"), this._currentZoomLevel.endTime.format("hh:mm a"))
    this.emitChange(changedValue);
  }

  public onClickButton(clickedButton: TimelogZoomControl) {
    this._zoomButtons.forEach((button) => {
      if (button.name === clickedButton.name) {
        button.isActive = true;
      } else {
        button.isActive = false;
      }
    });
    this.emitChange(clickedButton);
  }
  public onZoomHover(button: TimelogZoomControl) {
    this.zoomHover.emit(button);
  }

  private emitChange(newValue: TimelogZoomControl) {
    /**
     * Note:  we need to rebuild the object here because otherwise, we might be emitting the same identical object as the previous emit, and 
     * apparently, in the timelog body component, if the @Input value receives the same object, it won't actually execute.
     */
    this._currentZoomLevel = {
      icon: newValue.icon,
      name: newValue.name,
      isActive: newValue.isActive,
      isFirst: newValue.isFirst,
      isLast: newValue.isLast,
      startTime: moment(newValue.startTime),
      endTime: moment(newValue.endTime),
    }
    this.zoomControl.emit(this._currentZoomLevel);
  }


  private _zoomButtons: TimelogZoomControl[] = [];
  public get zoomButtons(): TimelogZoomControl[] { return this._zoomButtons; }


  faSun = faSun;

}
