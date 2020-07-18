import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { DaybookHttpRequestService } from '../../../daybook/api/daybook-http-request.service';
import { ActivityCategoryDefinition } from '../../api/activity-category-definition.class';
import { DaybookDayItem } from '../../../daybook/api/daybook-day-item.class';
import * as moment from 'moment';
import { ActivityTLEItem } from '../activty-tle-item.class';
import { TimelogEntryBuilder } from '../../../daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { ActivityComponentService } from '../../activity-component.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-activity-delete-options',
  templateUrl: './activity-delete-options.component.html',
  styleUrls: ['./activity-delete-options.component.css']
})
export class ActivityDeleteOptionsComponent implements OnInit, OnDestroy {

  constructor(private daybookHttpService: DaybookHttpRequestService, private activityService: ActivityComponentService) { }



  private _deleteAction: 'MERGE' | 'TRASH' | 'PERMADELETE'
  private _isLoading: boolean = true;
  private _activity: ActivityCategoryDefinition;
  private _activityItems: ActivityTLEItem[] = [];

  @Input() public set activity(activity: ActivityCategoryDefinition){ 
    this._activity = activity;
  }
  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();

  public get activity(): ActivityCategoryDefinition { return this._activity; }
  public get actionIsMerge(): boolean { return this._deleteAction === 'MERGE';}
  public get actionIsTrash(): boolean { return this._deleteAction === 'TRASH'; }
  public get actionIsPermaDel(): boolean { return this._deleteAction === 'PERMADELETE';}
  public get isLoading(): boolean { return this._isLoading; }
  public get activityItems(): ActivityTLEItem[] { return this._activityItems; }
  

  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if(this.activity.children.length === 0){
      this._subscriptions = [this.daybookHttpService.getAllItems$().subscribe((allDaybookItems: DaybookDayItem[])=>{
        this._rebuildActivityItems(allDaybookItems);
        this._isLoading = false;
      })];
    }else{
      this._isLoading = false;
    }

  }
  ngOnDestroy(){
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  public onClickCancel(){
    this.cancel.emit(true);
  }
  public onClickMergeOption(){ this._deleteAction = 'MERGE'; }
  public onClickTrashOption(){ this._deleteAction = 'TRASH'; }
  public onClickPermaDelOption(){ this._deleteAction = 'PERMADELETE'; }

  public dateString(daybookItem: DaybookDayItem): string { return moment(daybookItem.dateYYYYMMDD).format('YYYY-MM-DD'); }
  public dayOfWeek(daybookDayItem: DaybookDayItem): string { return moment(daybookDayItem.dateYYYYMMDD).format('dddd')}

  public onDeleteActivity(){
    this.activityService.executeDeleteActivity();
  }


  private _rebuildActivityItems(allItems: DaybookDayItem[]){
    const activityTreeId = this._activity.treeId;
    const relevantItems = allItems.filter(daybookDayItem=>{
      return daybookDayItem.timelogEntryDataItems.find(tleDi => 
        tleDi.timelogEntryActivities.find(tleA => 
          tleA.activityTreeId === activityTreeId));
    });
    let activityItems: ActivityTLEItem[] = [];
    relevantItems.forEach(daybookDayItem => {
      const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
      const timelogEntries = daybookDayItem.timelogEntryDataItems.map(tlea => tleBuilder.buildFromDataItem(tlea));
      timelogEntries.filter(tle => tle.timelogEntryActivities.find(tlea => tlea.activityTreeId === this.activity.treeId))
        .forEach(tle => {
          activityItems.push(new ActivityTLEItem(tle, this.activity));
        });
    });
    this._activityItems = activityItems;

  }
}
