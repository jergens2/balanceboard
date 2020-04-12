import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-prompt',
  templateUrl: './tlef-prompt.component.html',
  styleUrls: ['./tlef-prompt.component.css']
})
export class TlefPromptComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  private _controller: TLEFController;

  ngOnInit() {
    this._controller = this.daybookService.tlefController;
  }


  public onClickSave(){
    
    // console.log(this._changedTimelogEntryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._changedTimelogEntryItem.endTime.format('YYYY-MM-DD hh:mm a'))
    const changesMadeTLE = this._controller.changesMadeTLE;
    console.log("Saving changes to item: ", changesMadeTLE );
    this.daybookService.activeDayController.updateTimelogEntryItem$(changesMadeTLE);
    this._controller.closeTLEFPrompt();
    // console.log("Saving changes")
    
  }
  public onClickDiscard(){
    this._controller.closeTLEFPrompt();
  }

}



/**
 * 
 *   public onClickSaveChanges() {
    console.log("Saving changes to item: ",  this._changedTimelogEntryItem);
    // console.log(this._changedTimelogEntryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this._changedTimelogEntryItem.endTime.format('YYYY-MM-DD hh:mm a'))
    this.daybookService.activeDayController.updateTimelogEntryItem$(this.controller.changesMadeTLE);
    // console.log("Saving changes")
    this._close();
  }

  public onDelete() {
    // console.log("Deleting: ", this.entryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.entryItem.endTime.format('YYYY-MM-DD hh:mm a') )
    this.daybookService.activeDayController.deleteTimelogEntryItem$(this._controller.currentlyOpenTLEFItem.getInitialTLEValue());
    this._close();
  }
  
 */