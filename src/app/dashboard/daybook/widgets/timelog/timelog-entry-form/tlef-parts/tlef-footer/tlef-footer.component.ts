import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ToolboxService } from '../../../../../../../toolbox-menu/toolbox.service';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';


import { TLEFController } from '../../TLEF-controller.class';

import * as moment from 'moment';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DaybookUpdateAction } from '../../../../../display-manager/daybook-update-action.enum';

@Component({
  selector: 'app-tlef-footer',
  templateUrl: './tlef-footer.component.html',
  styleUrls: ['./tlef-footer.component.css']
})
export class TlefFooterComponent implements OnInit {

  constructor(private toolboxService: ToolboxService, private daybookService: DaybookDisplayService) { }

  public get faSpinner() { return faSpinner; }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  // public get entryItem(): TimelogEntryItem { return this._controller.currentlyOpenTLEFItem.getInitialTLEValue(); }
  public get showDeleteButton(): boolean { return this._controller.showDeleteButton; }
  public get changesMade(): boolean { return this._controller.isChanged; }
  // public get isNew(): boolean { return !this._controller.isNew; }

  public get isNew(): boolean { return this._controller.isNew; }

  ngOnInit() {
  }


  // private _rebuild(){

  // }

  public onClickSaveNew() {
    console.log("Saving new")
    const dateYYYYMMDD: string = this.controller.changesMadeTLE.startTime.format('YYYY-MM-DD');
    console.log("Saving timelog entry:", this.controller.changesMadeTLE);
    this.daybookService.daybookController.tleController.saveTimelogEntryItem(dateYYYYMMDD, this.controller.changesMadeTLE);
    this.controller.saveChanges();
    this.daybookService.saveChanges$(DaybookUpdateAction.TIMELOG_ENTRY).subscribe(complete => this._close());
  }

  public onClickSaveChanges() {
    console.log("SAVING CHANGES!")
    console.log(this.controller.currentlyOpenTLEFItem.unsavedChangesTLE.startTime.format('YYYY-MM-DD hh:mm a'))
    // + " to " + this._changedTimelogEntryItem.endTime.format('YYYY-MM-DD hh:mm a'))
    const dateYYYYMMDD: string = this.controller.changesMadeTLE.startTime.format('YYYY-MM-DD');
    const originalStart: moment.Moment = moment(this.controller.currentlyOpenTLEFItem.actualStartTime);
    const originalEnd: moment.Moment = moment(this.controller.currentlyOpenTLEFItem.actualEndTime);
    this.daybookService.daybookController.
      tleController.updateTimelogEntryItem(dateYYYYMMDD, originalStart, originalEnd, this.controller.changesMadeTLE);
    // console.log("Saving changes")
    // this._close();
    this.controller.saveChanges();
    this.daybookService.saveChanges$(DaybookUpdateAction.TIMELOG_ENTRY).subscribe(complete => this.controller.onChangesSaved());
  }

  public onDelete() {
    // console.log("Deleting: ", this.entryItem.startTime.format('YYYY-MM-DD hh:mm a') 
    // + " to " + this.entryItem.endTime.format('YYYY-MM-DD hh:mm a') )
    const dateYYYYMMDD: string = this.controller.currentlyOpenTLEFItem.schedItemStartTime.format('YYYY-MM-DD');
    this.daybookService.daybookController.tleController
      .deleteTimelogEntryItem(dateYYYYMMDD, this._controller.currentlyOpenTLEFItem.getInitialTLEValue());
    this.controller.saveChanges();
    this.daybookService.saveChanges$(DaybookUpdateAction.TIMELOG_ENTRY).subscribe(complete => this._close());
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
    this.controller.close();
    this.toolboxService.closeTool();
  }


}
