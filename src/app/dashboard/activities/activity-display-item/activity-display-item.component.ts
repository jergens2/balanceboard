import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { ActivityScheduleRepitition } from '../api/activity-schedule-repitition.interface';
import { ActivityCategoryDefinitionService } from '../api/activity-category-definition.service';

@Component({
  selector: 'app-activity-display-item',
  templateUrl: './activity-display-item.component.html',
  styleUrls: ['./activity-display-item.component.css']
})
export class ActivityDisplayItemComponent implements OnInit {

  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  private _activity: ActivityCategoryDefinition;
  @Input() public set activity(activity: ActivityCategoryDefinition) {
    this._activity = activity;
    this.color = this._activity.color;
    this._originalColor = this._activity.color;
    this.updateDisplay();
  };
  public get activity(): ActivityCategoryDefinition {
    return this._activity;
  }

  ngOnInit() {
    if (this.activity != null) {
      this.updateDisplay();
    }
  }

  private updateDisplay() {
    this._titleBorderBottom = { "border-bottom": "1px solid " + this.activity.color };
    this.configuringSchedule = false;
  }

  public onConfigurationSaved(repititions: ActivityScheduleRepitition[]) {

    if (repititions != null) {
      let activity = this.activity;
      activity.scheduleRepititions = repititions;
      this.activitiesService.updateActivity(activity);
      this.activity = activity;
    } else {
      console.log("Repititions was null, so it was a discard.")
      console.log("activity:", this.activity);
    }
    this.configuringSchedule = false;
  }
  public onConfigurationDeleted() {
    console.log("onconfig deleted")
    let activity = this.activity;
    activity.scheduleRepititions = [];
    this.activitiesService.updateActivity(activity);
    this.activity = activity;
    this.configuringSchedule = false;
  }

  private _titleBorderBottom: any = {};
  public get titleBorderBottom(): any {
    return this._titleBorderBottom;
  }

  public configuringSchedule: boolean = false;


  private _colorPickerIsOpen: boolean = false;
  public get colorPickerIsOpen(): boolean { return this._colorPickerIsOpen; };
  public onClickOpenColorPicker() {
    this._colorPickerIsOpen = true;
  }



  color: string;

  private _originalColor: string;


  public onClickSaveColorPicker(color: string) {
    // console.log("Saving color: ", color);
    this._originalColor = color;
    this.color = color;
    this.activity.color = color;
    this._colorPickerIsOpen = false;

    this.activitiesService.updateActivity(this.activity);
  }


  public onClickCancelColorPicker() {
    // console.log("Color picker cancelled")
    this.color = this._originalColor;
    this._colorPickerIsOpen = false;
  }
  public onColorChanged(color: string) {
    // console.log("Color changed (RGBA): ", color);
    this.color = color;
  }


}
