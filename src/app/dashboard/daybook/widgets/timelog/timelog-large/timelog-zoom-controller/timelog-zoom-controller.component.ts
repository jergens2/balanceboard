import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TimelogZoomButton } from './timelog-zoom-button.interface';
import { DaybookService } from '../../../../daybook.service';
import { faWrench, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';

@Component({
  selector: 'app-timelog-zoom-controller',
  templateUrl: './timelog-zoom-controller.component.html',
  styleUrls: ['./timelog-zoom-controller.component.css']
})
export class TimelogZoomControllerComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookService) { }

  @Output() zoomLevel: EventEmitter<TimelogZoomButton> = new EventEmitter();
  @Output() zoomHover: EventEmitter<TimelogZoomButton> = new EventEmitter();

  ngOnInit() {
    this.buildZoomButtons();
    this.onClickButton(this.defaultZoom);
    let currentTime: moment.Moment = moment();
    this._clockSubscription = this.daybookService.clock$.subscribe((clockTime: moment.Moment)=>{
      if(clockTime.diff(currentTime, "minute") >= 1){
        currentTime = moment(clockTime);
        this.buildZoomButtons();
      } 
    });

    this._itemState.mouseIsOver$.subscribe((mouseIsOver: boolean)=>{
      if(mouseIsOver === false){
        this._zoomButtons.forEach((zoomButton)=>{
          zoomButton.itemState.onMouseLeave();
        })
      }
    });
  }


  private _clockSubscription: Subscription = new Subscription();
  ngOnDestroy(){
    this._clockSubscription.unsubscribe();
  }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private defaultZoom: TimelogZoomButton = {
    icon: faMoon,
    name: "",
    isActive: true,
    startTime: moment(this.daybookService.activeDay.wakeupTime),
    endTime: moment(this.daybookService.activeDay.bedtime),
    ngClass: [],
    itemState: new ItemState(null),
  };

  private buildZoomButtons(){
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


    zoomButtons.push(this.defaultZoom);

    zoomButtons.push({
      icon: null,
      name: "8",
      isActive: false,
      startTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day"),
      endTime: moment(this.daybookService.activeDayYYYYMMDD).startOf("day").add(24, "hours"),
      ngClass: [],
      itemState: new ItemState(null),
    });
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
  }

  public onClickButton(button: TimelogZoomButton){
    this.zoomButtons.forEach((button)=>{
      let index: number = button.ngClass.indexOf("zoom-button-active");
      if(index > -1){
        button.ngClass.splice(index, 1);
      }
    })
    button.ngClass.push('zoom-button-active');
    this.zoomLevel.emit(button);
  }
  public onZoomHover(button: TimelogZoomButton){
    this.zoomHover.emit(button);
  }


  private _zoomButtons: TimelogZoomButton [] = [];
  public get zoomButtons(): TimelogZoomButton[] { return this._zoomButtons; }


  faMoon = faMoon;

}
