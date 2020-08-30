import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { ActivityHttpService } from '../../../../../../activities/api/activity-http.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { AppScreenSizeService } from '../../../../../../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSizeLabel } from '../../../../../../../shared/app-screen-size/app-screen-size-label.enum';
import { ColorConverter } from '../../../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../../../shared/utilities/color-type.enum';
import { TimelogDisplayGridItem } from '../../../timelog-display-grid-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryActivityDisplayItem } from './timelog-entry-activity-display-item.class';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timelog-entry',
  templateUrl: './timelog-entry.component.html',
  styleUrls: ['./timelog-entry.component.css']
})
export class TimelogEntryComponent implements OnInit, OnDestroy {

  constructor(
    private activitiesService: ActivityHttpService,
    private screenSizeService: AppScreenSizeService,
    private daybookService: DaybookDisplayService) { }

  private _activityItems: TimelogEntryActivityDisplayItem[] = [];
  private _remainingItems: TimelogEntryActivityDisplayItem[] = [];
  private _noteText = '';
  private _noteTextSmall = '';
  private _hasText = false;

  public screenSize: AppScreenSizeLabel;

  @Input() public gridItem: TimelogDisplayGridItem;

  private _backgroundColor = '';

  public get isLargeSize(): boolean { return this.gridItem.isLargeItem; }
  public get isSmallSize(): boolean { return this.gridItem.isSmallItem; }
  public get isVerySmallSize(): boolean { return this.gridItem.isVerySmallItem; }
  public get isNormalSize(): boolean { return !this.isSmallSize && !this.isVerySmallSize && !this.isLargeSize; }

  public get hasText(): boolean { return this._hasText; }
  public get backgroundColor(): string { return this._backgroundColor; }

  public get activityItems(): TimelogEntryActivityDisplayItem[] { return this._activityItems; }
  public get remainingItems(): TimelogEntryActivityDisplayItem[] { return this._remainingItems; }

  public get noteText(): string { return this._noteText; }
  public get noteTextSmall(): string { return this._noteTextSmall; }


  private _subscriptions: Subscription[] = [];

