import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ActivityHttpService } from '../../../../../../activities/api/activity-http.service';
import { TimelogEntryActivity } from '../../../../../daybook-day-item/data-items/timelog-entry-activity.interface';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';
import { TimelogEntryDecorator } from '../timelog-entry-decorator.class';
import { TimelogEntryDisplayItemUnit } from '../../../timelog-large-frame/timelog-body/timelog-entry/tle-display-item-unit.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';

@Component({
  selector: 'app-tlef-view-only',
  templateUrl: './tlef-view-only.component.html',
  styleUrls: ['./tlef-view-only.component.css']
})
export class TlefViewOnlyComponent implements OnInit {

  private _entryItem: TimelogEntryItem;
  public get entryItem(): TimelogEntryItem { return this._entryItem; }

  private _noteText: string = "";

  public get noteText(): string { return this._noteText; }

  private _pencilStyle: any = {'color':'rgb(211, 211, 211)'};
  public get pencilStyle(): any { return this._pencilStyle; }

  public onMouseEnter(){
    this._pencilStyle = {'color':'gray'};
  }
  public onMouseLeave(){
    this._pencilStyle = {'color':'rgb(211, 211, 211)'};
  }

  // private _isEditing: boolean = false;

  @Output() public editing: EventEmitter<boolean> = new EventEmitter();
  constructor(private daybookService: DaybookDisplayService, private activitiesService: ActivityHttpService) { }

  // public get isEditing(): boolean { return this._isEditing; }

  private _displayActivities: { 
    activity: ActivityCategoryDefinition, 
    durationMS: number, 
    units: TimelogEntryDisplayItemUnit[],
    durationString: string,
    }[] = [];

  ngOnInit() {
    this._update();
    this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((change)=>{
      if(change && change.item.isTLEItem){
        this._update();
      }
      
    })
  }

  private _update(){
    if(this.daybookService.tlefController.currentlyOpenTLEFItem){
      this._entryItem = this.daybookService.tlefController.currentlyOpenTLEFItem.item.getInitialTLEValue();
      if(this._entryItem.embeddedNote){
        this._noteText = this._entryItem.embeddedNote;
      }else{
        this._noteText = "No note";
      }
      const decorator: TimelogEntryDecorator = new TimelogEntryDecorator(this.activitiesService);
      this._displayActivities = this.entryItem.timelogEntryActivities.map(item => {
        const activity = this.activitiesService.findActivityByTreeId(item.activityTreeId);
        const durationMS = this.entryItem.durationMilliseconds * (item.percentage / 100);
        const units = decorator.getActivityUnits(item, (durationMS/(1000*60)));
        const durationString = DurationString.getDurationStringFromMS(durationMS, true);
        return {
          activity: activity,
          durationMS: durationMS,
          units: units,
          durationString: durationString,
        };
  
      });
    }
    
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
