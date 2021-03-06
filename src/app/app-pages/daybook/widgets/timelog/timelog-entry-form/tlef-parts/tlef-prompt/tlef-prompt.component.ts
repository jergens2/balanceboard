import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TLEFController } from '../../TLEF-controller.class';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { DaybookUpdateAction } from '../../../../../display-manager/daybook-update-action.enum';

@Component({
  selector: 'app-tlef-prompt',
  templateUrl: './tlef-prompt.component.html',
  styleUrls: ['./tlef-prompt.component.css']
})
export class TlefPromptComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  private _controller: TLEFController;

  public get faArrowRight(): IconDefinition { return faArrowRight; }

  ngOnInit() {
    this._controller = this.daybookService.tlefController;
  }


  public onClickSave() {
    const changesMadeTLE = this._controller.changesMadeTLE;
    const dateYYYYMMDD: string = changesMadeTLE.startTime.format('YYYY-MM-DD');
    this.daybookService.daybookController.tleController.saveTimelogEntryItem(dateYYYYMMDD, changesMadeTLE);
    this._controller.saveChanges();
    this.daybookService.saveChanges$(DaybookUpdateAction.TIMELOG_ENTRY).subscribe(complete => this._controller.promptContinue());
  }
  public onClickDiscard() {
    this._controller.promptContinue();
  }
  public onClickReturn() {
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