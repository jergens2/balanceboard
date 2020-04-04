import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import * as moment from 'moment';
import { LoggingService } from '../../../../../shared/logging/logging.service';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';

import { DaybookDisplayService } from '../../../daybook-display.service';
import { Subscription } from 'rxjs';
import { TLEFController } from './TLEF-controller.class';
import { DaybookDisplayUpdateType } from '../../../controller/items/daybook-display-update.interface';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})

/**
 * The flow of opening this form is as follows:
 * 
 * 1. requests from non-TLEF components go through daybookDisplayService methods to open this form.
 * 2. DaybookDisplayServices uses its TLEFController class object to run the actual methods of how to determine which item to open.
 * 3. the TLEFController runs the logic and prepares the data then tells the ToolboxService to open the TLEF 
 * 4. This component gets created, and summons the data from daybookDisplayService.TLEFController
 * 
 */
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  constructor(
    private toolsService: ToolboxService,
    private daybookService: DaybookDisplayService,
    private loggingService: LoggingService,
  ) { }

  private _formCase: TLEFFormCase;
  private _entryItem: TimelogEntryItem;
  private _changesMade: boolean = false;

  private _dbSubs: Subscription[] = [];

  public get controller(): TLEFController { return this.daybookService.tlefController; }
  public get formCase(): TLEFFormCase { return this._formCase; }
  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get durationString(): string { return this.entryItem.durationString; }

  public get entryStartTime(): string { 
    if(this._entryItem){
      // console.log("Entry item start t ime is ", this._entryItem)
      return moment(this._entryItem.startTime).format('h:mm a');
    }
    return "entry start time";
  }
  public get entryEndTime(): string { 
    if(this._entryItem){
      // console.log("Entry item endTime is " + this._entryItem.endTime.format('h:mm a'))
      return moment(this._entryItem.endTime).format('h:mm a');
    }
    return "entry end time";
  }

  ngOnInit() {
    console.log("Opening component")
    this._reload();
    this._dbSubs = [
      this.daybookService.displayUpdated$.subscribe(change => {
        // if (change.type !== DaybookDisplayUpdateType.CLOCK) {
          this._reload();
        // }
      }),
      this.controller.changes$.subscribe(s => this._reload())
    ];
  }

  private _reload() {
    this._entryItem = this.controller.currentlyOpenTLEFItem.getInitialTLEValue();
    this._entryItem.logToConsole();
    this._formCase = this.controller.currentlyOpenTLEFItem.formCase;
    console.log("Entry item is DUN.", this._entryItem);
    console.log(this._entryItem.startTime.format('YYYY-MM-DD hh:mm a'))
  }

  ngOnDestroy() {
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._dbSubs = [];
  }








}
