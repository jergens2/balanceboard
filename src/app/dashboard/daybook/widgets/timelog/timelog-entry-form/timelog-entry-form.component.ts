import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { TLEFFormCase } from './tlef-form-case.enum';
import { DaybookDisplayService } from '../../../daybook-display.service';
import { Subscription } from 'rxjs';
import { TLEFController } from './TLEF-controller.class';

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
    private daybookService: DaybookDisplayService,
  ) { }

  private _formCase: TLEFFormCase;
  private _entryItem: TimelogEntryItem;
  private _changesMade: boolean = false;

  private _dbSubs: Subscription[] = [];

  public get controller(): TLEFController { return this.daybookService.tlefController; }
  public get formCase(): TLEFFormCase { return this._formCase; }
  public get entryItem(): TimelogEntryItem { return this._entryItem; }

  public get promptToSaveChanges(): boolean { return this.controller.promptToSaveChanges; }

  ngOnInit() {
    // console.log("Opening component")
    this._reload();
    this._dbSubs = [
      this.controller.currentlyOpenTLEFItem$.subscribe(s => this._reload())
    ];
  }

  private _reload() {
    if (this.controller.currentlyOpenTLEFItem) {
      this._formCase = this.controller.currentlyOpenTLEFItem.formCase;
      if(this.controller.currentlyOpenTLEFItem.isTLEItem){
        this._entryItem = this.controller.currentlyOpenTLEFItem.getInitialTLEValue();
        // console.log(this._entryItem.toString);
      }else{
        this._entryItem = null;
      }
      
    } else {
      this._entryItem = null;
    }
  }

  ngOnDestroy() {
    this._dbSubs.forEach(sub => sub.unsubscribe());
    this._dbSubs = [];
  }








}
