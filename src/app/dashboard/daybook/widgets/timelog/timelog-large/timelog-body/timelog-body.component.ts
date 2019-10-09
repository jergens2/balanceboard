import { Component, OnInit } from '@angular/core';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RelativeMousePosition } from '../../../../../../shared/utilities/relative-mouse-position.class';
import * as moment from 'moment';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit {

  constructor() { }




  ngOnInit() {
    this._startTime = moment().startOf("day").hour(7).minute(30);
    this._endTime = moment().startOf("day").hour(23).minute(30);
  }

  private _startTime: moment.Moment = moment();
  private _endTime: moment.Moment = moment();
  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }

  private _itemState: ItemState = new ItemState(null);
  public get itemState(): ItemState { return this._itemState; }

  private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();
  public get relativeMousePosition(): RelativeMousePosition { return this._relativeMousePosition; }

  public onMouseMove(event: MouseEvent){
    this._relativeMousePosition.onMouseMove(event, "timelog-body-root");
    this.updateMousePositionTime();
  }

  private updateMousePositionTime(){
    let percentY = this.relativeMousePosition.percentY;
    let totalDurationSeconds: number = this._endTime.diff(this._startTime, "seconds");
    let relativeSeconds: number = (percentY * totalDurationSeconds) / 100;
    this._leTime = moment(this._startTime).add(relativeSeconds, "seconds");
    this._lePosition = { "margin-top":percentY.toFixed(2) + "%"}
    
    this.leRows = {"grid-template-rows": percentY.toFixed(2) + "% auto"}
    // console.log("%Y, total, relative", percentY, totalDurationSeconds, relativeSeconds);
  }

  public leRows: any = { "grid-template-rows":"1fr"};

  private _lePosition: any = {};
  public get lePosition(): any{ return this._lePosition; }

  private _leTime: moment.Moment = moment();
  public get leTime(): moment.Moment{ return this._leTime; };
}
