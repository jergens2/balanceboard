import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TLEFController } from '../../TLEF-controller.class';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TLEFFormCase } from '../../tlef-form-case.enum';
import { DaybookDisplayUpdateType } from '../../../../../controller/items/daybook-display-update.interface';

@Component({
  selector: 'app-tlef-times',
  templateUrl: './tlef-times.component.html',
  styleUrls: ['./tlef-times.component.css']
})
export class TlefTimesComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }


  private _subs: Subscription[] = [];
  private _entryItem: TimelogEntryItem;
  private _entryStartTime: moment.Moment;
  private _entryEndTime: moment.Moment;

  private _mouseIsOver: boolean = false;

  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get durationString(): string { return this.entryItem.durationString; }

  ngOnInit() {
    // console.log("Opening component")
    this._reload();
    this._subs = [
      this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe(s => this._reload()),
      // this.daybookService.displayUpdated$.subscribe((update)=>{
      //   this._reload();
      // })
    ];
  }

  ngOnDestroy(){
    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [];
  }

  private _reload() {

    if (this.daybookService.tlefController.currentlyOpenTLEFItem) {
      if (this.daybookService.tlefController.currentlyOpenTLEFItem.isTLEItem) {
        this._entryItem = this.daybookService.tlefController.currentlyOpenTLEFItem.getInitialTLEValue();

        // if (!this._entryStartTime) {
        //   this._entryStartTime = moment(this.entryItem.startTime);
        // }
        // if (!this._entryEndTime) {
        //   this._entryEndTime = moment(this.entryItem.endTime);
        // }
        // const tlefCase = this.controller.currentlyOpenTLEFItem.formCase;

        this._entryStartTime = moment(this.entryItem.startTime);
        this._entryEndTime = moment(this.entryItem.endTime);
      } else {
        this._entryStartTime = moment();
        this._entryEndTime = moment();
      }
    } else {
      this._entryItem = null;
      this._entryStartTime = moment();
      this._entryEndTime = moment();
    }
  }


  public get entryStartTime(): string {
    if (this._entryStartTime) {
      return this._entryStartTime.format('h:mm a');
    }
    return 'Error with start time';
  }
  public get entryEndTime(): string {
    if (this._entryEndTime) {
      return this._entryEndTime.format('h:mm a');
    }
    return 'Error with start time';
  }

  public get mouseIsOver(): boolean { return this._mouseIsOver; }
  public onMouseEnter() {
    this._mouseIsOver = true;
  }
  public onMouseLeave() {
    this._mouseIsOver = false;
  }
}
