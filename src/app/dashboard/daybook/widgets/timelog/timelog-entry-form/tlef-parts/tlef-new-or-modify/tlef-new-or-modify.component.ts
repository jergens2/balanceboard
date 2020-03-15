import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimelogEntryDataItem } from '../../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { TimelogEntryFormService } from '../../timelog-entry-form.service';

@Component({
  selector: 'app-tlef-new-or-modify',
  templateUrl: './tlef-new-or-modify.component.html',
  styleUrls: ['./tlef-new-or-modify.component.css']
})
export class TlefNewOrModifyComponent implements OnInit {

  constructor(private tlefService: TimelogEntryFormService) { }

  private _initialActivities: TimelogEntryActivity[] = [];
  private _entryItem: TimelogEntryItem;

  public get timelogEntry(): TimelogEntryItem { return this._entryItem; }

  public get initialActivities(): TimelogEntryActivity[] { 
    return this._initialActivities;
  }

  ngOnInit() {
    // console.log("from service: " )
    // console.log("thing 1: " , this.tlefService.openedTimelogEntry)
    // console.log("thing 2: " , this.tlefService.openedTimelogEntry.timelogEntryActivities);
   this._setEntryItem();
    this.tlefService.formChanged$.subscribe((formChange)=>{
      if(this.tlefService.toolIsOpen){
        this._setEntryItem();
      }else{
        this._entryItem = null;
      }
      
    }); 
    
  }

  private _setEntryItem(){
    this._entryItem = this.tlefService.openedTimelogEntry;
    this._initialActivities = [];
    // console.log("Setting entry itme in NEW OR MODIFY component " , this._entryItem)
    if(this._entryItem){
      console.log("Entry item is " , this._entryItem.timelogEntryActivities.length)
      if(this._entryItem.timelogEntryActivities){
        this._entryItem.timelogEntryActivities.forEach((item)=>{
          this._initialActivities.push(item);
        });
      }
    }

    // console.log("initial activities: " + this._initialActivities.length , this._initialActivities)
  }

  public onActivitiesChanged(activities: TimelogEntryActivity[]){
    this._entryItem.timelogEntryActivities = activities;
  }

}
