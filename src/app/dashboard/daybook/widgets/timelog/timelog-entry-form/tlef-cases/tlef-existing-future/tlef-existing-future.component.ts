import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-existing-future',
  templateUrl: './tlef-existing-future.component.html',
  styleUrls: ['./tlef-existing-future.component.css']
})
export class TlefExistingFutureComponent implements OnInit {

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._controller.initialTimelogEntry; }

  constructor( private daybookDisplayService: DaybookDisplayService) { }

  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }
  ngOnInit() {
  }

  public get timeFromNow(): string{
    return DurationString.calculateDurationString(this.daybookDisplayService.clock, this.entryItem.startTime) + " from now";
  }

  public onClickEdit(){
    this._isEditing = true;
  }

}
