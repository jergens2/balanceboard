import { Component, OnInit, Input } from '@angular/core';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { TLEFController } from '../../TLEF-controller.class';
import { ClockService } from '../../../../../../../shared/clock/clock.service';

@Component({
  selector: 'app-tlef-existing-current',
  templateUrl: './tlef-existing-current.component.html',
  styleUrls: ['./tlef-existing-current.component.css']
})
export class TlefExistingCurrentComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private clockService: ClockService) { }

  ngOnInit() {
    // this._controller.changesMadeTLE$.subscribe((change)=>{
    //   if(change === null){
    //     this._isEditing = false;
    //   }
    // });
  }

  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._controller.currentlyOpenTLEFItem.item.getInitialTLEValue(); }

  public get clock(): string{
    return this.clockService.currentTime.format('h:mm:ss a');
  }

  public onClickEdit(){
    this._isEditing = true;
  }

}
