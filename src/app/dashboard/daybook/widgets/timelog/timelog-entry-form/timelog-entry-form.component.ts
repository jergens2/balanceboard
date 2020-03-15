import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import * as moment from 'moment';
import { LoggingService } from '../../../../../shared/logging/logging.service';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';
import { TimelogEntryFormService } from './timelog-entry-form.service';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { Subscription } from 'rxjs';

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
    private tlefService: TimelogEntryFormService,
  ) { }

  private _formCase: TLEFFormCase;
  private _entryItem: TimelogEntryItem;

  private _changesMade: boolean = false;

  private _dbSubs: Subscription[] = [];

  ngOnInit() {
    // this._entryItem = this.timelogEntryFormService.openedTimelogEntry;
    // this._formCase = this.timelogEntryFormService.formCase;
    // this.timelogEntryFormService.formChanged$.subscribe((change) => {
    //   this._entryItem = this.timelogEntryFormService.openedTimelogEntry;
    //   this._formCase = this.timelogEntryFormService.formCase;
    // });
    // console.log("TLEF case is: " + this.formCase)
    this._update();
    this._dbSubs = [
      this.daybookService.displayUpdated$.subscribe(change => this._update()),
      this.daybookService.activeGridBarItem$.subscribe(change => this._update())
    ]
  }

  private _update() {
    this._entryItem = this.tlefService.openedTimelogEntry;
  }

  ngOnDestroy(){ 
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._dbSubs = [];
  }

  public get entryItem(): TimelogEntryItem { return this.tlefService.openedTimelogEntry; }
  public get formCase(): TLEFFormCase { return this.tlefService.formCase; }

  public get durationString(): string { return this.entryItem.durationString; }


  



}