  ngOnInit() {
    this.screenSize = this.screenSizeService.appScreenSize.label;
    this._rebuild(this._calculateMaxItems());

    this._subscriptions = [
      this.screenSizeService.appScreenSize$.subscribe((size) => {
        this.screenSize = size.label;
        this._rebuild(this._calculateMaxItems());
      }),
      this.activitiesService.activityTree$.subscribe((treeChanged) => {
        this._rebuild(this._calculateMaxItems());
      }),
    ];
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  public onClickOpenTimelogEntry() {
    this.daybookService.openTimelogGridItem(this.gridItem);
  }

  private _calculateMaxItems(): number {
    const table: {
      screenSize: AppScreenSizeLabel,
      itemSize: 'VERY_SMALL' | 'SMALL' | 'NORMAL' | 'LARGE',
      maxItems: number
    }[] = [
        { screenSize: AppScreenSizeLabel.MOBILE, itemSize: 'VERY_SMALL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.MOBILE, itemSize: 'SMALL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.MOBILE, itemSize: 'NORMAL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.MOBILE, itemSize: 'LARGE', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.TABLET, itemSize: 'VERY_SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.TABLET, itemSize: 'SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.TABLET, itemSize: 'NORMAL', maxItems: 4 },
        { screenSize: AppScreenSizeLabel.TABLET, itemSize: 'LARGE', maxItems: 4 },
        { screenSize: AppScreenSizeLabel.NORMAL, itemSize: 'VERY_SMALL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.NORMAL, itemSize: 'SMALL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.NORMAL, itemSize: 'NORMAL', maxItems: 2 },
        { screenSize: AppScreenSizeLabel.NORMAL, itemSize: 'LARGE', maxItems: 4 },
        { screenSize: AppScreenSizeLabel.LARGE, itemSize: 'VERY_SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.LARGE, itemSize: 'SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.LARGE, itemSize: 'NORMAL', maxItems: 4 },
        { screenSize: AppScreenSizeLabel.LARGE, itemSize: 'LARGE', maxItems: 6 },
        { screenSize: AppScreenSizeLabel.VERY_LARGE, itemSize: 'VERY_SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.VERY_LARGE, itemSize: 'SMALL', maxItems: 3 },
        { screenSize: AppScreenSizeLabel.VERY_LARGE, itemSize: 'NORMAL', maxItems: 6 },
        { screenSize: AppScreenSizeLabel.VERY_LARGE, itemSize: 'LARGE', maxItems: 6 },
      ];
    let itemSize: 'VERY_SMALL' | 'SMALL' | 'NORMAL' | 'LARGE';
    if (this.isVerySmallSize) {
      itemSize = 'VERY_SMALL';
    } else if (this.isSmallSize) {
      itemSize = 'SMALL';
    } else if (this.isNormalSize) {
      itemSize = 'NORMAL';
    } else if (this.isLargeSize) {
      itemSize = 'LARGE';
    }
    const foundItem = table.find(item => item.itemSize === itemSize && item.screenSize === this.screenSize);
    if (foundItem) {
      return foundItem.maxItems;
    } else {
      console.log('Error determining Timelog Entry max items size');
      return 2;
    }
  }

  private _rebuild(maxItems: number) {
    const activityItems: TimelogEntryActivityDisplayItem[] = [];
    const remainingItems: TimelogEntryActivityDisplayItem[] = [];
    this._setNoteText();
    if (this.gridItem.timelogEntries.length > 0) {
      let mergedTimelogEntry = this.gridItem.timelogEntries[0];
      if (this.gridItem.timelogEntries.length > 1) {

        const startTime = moment(this.gridItem.startTime);
        const endTime = moment(this.gridItem.endTime);
        let activities: { activityTreeId: string, milliseconds: number }[] = [];
        this.gridItem.timelogEntries.forEach((timelogEntry) => {
          activities = [...activities, ...timelogEntry.timelogEntryActivities.map((tlea) => {
            const tleMS = timelogEntry.durationMilliseconds;
            const milliseconds: number = (tlea.percentage / 100) * tleMS;
            return {
              activityTreeId: tlea.activityTreeId,
              milliseconds: milliseconds,
            };
          })];
        });
        mergedTimelogEntry = new TimelogEntryItem(startTime, endTime);
        const totalMS = mergedTimelogEntry.durationMilliseconds;
        mergedTimelogEntry.timelogEntryActivities = activities.map((activity) => {
          const percentage = (activity.milliseconds / totalMS) * 100;
          // console.log("Percentage: " + percentage)
          return {
            activityTreeId: activity.activityTreeId,
            percentage: percentage,
          };
        });
      }
      const entryDurationMS: number = mergedTimelogEntry.durationMilliseconds;
      let itemsRemainingCount = maxItems;
      let backgroundColorSet = false;
      mergedTimelogEntry.timelogEntryActivities.sort((a1, a2) => {
        if (a1.percentage > a2.percentage) {
          return -1;
        } else if (a1.percentage < a2.percentage) {
          return 1;
        } else { return 0; }
      }).forEach((activityEntry) => {
        const foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
        if (!backgroundColorSet) {
          const alpha = 0.04;
          this._backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
          backgroundColorSet = true;
        }
        const durationMS: number = (activityEntry.percentage * entryDurationMS) / 100;

        const activityDisplayItem: TimelogEntryActivityDisplayItem = new TimelogEntryActivityDisplayItem(durationMS, foundActivity);
        if (itemsRemainingCount > 0) {
          activityItems.push(activityDisplayItem);
          itemsRemainingCount -= 1;
        } else {
          remainingItems.push(activityDisplayItem);
        }
      });
    } else {
      console.log('no timelog entry');
    }
    this._activityItems = activityItems;
    this._remainingItems = remainingItems;
  }

  private _setNoteText() {
    let noteText = '';
    let textFound = false;
    this.gridItem.timelogEntries.sort((tle1, tle2) => {
      if (tle1.durationMilliseconds > tle2.durationMilliseconds) {
        return -1;
      } else if (tle1.durationMilliseconds < tle2.durationMilliseconds) {
        return 1;
      } else {
        return 0;
      }
    }).forEach((tle) => {
      if (!textFound) {
        if (tle.embeddedNote) {
          noteText = tle.embeddedNote;
          textFound = true;
        }
      }
    });
    if (textFound) {
      if (this.isNormalSize || this.isLargeSize) {
        if (noteText.length > 80) {
          this._noteText = noteText.substring(0, 80) + '...';
        } else {
          this._noteText = noteText;
        }
        this._noteTextSmall = '';
      } else {
        if (noteText.length > 30) {
          this._noteTextSmall = noteText.substring(0, 30) + '...';
        } else {
          this._noteTextSmall = noteText;
        }
        this._noteText = '';
      }
      this._hasText = true;
    } else {
      this._hasText = false;
    }

  }
}
