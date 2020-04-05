import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-tlef-view-only',
  templateUrl: './tlef-view-only.component.html',
  styleUrls: ['./tlef-view-only.component.css']
})
export class TlefViewOnlyComponent implements OnInit {

  private _entryItem: TimelogEntryItem;
  @Input() public set entryItem(item: TimelogEntryItem) { 
    this._entryItem = item; 
    this._updateDisplayActivities();
  }
  public get entryItem(): TimelogEntryItem { return this._entryItem; }

  // private _isEditing: boolean = false;

  @Output() public editing: EventEmitter<boolean> = new EventEmitter();
  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  // public get isEditing(): boolean { return this._isEditing; }

  private _displayActivities: { activity: ActivityCategoryDefinition, durationMS: number }[] = [];

  ngOnInit() {
    this._updateDisplayActivities();
  }

  private _updateDisplayActivities(){
    this._displayActivities = this.entryItem.timelogEntryActivities.map(item => {
      return {
        activity: this.activitiesService.findActivityByTreeId(item.activityTreeId),
        durationMS: this.entryItem.durationMilliseconds * (item.percentage / 100),
      };

    });
    console.log(this._displayActivities)
  }

  public get displayActivities(): { activity: ActivityCategoryDefinition, durationMS: number }[] { return this._displayActivities; }


  public get activitiesCount(): number {
    return this.entryItem.timelogEntryActivities.length;
  }

  public onClickEdit() {
    this.editing.emit(true);
  }

  // public activityName(activity: TimelogEntryActivity) {
  //   return this.activitiesService.findActivityByTreeId(activity.activityTreeId).name;
  // }

  public durationString(milliseconds: number): string {
    return DurationString.getDurationStringFromMS(milliseconds);
  }

  faPencil = faPencilAlt;

}
