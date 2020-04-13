import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ScreenSizeService } from '../../../../../../../shared/app-screen-size/screen-size.service';
import { AppScreenSize } from '../../../../../../../shared/app-screen-size/app-screen-size.enum';
import { ColorConverter } from '../../../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../../../shared/utilities/color-type.enum';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { TimelogEntryDisplayItem } from './timelog-entry-display-item.class';
import { ToolboxService } from '../../../../../../../toolbox-menu/toolbox.service';
import { ToolType } from '../../../../../../../toolbox-menu/tool-type.enum';
import { TimelogDisplayGridItem } from '../../../timelog-display-grid-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryDisplayItemUnit } from './tle-display-item-unit.class';
import { TimelogEntryActivityDisplay } from './timelog-entry-activity-display.class';

@Component({
  selector: 'app-timelog-entry',
  templateUrl: './timelog-entry.component.html',
  styleUrls: ['./timelog-entry.component.css']
})
export class TimelogEntryComponent implements OnInit {

  constructor(
    private activitiesService: ActivityCategoryDefinitionService,
    private screenSizeService: ScreenSizeService,
    private daybookService: DaybookDisplayService) { }

  private _displayEntry: TimelogEntryDisplayItem;
  private _activityItems: TimelogEntryActivityDisplay[] = [];

  public screenSize: AppScreenSize;

  @Input() public gridItem: TimelogDisplayGridItem;


  // public get timelogEntries(): TimelogEntryItem[] { return this.gridItem.timelogEntries; }
  public get displayEntry(): TimelogEntryDisplayItem { return this._displayEntry; }
  public get isSmallEntry(): boolean { return this.displayEntry.isSmallGridItem; }
  public get isLargeSize(): boolean { return this.displayEntry.isLargeGridItem; }
  public get isNormalSize(): boolean { return this.displayEntry.isNormalEntry; }
  public get isVerySmall(): boolean { return this.displayEntry.isVerySmallGridItem; }
  public get backgroundColor(): string { return this.displayEntry.backgroundColor; };
  public get units(): TimelogEntryDisplayItemUnit[] { return this.displayEntry.units; };
  public get displayString(): string { return this.displayEntry.displayString; };

  public get activityItems(): TimelogEntryActivityDisplay[] { return this._activityItems; }

  ngOnInit() {
    this._rebuild();
    this.screenSize = this.screenSizeService.appScreenSize;
    this.screenSizeService.appScreenSize$.subscribe((size) => {
      this.screenSize = size;
    })
    this.activitiesService.activitiesTree$.subscribe((treeChanged) => {
      this._rebuild();
    });

  }

  public onClickOpenTimelogEntry() {
    this.daybookService.openTimelogGridItem(this.gridItem);
  }


  private _rebuild() {
    let displayEntry: TimelogEntryDisplayItem = new TimelogEntryDisplayItem(this.gridItem, this.activitiesService.activitiesTree);
    this._displayEntry = displayEntry;

    
  }



}
