import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomButton } from './timelog-zoom-button.interface';
import { DaybookService } from '../../../../daybook.service';
import { faWrench, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RoundToNearestMinute } from '../../../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';

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
    this._currentZoomLevel = this._defaultZoom;
    let currentTime: moment.Moment = moment();
    this.buildZoomButtons(currentTime);

    this.onClickButton(this._currentZoomLevel);

    this._clockSubscription = this.daybookService.clock$.subscribe((clockTime: moment.Moment)=>{
      if(clockTime.diff(currentTime, "minute") >= 1){
        currentTime = moment(clockTime);
        this.buildZoomButtons(currentTime);
      } 
    });

    this._itemState.mouseIsOver$.subscribe((mouseIsOver: boolean)=>{
      if(mouseIsOver === false){
        this._zoomButtons.forEach((zoomButton)=>{
          zoomButton.itemState.onMouseLeave();
        });
      }
    });
  }


  private _clockSubscription: Subscription = new Subscription();
  ngOnDestroy(){
    this._clockSubscription.unsubscribe();
  }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _defaultZoom: TimelogZoomButton = {
    icon: faMoon,
    name: "",
    isActive: true,
    startTime: moment(this.daybookService.activeDay.wakeupTime),
    endTime: moment(this.daybookService.activeDay.bedtime),
    ngClass: [],
    itemState: new ItemState(null),
  };

  private _eightHourZoom: TimelogZoomButton;

  private buildZoomButtons(currentTime: moment.Moment){
    let zoomButtons: TimelogZoomButton[] = [];

    zoomButtons.push({
      icon: null,
      name: "24",
      isActive: false,
      startTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day"),
      endTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day").add(24, "hours"),
      ngClass: ['first-zoom-button'],
      itemState: new ItemState(null),
    });


    zoomButtons.push(this._defaultZoom);

    this._eightHourZoom = {
      icon: null,
      name: "8",
      isActive: false,
      startTime: RoundToNearestMinute.roundToNearestMinute(moment(currentTime).subtract(4, "hours"), 30, "DOWN"),
      endTime: RoundToNearestMinute.roundToNearestMinute(moment(currentTime).add(4, "hours"), 30, "UP"),
      ngClass: [],
      itemState: new ItemState(null),
    }

    zoomButtons.push(this._eightHourZoom);

    zoomButtons.push({
      icon: faWrench,
      name: "",
      isActive: true,
      startTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day"),
      endTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day").add(24, "hours"),
      ngClass: ['last-zoom-button'],
      itemState: new ItemState(null),
    });


    this._zoomButtons = zoomButtons;
    this.onClickButton(this._currentZoomLevel);
  }

  public onClickButton(button: TimelogZoomButton){
    this.zoomButtons.forEach((button)=>{
      let index: number = button.ngClass.indexOf("zoom-button-active");
      if(index > -1){
        button.ngClass.splice(index, 1);
      }
    })
    button.ngClass.push('zoom-button-active');
    this._currentZoomLevel = button;
    this.zoomLevel.emit(this._currentZoomLevel);
  }
  public onZoomHover(button: TimelogZoomButton){
    this.zoomHover.emit(button);
  }


  private _zoomButtons: TimelogZoomButton [] = [];
  public get zoomButtons(): TimelogZoomButton[] { return this._zoomButtons; }


  faMoon = faMoon;

}
