import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { DaybookHttpService } from '../../../../daybook/api/daybook-http.service';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { DaybookDayItem } from '../../../../daybook/api/daybook-day-item.class';
import * as moment from 'moment';
import { ActivityTLEItem } from '../../activty-tle-item.class';
import { TimelogEntryBuilder } from '../../../../daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class';
import { ActivityComponentService } from '../../../activity-component.service';
import { Subscription } from 'rxjs';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveMenuListItem } from '../../../../../shared/components/responsive-menu-list/responsive-menu-list-item.class';
import { ResponsiveMenuList } from '../../../../../shared/components/responsive-menu-list/responsive-menu-list.class';



@Component({
  selector: 'app-activity-delete-options',
  templateUrl: './activity-delete-options.component.html',
  styleUrls: ['./activity-delete-options.component.css']
})
export class ActivityDeleteOptionsComponent implements OnInit, OnDestroy {

  constructor(private daybookHttpService: DaybookHttpService, private activityService: ActivityComponentService) { }

  public get faArrowRight() { return faArrowRight; }

  private _deleteAction: 'MERGE' | 'TRASH' | 'PERMADELETE' | 'MERGE_WITH_PARENT';
  private _isLoading: boolean = true;
  private _activity: ActivityCategoryDefinition;
  private _activityItems: ActivityTLEItem[] = [];
  private _menu: ResponsiveMenuList;

  @Input() public set activity(activity: ActivityCategoryDefinition) {
    this._activity = activity;
  }
  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();

  public get activity(): ActivityCategoryDefinition { return this._activity; }
  public get actionIsMerge(): boolean { return this._deleteAction === 'MERGE'; }
  public get actionIsTrash(): boolean { return this._deleteAction === 'TRASH'; }
  public get actionIsPermaDel(): boolean { return this._deleteAction === 'PERMADELETE'; }
  public get actionIsMergeWithParent(): boolean { return this._deleteAction === 'MERGE_WITH_PARENT'; }
  public get isLoading(): boolean { return this._isLoading; }
  public get activityItems(): ActivityTLEItem[] { return this._activityItems; }
  public get menu(): ResponsiveMenuList { return this._menu; }
  
  private _subscriptions: Subscription[] = [];
   
  ngOnInit(): void {
    this._menu = new ResponsiveMenuList();
    this._subscriptions = [];
    console.log("Activity: " , this.activity.name + " is root? " , this.activity.isRootLevel)
    if(!this.activity.isInTrash){
      this._subscriptions.push(this._menu.addMenuItem$('Move to trash').subscribe(s => this._deleteAction = 'TRASH'));
    }
    if(!this.activity.isRootLevel){
      this._subscriptions.push(this._menu.addMenuItem$('Merge with parent and permanently delete').subscribe(s => this._deleteAction = 'MERGE_WITH_PARENT'));
    }
    this._subscriptions.push(this._menu.addMenuItem$('Merge with other and permanently delete').subscribe(s => this._deleteAction = 'MERGE'));
    this._subscriptions.push(this._menu.addMenuItem$('Remove all and permanently delete').subscribe(s => this._deleteAction = 'PERMADELETE'));
    if (this.activity.children.length === 0) {
      this._rebuildActivityItems(this.activityService.daybookDayItems);
      this._isLoading = false;
    } else {
      this._isLoading = false;
    }
  }


  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  public onClickCancel() {
    this.cancel.emit(true);
  }
  public onClickMergeOption() { this._deleteAction = 'MERGE'; }
  public onClickTrashOption() { this._deleteAction = 'TRASH'; }
  public onClickPermaDelOption() { this._deleteAction = 'PERMADELETE'; }
  public onClickMergeToParentOption() { this._deleteAction = 'MERGE_WITH_PARENT'; }

  public dateString(daybookItem: DaybookDayItem): string { return moment(daybookItem.dateYYYYMMDD).format('YYYY-MM-DD'); }
  public dayOfWeek(daybookDayItem: DaybookDayItem): string { return moment(daybookDayItem.dateYYYYMMDD).format('dddd') }

  public onDeleteActivity() {
    this.activityService.executePermanentlyDeleteActivity();
  }


  private _rebuildActivityItems(allItems: DaybookDayItem[]) {
    const activityTreeId = this._activity.treeId;
    const relevantItems = allItems.filter(daybookDayItem => {
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
