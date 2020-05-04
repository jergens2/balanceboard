import { Component, OnInit, Input } from '@angular/core';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-existing-current',
  templateUrl: './tlef-existing-current.component.html',
  styleUrls: ['./tlef-existing-current.component.css']
})
export class TlefExistingCurrentComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  ngOnInit() {
    this._clock = moment();
    timer(0, 1000).subscribe((tick)=>{
      this._clock = moment();
    });

    // this._controller.changesMadeTLE$.subscribe((change)=>{
    //   if(change === null){
    //     this._isEditing = false;
    //   }
    // });
  }

  private _clock: moment.Moment;
  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._controller.currentlyOpenTLEFItem.getInitialTLEValue(); }

  public get clock(): string{
    return this._clock.format('h:mm:ss a');
  }

  public onClickEdit(){
    this._isEditing = true;
  }

}
