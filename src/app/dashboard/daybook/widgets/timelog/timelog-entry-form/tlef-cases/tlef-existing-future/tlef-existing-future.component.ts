import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { TLEFController } from '../../TLEF-controller.class';
import * as moment from 'moment';
import { timer } from 'rxjs';

@Component({
  selector: 'app-tlef-existing-future',
  templateUrl: './tlef-existing-future.component.html',
  styleUrls: ['./tlef-existing-future.component.css']
})
export class TlefExistingFutureComponent implements OnInit {

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { 
    this._controller = controller;
    this._initialValue = this._controller.currentlyOpenTLEFItem.getInitialTLEValue();
  }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._initialValue; }

  private _initialValue: TimelogEntryItem;

  constructor( private daybookDisplayService: DaybookDisplayService) { }

  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  private _clock: moment.Moment; 

  ngOnInit() { 
    this._updateClock()
    timer(0, 1000).subscribe(tick => this._updateClock());
  }

  private _timeFromNow: string = "";
  private _updateClock(){
    this._clock = moment();
    this._timeFromNow = DurationString.calculateDurationString(this._clock, this.entryItem.startTime) + " from now";
  }

  public get timeFromNow(): string{
    return this._timeFromNow;
  }

  public onClickEdit(){
    this._isEditing = true;
  }

}
