import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

import { ActivityScheduleRepitition } from '../../api/activity-schedule-repitition.interface';
import { ActivityScheduleRepititionDisplay } from './activity-schedule-repitition-display.class';

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
    let repititionItems: ActivityScheduleRepititionDisplay[] = [];
    this.activity.scheduleRepititions.forEach((repitition: ActivityScheduleRepitition)=>{
      repititionItems.push(new ActivityScheduleRepititionDisplay(repitition));
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

  private _repititionItems: ActivityScheduleRepititionDisplay[] = [];
  public get repititionItems(): ActivityScheduleRepititionDisplay[] {
    return this._repititionItems;
  }

  private _saveDisabled: boolean = false;
  public get saveDisabled(): boolean{
    return this._saveDisabled;
  }

  faSave = faSave;
  
}
