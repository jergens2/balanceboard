
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { DayStructureTimeColumnRow } from './time-column-row.class';

export class DayStructureChartLabelLine {


  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  private _bodyLabel: string = "";
  private _startLabel: string = "";
  private _style: any = {};
  private _bodyBackgroundColor: string = "";

  private _bufferHeight: string = "";


  constructor(startTime: moment.Moment, endTime: moment.Moment, bodyLabel: string, startLabel: string, bodyBackgroundColor: string) {
    this._startTime = moment(startTime);
    this._endTime = moment(endTime);
    this._bodyLabel = bodyLabel;
    this._startLabel = startLabel;
    this._bodyBackgroundColor = bodyBackgroundColor;

    this.setPosition();
  }

  public set endTime(newEndTime: moment.Moment) {
    this._endTime = moment(newEndTime);
    this.setPosition();
  }

  public movePosition(newPosition: DayStructureTimeColumnRow) {
    let isTwelve: boolean = newPosition.startTime.hour() == 0 && newPosition.startTime.minute() == 0;
    if (!isTwelve) {
      this._startTime = moment(newPosition.startTime);
      this.setPosition();
    }
  }
  private setPosition() {
    //24 * 60 = 1440 minutes per day
    let heightPercentage: number = ((this._endTime.diff(this._startTime, "minutes")) / 1440) * 100;
    this._style = {
      "height": heightPercentage.toFixed(1) + "%",
      "background-color": this._bodyBackgroundColor,
    };

    let bufferHeight: number = ((this._startTime.diff(moment(this._startTime).startOf("day"), "minutes")) / 1440) * 100;
    this._bufferHeight = bufferHeight.toFixed(1) + "%";
  }



  private _canDrag: boolean = false;
  public setAsDraggable() {
    this._canDrag = true;
  }
  public get canDrag(): boolean {
    return this._canDrag;
  }

  private _isTemporary: boolean = false;
  public setAsTemporary() {
    this._isTemporary = true;
  }
  public get isTemporary(): boolean {
    return this._isTemporary;
  }


  private _isSecondaryNew: boolean = false;
  public setAsSecondaryNew(){
    this._isSecondaryNew = true;
  }
  public get isSecondaryNew(){
    return this._isSecondaryNew;
  }

  private _isNew: boolean = false;
  public setAsNew() {
    this._isNew = true;
  }
  public get isNew(): boolean {
    return this._isNew;
  }

  public get startTime(): moment.Moment {
    return this._startTime;
  }
  public get endTime(): moment.Moment {
    return this._endTime;
  }
  public get durationMinutes(): number {
    // console.log("Duration minutes is: " , this.endTime.diff(this.startTime, "minutes"))
    return this.endTime.diff(this.startTime, "minutes");
  }

  public get timeLabel(): string {
    return this._startTime.format("h:mm a");
  }
  public get bodyLabel(): string {
    return this._bodyLabel;
  }
  public get startLabel(): string {
    return this._startLabel;
  }

  public get style(): any {
    return this._style;
  }
  public get bufferHeight(): string {
    return this._bufferHeight;
  }

}