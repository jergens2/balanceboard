import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

import { ActivityScheduleRepitition } from '../../api/activity-schedule-repitition.interface';
import { ActivityRepititionDisplay } from './activity-repitition-display/activity-repitition-display.class';

import { faSave, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { TimeUnit } from '../../../../shared/utilities/time-unit.enum';
import * as moment from 'moment';

@Component({
  selector: 'app-activity-schedule-configuration',
  templateUrl: './activity-schedule-configuration.component.html',
  styleUrls: ['./activity-schedule-configuration.component.css']
})
export class ActivityScheduleConfigurationComponent implements OnInit {

  constructor() { }
  private _activity: ActivityCategoryDefinition;
  @Input() public set activity(activity: ActivityCategoryDefinition){
    this._activity = activity;
    this.update();
  }
  public get activity(): ActivityCategoryDefinition{
    return this._activity;
  }

  private originalValue: ActivityScheduleRepitition[] = [];

  ngOnInit() {
    console.log("Activity schedule configuration: ", this.activity.scheduleRepititions)
    // this.originalValue = Object.assign([], this.activity.scheduleRepititions);
    this.activity.scheduleRepititions.forEach((repitition)=>{
      let newRep = Object.assign({}, repitition);
      this.originalValue.push(newRep);
    })
    console.log("original valuie is: "+ this.originalValue.length, this.originalValue);
    let repititionItems: ActivityRepititionDisplay[] = [];
    this.activity.scheduleRepititions.forEach((repitition: ActivityScheduleRepitition)=>{
      repititionItems.push(new ActivityRepititionDisplay(repitition));
    });
    this._repititionItems = repititionItems;
    this.update();
  }

  public newRepitition: ActivityRepititionDisplay = new ActivityRepititionDisplay({
    unit: TimeUnit.Day,
    frequency: 1,
    occurrences: [],
    startDateTimeISO: moment().startOf("year").toISOString(),
  });


  public onRepititionSaved(repitition: ActivityScheduleRepitition){

    if(repitition != null){
      console.log("Saving repitition:" , repitition);
      this._repititionItems.push(new ActivityRepititionDisplay(repitition));
      console.log("REPITITION ITEMS: ", this._repititionItems.length, this._repititionItems)
      this.update();
    }
    this.addingRepitition = false;
    this.updateValidity();
  }

  @Output() configurationSaved: EventEmitter<ActivityScheduleRepitition[]> = new EventEmitter(); 
  public onClickSaveConfiguration(){
    this.configurationSaved.emit(this.repititionItems.map((item)=>{ return item.repititionItem; }));
  }
  public onClickDiscard(){

    console.log("Repititions: ", this.repititionItems);
    let activity = this.activity;
    console.log("Discarding.  Original valuie is: "+ this.originalValue.length, this.originalValue);
    activity.scheduleRepititions = this.originalValue;
    this._activity = activity;
    this.configurationSaved.emit(null);
  }

  private _repititionSusbscriptions: Subscription[] = [];
  private update(){
    this._repititionSusbscriptions.forEach((sub)=>{ sub.unsubscribe(); });
    this._repititionSusbscriptions = [];

    this._repititionItems.forEach((repititionItem)=>{
      this._repititionSusbscriptions.push(repititionItem.settingChanged$.subscribe((event)=>{
        this.updateValidity();
        // this.saveRepititions();
      }));
    });
  }

  // private saveRepititions(){
  //   let activity: ActivityCategoryDefinition = this.activity;
  //   activity.scheduleRepititions = this._repititionItems.map((item)=>{ return item.repititionItem; });
  //   this.activity = activity;
  // }

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

  private _mouseIsOver: boolean = false;
  public get mouseIsOver(): boolean{
    return this._mouseIsOver;
  } 
  public onMouseEnter(){
    this._mouseIsOver = true;
  }
  public onMouseLeave(){
    this._mouseIsOver = false;
  }


  public addingRepitition: boolean = false;
  public onClickAddRepitition(){
    this.newRepitition = new ActivityRepititionDisplay({
      unit: TimeUnit.Day,
      frequency: 1,
      occurrences: [],
      startDateTimeISO: moment().startOf("year").toISOString(),
    });
    this.addingRepitition = true;
    this._saveDisabled = true;
  }

  public onRepititionDeleted(repitition: ActivityRepititionDisplay){
    let index = this._repititionItems.indexOf(repitition);
    if(index > -1){
      this._repititionItems.splice(index, 1);
    }else{
      console.log("Error deleting");
    }
  }

  faSave = faSave;
  faPlus = faPlus;
  
}
