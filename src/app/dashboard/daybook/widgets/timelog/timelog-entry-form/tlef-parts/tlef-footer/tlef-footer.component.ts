import { Component, OnInit, Input } from '@angular/core';
import { ToolboxService } from '../../../../../../../toolbox-menu/toolbox.service';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';


import { TLEFController } from '../../TLEF-controller.class';

import * as moment from 'moment';

@Component({
  selector: 'app-tlef-footer',
  templateUrl: './tlef-footer.component.html',
  styleUrls: ['./tlef-footer.component.css']
})
export class TlefFooterComponent implements OnInit {

  constructor(private toolboxService: ToolboxService, private daybookService: DaybookDisplayService) { }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  // public get entryItem(): TimelogEntryItem { return this._controller.currentlyOpenTLEFItem.getInitialTLEValue(); }
  public get showDeleteButton(): boolean { return this._controller.showDeleteButton; }
  public get changesMade(): boolean { return this._controller.changesMade; }
  // public get isNew(): boolean { return !this._controller.isNew; }

  public get isNew(): boolean { return this._controller.isNew; }

  ngOnInit() {
  }

  // private _rebuild(){

  // }

  public onClickSaveNew() {
    console.log("Saving new")
    this.daybookService.activeDayController.saveTimelogEntryItem(this.controller.changesMadeTLE);
    this._close();
  }

  public onClickSaveChanges() {

    // console.log(this._changedTimelogEntryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._changedTimelogEntryItem.endTime.format('YYYY-MM-DD hh:mm a'))
    this.daybookService.activeDayController.updateTimelogEntryItem$(this.controller.changesMadeTLE);
    // console.log("Saving changes")
    // this._close();
    this.controller.clearChanges();
  }

  public onDelete() {
    // console.log("Deleting: ", this.entryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.entryItem.endTime.format('YYYY-MM-DD hh:mm a') )
    this.daybookService.activeDayController.deleteTimelogEntryItem$(this._controller.currentlyOpenTLEFItem.getInitialTLEValue());
    this._close();
  }



  public onClickDiscard() {
    console.log("Discarding changes")
    // if (!this._changesMade) {
    //   this.toolboxService.closeTool();
    // } else {
    //   console.log("Warning: need to implement a confirmation here")
    //   this.toolboxService.closeTool();
    // }
    this._close();
  }

  private _close() {
    this.toolboxService.closeTool();
  }


}
