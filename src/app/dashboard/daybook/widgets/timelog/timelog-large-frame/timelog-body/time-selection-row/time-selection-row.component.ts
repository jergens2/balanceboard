import { Component, OnInit, Input } from '@angular/core';
import { TimeSelectionRow } from './time-selection-row.class';

import { faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { ToolboxService } from '../../../../../../../toolbox-menu/toolbox.service';
import { TimelogEntryFormService } from '../../../timelog-entry-form/timelog-entry-form.service';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogDelineator, TimelogDelineatorType } from '../../../timelog-delineator.class';

@Component({
  selector: 'app-time-selection-row',
  templateUrl: './time-selection-row.component.html',
  styleUrls: ['./time-selection-row.component.css']
})
export class TimeSelectionRowComponent implements OnInit {


  @Input() row: TimeSelectionRow;

  constructor(private daybookService: DaybookDisplayService) { }

  ngOnInit() {
    if(this.row.timelogDelineator){
      this._editTime = this.row.timelogDelineator.time;
    }
    
    if(this.row.isAvailable){

      // console.log("RoW SECTION START AND END: " + this.row.earliestAvailability.format('hh:mm a') + " to " + this.row.latestAvailability.format('hh:mm a'))
    }
  }

  faCheck = faCheck;
  faEdit = faEdit;
  faTrash = faTrash;

  private _editTime: moment.Moment; 

  public onEditTimeChanged(time: moment.Moment){
    this._editTime = time;  
  }

  public onClickDelineator(delineator: TimelogDelineator){
    if(delineator.delineatorType === TimelogDelineatorType.WAKEUP_TIME){
      this.daybookService.openWakeupTime();
    }else if(delineator.delineatorType === TimelogDelineatorType.FALLASLEEP_TIME){
      this.daybookService.openFallAsleepTime();
    }
  }

  public onClickSaveEdit(){
    // console.log("on click save edit");
    this.row.updateSavedDelineator(this._editTime);
  }
  public onClickDelete(){
    this.row.deleteDelineator(this.row.timelogDelineator.time);
  }

  public onClickNowDelineator(){
    this.daybookService.openNewCurrentTimelogEntry();
  }


}
