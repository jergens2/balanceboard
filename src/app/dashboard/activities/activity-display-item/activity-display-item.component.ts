import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { ActivityScheduleRepitition } from '../api/activity-schedule-repitition.interface';
import { ActivityCategoryDefinitionService } from '../api/activity-category-definition.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ActivityComponentService } from '../activity-component.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-display-item',
  templateUrl: './activity-display-item.component.html',
  styleUrls: ['./activity-display-item.component.css']
})
export class ActivityDisplayItemComponent implements OnInit, OnDestroy {

  constructor(private activityService: ActivityComponentService, private activityDefService: ActivityCategoryDefinitionService) { }

  private _activity: ActivityCategoryDefinition;

  private _color: string;
  private _originalColor: string;

  private _titleBorderBottom: any = {};
  private _colorPickerIsOpen: boolean = false;

  private _showAnalysisContent: boolean = true;
  private _showConfigContent: boolean = false;
  private _showDeleteContent: boolean = false;

  public get color(): string { return this._color; }

  public get faTrash() { return faTrash };
  public get activity(): ActivityCategoryDefinition { return this._activity; }

  public get titleBorderBottom(): any { return this._titleBorderBottom; }
  public get colorPickerIsOpen(): boolean { return this._colorPickerIsOpen; };
  public configuringSchedule: boolean = false;

  public get showAnalysisContent(): boolean { return this._showAnalysisContent; }
  public get showConfigContent(): boolean { return this._showConfigContent; }
  public get showDeleteContent(): boolean { return this._showDeleteContent; }

  // public get isLoading(): boolean { return this.activityService.isLoading; }
  // public get loadingMessage(): string { return this.activityService.loadingMessage; }

  private _activitySubs: Subscription[] = [];
  ngOnInit() {
    this._activitySubs = [
      this.activityService.currentActivity$.subscribe((activityChanged) => { this._updateDisplay(activityChanged); })
    ];
  }

  ngOnDestroy(){
    this._activitySubs.forEach(s => s.unsubscribe());
    this._activitySubs = [];
  }

  public onNameChanged(newName: string){
    this._activity.name = newName;
    this.activityDefService.updateActivity$(this._activity);
  }
  public onClickHeader(value: 'ANALYSIS' | 'CONFIG' | 'DELETE'){
    if(value === 'ANALYSIS'){
      this._showAnalysisContent = !this._showAnalysisContent;
    }
    if(value === 'CONFIG'){
      this._showConfigContent = !this._showConfigContent;
    }
    if(value === 'DELETE'){
      this._showDeleteContent = !this._showDeleteContent;
    }
  }

  public onConfigurationSaved(repititions: ActivityScheduleRepitition[]) {

    if (repititions != null) {
      let activity = this.activity;
      activity.scheduleRepititions = repititions;
      this.activityDefService.updateActivity$(activity);
      this._activity = activity;
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
    this.activityDefService.updateActivity$(activity);
    this._activity = activity;
    this.configuringSchedule = false;
  }
  public onClickOpenColorPicker() {
    this._colorPickerIsOpen = true;
  }
  public onPermanentlyDeleteActivity(){
    this.activityService.executePermanentlyDeleteActivity();
  }
  public onClickSaveColorPicker(color: string) {
    // console.log("Saving color: ", color);
    this._originalColor = color;
    this._color = color;
    this.activity.color = color;
    this._colorPickerIsOpen = false;

    this.activityDefService.updateActivity$(this.activity);
  }
  public onClickCancelColorPicker() {
    // console.log("Color picker cancelled")
    this._color = this._originalColor;
    this._colorPickerIsOpen = false;
  }
  public onColorChanged(color: string) {
    // console.log("Color changed (RGBA): ", color);
    this._color = color;
  }



  public onClickRestore(){
    this._activity.removeFromTrash();
    this.activityDefService.updateActivity$(this._activity);
  }

  private _updateDisplay(activity: ActivityCategoryDefinition) {
    if(activity){
      this._activity = activity;
      this._color = this._activity.color;
      this._originalColor = this._activity.color;
      this._titleBorderBottom = { "border-bottom": "1px solid " + this.activity.color };
      this.configuringSchedule = false;
    }
  }

}
