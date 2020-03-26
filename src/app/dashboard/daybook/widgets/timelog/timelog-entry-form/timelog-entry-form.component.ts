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
 * The flow of this component is that the Service controlls everything.
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

  ngOnInit() {
    console.log("Opening component")
    this._reload();
    this._dbSubs = [
      this.daybookService.displayUpdated$.subscribe(change => {
        if (change.type !== DaybookDisplayUpdateType.CLOCK) {
          this._reload()
        }
      }),
      this.controller.changes$.subscribe(s => this._reload())
    ]
  }

  private _reload() {
    this._entryItem = Object.assign({}, this.controller.initialTimelogEntry);
    console.log("Entry item is DUN.", this._entryItem);
    console.log(this._entryItem.startTime.format('YYYY-MM-DD hh:mm a'))
  }

  ngOnDestroy() {
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._dbSubs = [];
  }

  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get formCase(): TLEFFormCase { return this.controller.formCase; }

  public get durationString(): string { return this.entryItem.durationString; }






}
