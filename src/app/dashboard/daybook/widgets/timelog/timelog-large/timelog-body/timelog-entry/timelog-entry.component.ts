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

@Component({
  selector: 'app-timelog-entry',
  templateUrl: './timelog-entry.component.html',
  styleUrls: ['./timelog-entry.component.css']
})
export class TimelogEntryComponent implements OnInit {

  constructor(private activitiesService: ActivityCategoryDefinitionService, private screenSizeService: ScreenSizeService) { }

  private _displayEntry: TimelogEntryDisplayItem;
  private _entries: TimelogEntryItem[] = [];
  private _activityDisplayEntries: { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] = [];


  private _isSmallEntry: boolean = false;

  public screenSize: AppScreenSize;

  @Input() public set timelogEntries(entryItems: TimelogEntryItem[]) {
    this._entries = entryItems;
    this._rebuild();
  }
  @Input() public set isSmallEntry(isSmall: boolean) {
    this._isSmallEntry = isSmall;
  }

  public get isSmallEntry(): boolean { return this._isSmallEntry; }
  public get timelogEntries(): TimelogEntryItem[] { return this._entries; }
  public get displayEntry(): TimelogEntryDisplayItem { return this._displayEntry; }
  public get activityDisplayEntries(): { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] { return this._activityDisplayEntries; }
  public get backgroundColor(): string { return this.displayEntry.backgroundColor; };
  public get units(): { color: string, unitType: "HOUR" | "FIFTEEN", fill: any[] }[] { return this.displayEntry.units; };
  public get displayString(): string { return this.displayEntry.displayString; };

  ngOnInit() {
    this.screenSize = this.screenSizeService.appScreenSize;
    this.screenSizeService.appScreenSize$.subscribe((size) => {
      this.screenSize = size;
    })
    this.activitiesService.activitiesTree$.subscribe((treeChanged) => {
      this._rebuild();
    });

  }


  private _rebuild() {
    if (this.timelogEntries.length > 0) {
      let displayEntry: TimelogEntryDisplayItem = new TimelogEntryDisplayItem(this.timelogEntries, this.activitiesService.activitiesTree, this.isSmallEntry);
      this._displayEntry = displayEntry;
    } else {

    }
  }



}
