import { Component, Input, OnInit } from '@angular/core';
import { ActivityCategoryDefinition } from 'src/app/app-pages/activities/api/activity-category-definition.class';
import { ActivityHttpService } from 'src/app/app-pages/activities/api/activity-http.service';
import { TimelogEntryActivity } from 'src/app/app-pages/daybook/daybook-day-item/data-items/timelog-entry-activity.interface';
import { DaybookDisplayService } from 'src/app/app-pages/daybook/daybook-display.service';
import { DurationString } from 'src/app/shared/time-utilities/duration-string.class';
import { ColorConverter } from 'src/app/shared/utilities/color-converter.class';
import { ColorType } from 'src/app/shared/utilities/color-type.enum';
import { TimelogEntryActivityDisplayItem } from '../../timelog-body/timelog-entry/timelog-entry-activity-display-item.class';
import { TimelogEntryItem } from '../../timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-timelog-entry-list-item',
  templateUrl: './timelog-entry-list-item.component.html',
  styleUrls: ['./timelog-entry-list-item.component.css']
})
export class TimelogEntryListItemComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private activityService: ActivityHttpService) { }

  private _activityDisplayItems: TimelogEntryActivityDisplayItem[] = [];
  private _backgroundColor: string;

  @Input() public timelogEntry: TimelogEntryItem;

  public durationString(entry: TimelogEntryItem): string {
    return DurationString.calculateDurationString(entry.startTime, entry.endTime);
  }
  public get activityDisplayItems(): TimelogEntryActivityDisplayItem[] { return this._activityDisplayItems; }
  public get backgroundColor(): string { return this._backgroundColor; }
  public onClickEdit(entry: TimelogEntryItem) {
  }
  public onClickDelete(entry: TimelogEntryItem) {
    this.daybookService.daybookController.tleController.deleteTimelogEntryItem(entry.startTime.format('YYYY-MM-DD'), entry);
  }


  public getActivity(activity: TimelogEntryActivity): ActivityCategoryDefinition {
    return this.activityService.findActivityByTreeId(activity.activityTreeId);
  }

  public onClickCircle(){
    
  }


  ngOnInit(): void {
    this._rebuild();

  }

  private _rebuild() {
    const activityItems: TimelogEntryActivityDisplayItem[] = [];
    const remainingItems: TimelogEntryActivityDisplayItem[] = [];

    const entryDurationMS: number = this.timelogEntry.durationMilliseconds;

    let backgroundColorSet = false;
    this.timelogEntry.timelogEntryActivities.sort((a1, a2) => {
      if (a1.percentage > a2.percentage) {
        return -1;
      } else if (a1.percentage < a2.percentage) {
        return 1;
      } else { return 0; }
    }).forEach((activityEntry) => {
      const foundActivity: ActivityCategoryDefinition = this.activityService.findActivityByTreeId(activityEntry.activityTreeId);
      if (!backgroundColorSet) {
        const alpha = 0.04;
        this._backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
        backgroundColorSet = true;
      }
      const durationMS: number = (activityEntry.percentage * entryDurationMS) / 100;

      const activityDisplayItem: TimelogEntryActivityDisplayItem = new TimelogEntryActivityDisplayItem(durationMS, foundActivity);
      activityItems.push(activityDisplayItem);
    });

    this._activityDisplayItems = activityItems;
  }


}
