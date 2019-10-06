import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';

import { ActivityScheduleRepitition } from '../../api/activity-schedule-repitition.interface';
import { ActivityRepititionDisplay } from './activity-repitition-display/activity-repitition-display.class';

import { faSave, faPlus, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { TimeUnit } from '../../../../shared/utilities/time-utilities/time-unit.enum';
import * as moment from 'moment';
import { ItemState } from '../../../../shared/utilities/item-state.class';

@Component({
  selector: 'app-activity-schedule-configuration',
  templateUrl: './activity-schedule-configuration.component.html',
  styleUrls: ['./activity-schedule-configuration.component.css']
})
export class ActivityScheduleConfigurationComponent implements OnInit {

  constructor() { }
  private _activity: ActivityCategoryDefinition;
  @Input() public set activity(activity: ActivityCategoryDefinition) {
    this._activity = activity;
    this.update();
  }
  public get activity(): ActivityCategoryDefinition {
    return this._activity;
  }


  private _itemState: ItemState;
  public get itemState(): ItemState { return this._itemState; }

  ngOnInit() {
    let repititionItems: ActivityRepititionDisplay[] = [];
    this._itemState = new ItemState(this.activity.scheduleRepititions);

    if (this.activity.scheduleRepititions.length == 0) {
      this._itemState.isNew = true;
      this._itemState.isValid = false;
      this.onClickAddRepitition();
    } else if (this.activity.scheduleRepititions.length > 0) {
      this.activity.scheduleRepititions.forEach((repitition: ActivityScheduleRepitition) => {
        repititionItems.push(new ActivityRepititionDisplay(repitition));
      });
    }

    this._repititionItems = repititionItems;
    this.update();
  }



  public newRepitition: ActivityRepititionDisplay = new ActivityRepititionDisplay({
    unit: TimeUnit.Day,
    frequency: 1,
    occurrences: [],
    startDateTimeISO: moment().startOf("year").toISOString(),
  });

  public onRepititionUpdated(updateRepitition: ActivityRepititionDisplay) {
    if (updateRepitition != null) {
      updateRepitition.stopEditing();
      this.update();
      this.updateValidity();
      this._itemState.reset();
      this._itemState.isChanged = true;
    }
  }

  public onRepititionSaved(repitition: ActivityScheduleRepitition) {
    if (repitition != null) {
      console.log("Saving repitition:", repitition);
      this._repititionItems.push(new ActivityRepititionDisplay(repitition));
      console.log("REPITITION ITEMS: ", this._repititionItems.length, this._repititionItems)
      this.update();
      this.updateValidity();
      this._itemState.reset();
      this._itemState.isChanged = true;
    }
    this._addingRepitition = false;
    this.update();
    this.updateValidity();
  }

  @Output() configurationSaved: EventEmitter<ActivityScheduleRepitition[]> = new EventEmitter();
  public onClickSaveConfiguration() {
    this.configurationSaved.emit(this.repititionItems.map((item) => { return item.exportRepititionItem; }));
    this._itemState.reset();
  }



  public get unsavedChanges(): boolean {
    return this._itemState.isChanged || this._itemState.isNew;
  }
  public onClickDiscard() {
    let activity = this.activity;
    activity.scheduleRepititions = this._itemState.cancelAndReturnOriginalValue();
    this._activity = activity;
    this.configurationSaved.emit(null);
    this._itemState.reset();
  }

  private _repititionSubscriptions: Subscription[] = [];
  private update() {
    this._repititionSubscriptions.forEach((sub) => { sub.unsubscribe(); });
    this._repititionSubscriptions = [];

    this._repititionItems.forEach((repititionItem) => {
      this._repititionSubscriptions.push(repititionItem.itemState.isChanged$.subscribe((event) => {
        this.updateValidity();
      }));
      this._repititionSubscriptions.push(repititionItem.itemState.isNew$.subscribe((event) => {
        this.updateValidity();
      }));
      this._repititionSubscriptions.push(repititionItem.itemState.isEditing$.subscribe((event) => {
        this.updateValidity();
      }));
      this._repititionSubscriptions.push(repititionItem.itemState.isValid$.subscribe((event) => {
        this.updateValidity();
      }));
      this._repititionSubscriptions.push(repititionItem.itemState.delete$.subscribe((deleted) => {
        if (deleted === true) {
          this.onRepititionDeleted(repititionItem);
        }
      }));
    });

  }


  // private saveRepititions(){
  //   let activity: ActivityCategoryDefinition = this.activity;
  //   activity.scheduleRepititions = this._repititionItems.map((item)=>{ return item.repititionItem; });
  //   this.activity = activity;
  // }

  private updateValidity() {
    let allValid: boolean = true;
    this._repititionItems.forEach((item) => {
      if (!item.isValid) {
        allValid = false;
        // console.log("** false because child isInvalid");
      }
      if (item.isEditing || item.isNew) {
        allValid = false;
        // console.log("** false because child isEditing or isNew");
      }
    });

    if (this.addingRepitition) {
      allValid = false;
      // console.log("** false because adding repititoin ");
    }
    this._itemState.isValid = allValid;
    // console.log("Schedule configuration is valid? ", this._itemState.isValid);
    // this._itemState.isChanged = true;
  }

  private _repititionItems: ActivityRepititionDisplay[] = [];
  public get repititionItems(): ActivityRepititionDisplay[] {
    return this._repititionItems;
  }

  public get saveDisabled(): boolean {
    return !this._itemState.isValid;
  }


  public get mouseIsOver(): boolean {
    return this._itemState.mouseIsOver;
  }
  public onMouseEnter() {
    this._itemState.onMouseEnter();
  }
  public onMouseLeave() {
    this._itemState.onMouseLeave();
  }


  private _addingRepitition: boolean = false;
  public get addingRepitition(): boolean {
    return this._addingRepitition;
  }
  public onClickAddRepitition() {
    this.newRepitition = new ActivityRepititionDisplay({
      unit: TimeUnit.Day,
      frequency: 1,
      occurrences: [],
      startDateTimeISO: moment().startOf("year").toISOString(),
    });
    this.newRepitition.isNew = true;
    this._addingRepitition = true;
    this.updateValidity();
    this._itemState.isEditing = true;
  }

  public onRepititionDeleted(repitition: ActivityRepititionDisplay) {
    let index = this._repititionItems.indexOf(repitition);
    if (index > -1) {
      this._repititionItems.splice(index, 1);
    } else {
      console.log("Error deleting");
    }
    this._itemState.isChanged = true;
  }

  faSave = faSave;
  faPlus = faPlus;
  faExclamationCircle = faExclamationCircle;

}
