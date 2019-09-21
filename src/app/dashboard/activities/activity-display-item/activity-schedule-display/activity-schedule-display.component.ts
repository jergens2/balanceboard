import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

import { ActivityScheduleRepitition } from '../../api/activity-schedule-repitition.interface';
import { ActivityRepititionDisplay } from './activity-repitition-display/activity-repitition-display.class';

import { faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-activity-schedule-display',
  templateUrl: './activity-schedule-display.component.html',
  styleUrls: ['./activity-schedule-display.component.css']
})
export class ActivityScheduleDisplayComponent implements OnInit {

  constructor() { }
  @Input() activity: ActivityCategoryDefinition;

  ngOnInit() {
    let repititionItems: ActivityRepititionDisplay[] = [];
    this.activity.scheduleRepititions.forEach((repitition: ActivityScheduleRepitition)=>{
      repititionItems.push(new ActivityRepititionDisplay(repitition));
    })
    console.log("count: ", repititionItems.length);
    this._repititionItems = repititionItems;
    this._repititionItems.forEach((repititionItem)=>{
      repititionItem.settingChanged$.subscribe((event)=>{
        this.updateValidity();
      })
    })
  }

  private updateValidity(){
    let allValid: boolean = true;
    this._repititionItems.forEach((item)=>{
      if(!item.isValidToSave){
        allValid = false;
      }
    });
    this._saveDisabled = !allValid;
  }

  private _repititionItems: ActivityRepititionDisplay[] = [];
  public get repititionItems(): ActivityRepititionDisplay[] {
    return this._repititionItems;
  }

  private _saveDisabled: boolean = false;
  public get saveDisabled(): boolean{
    return this._saveDisabled;
  }

  faSave = faSave;
  
}
