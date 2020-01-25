import { Component, OnInit, Input } from '@angular/core';
import { TimeSelectionRow } from './time-selection-row.class';

import { faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'app-time-selection-row',
  templateUrl: './time-selection-row.component.html',
  styleUrls: ['./time-selection-row.component.css']
})
export class TimeSelectionRowComponent implements OnInit {


  @Input() row: TimeSelectionRow;

  constructor() { }

  ngOnInit() {
    this._editTime = this.row.savedDelineatorTime;
    if(this.row.isAvailable){

      console.log("RoW SECTION START AND END: " + this.row.earliestAvailability.format('hh:mm a') + " to " + this.row.latestAvailability.format('hh:mm a'))
    }
  }

  faCheck = faCheck;
  faEdit = faEdit;
  faTrash = faTrash;

  private _editTime: moment.Moment; 

  public onEditTimeChanged(time: moment.Moment){
    this._editTime = time;  
  }

  public onClickSaveEdit(){
    console.log("on click save edit");
    this.row.updateSavedDelineator(this._editTime);
  }

}
