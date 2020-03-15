import { Component, OnInit } from '@angular/core';
import { ToolboxService } from '../../../../../../../toolbox-menu/toolbox.service';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogEntryFormService } from '../../timelog-entry-form.service';
import { TLEFFooterMode } from '../../tlef-footer-mode.enum';

@Component({
  selector: 'app-tlef-footer',
  templateUrl: './tlef-footer.component.html',
  styleUrls: ['./tlef-footer.component.css']
})
export class TlefFooterComponent implements OnInit {

  constructor(private toolboxService: ToolboxService, private daybookService: DaybookDisplayService, private tlefService: TimelogEntryFormService) { }

  private _entryItem: TimelogEntryItem;
  
  private _saveNewButton: boolean = false;
  private _saveChangesButton: boolean = false;
  private _closeButton: boolean = false;
  private _discardChangesButton: boolean = false;
  private _deleteButton: boolean = false;

  public get entryItem(): TimelogEntryItem { return this._entryItem; }
  public get showDeleteButton(): boolean { return this.tlefService.showDeleteButton; }

  ngOnInit() {
    console.log("footer")
    this._rebuild();
    this.tlefService.formChanged$.subscribe((formChange)=>{
      if(this.tlefService.toolIsOpen){
        this._rebuild();
        
      }else{
        this._entryItem = null;
      }
      
    }); 
    // this.tlefService.footerMode$.subscribe((mode)=>{
    //   this._rebuild();
    // })
    
  }

  private _rebuild(){
    this._entryItem = this.tlefService.openedTimelogEntry;
    const mode = this.tlefService.footerMode;
    if(mode === TLEFFooterMode.NEW){
      this._saveNewButton = true;
      this._saveChangesButton = false;
      this._closeButton = false;
      this._discardChangesButton = false;
      this._deleteButton = false;
    }else if(mode === TLEFFooterMode.MODIFY_EXISTING){

    }else if(mode === TLEFFooterMode.VIEW_EXISTING){

    }
  }

  public onClickSaveNew() {
    console.log("Click saved")
    // this.daybookService.activeDayController.saveTimelogEntryItem$(this.entryItem);
    this.toolboxService.closeTool();
  }

  public onClickSaveChanges(){
    console.log("Saving changes")
  }

  public onDelete() {
    // console.log("Deleting: ", this.entryItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + this.entryItem.endTime.format('YYYY-MM-DD hh:mm a') )
    // this.daybookService.activeDayController.deleteTimelogEntryItem$(this.entryItem);
    this.toolboxService.closeTool();
  }

  public onClickDiscard() {
    console.log("Discarding changes")
    // if (!this._changesMade) {
    //   this.toolboxService.closeTool();
    // } else {
    //   console.log("Warning: need to implement a confirmation here")
    //   this.toolboxService.closeTool();
    // }
  }


}
