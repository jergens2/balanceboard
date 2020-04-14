import { Component, OnInit, Input, HostListener } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ScreenSizeService } from '../../../../../../../shared/screen-size/screen-size.service';
import { ScreenSizes } from '../../../../../../../shared/screen-size/screen-sizes-enum';
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
import * as moment from 'moment';

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
  private _remainingItems: TimelogEntryActivityDisplay[] = [];

  public screenSize: ScreenSizes;

  @Input() public gridItem: TimelogDisplayGridItem;

  private _backgroundColor: string = "";

  public get isLargeSize(): boolean { return this.gridItem.isLargeGridItem; }
  public get isSmallSize(): boolean { return this.gridItem.isSmallGridItem; }
  public get isVerySmallSize(): boolean { return this.gridItem.isVerySmallItem; }
  public get isNormalSize(): boolean { return !this.isSmallSize && !this.isVerySmallSize && !this.isLargeSize; }

  public get backgroundColor(): string { return this._backgroundColor; };

  public get activityItems(): TimelogEntryActivityDisplay[] { return this._activityItems; }
  public get remainingItems(): TimelogEntryActivityDisplay[] { return this._remainingItems; }

  
  ngOnInit() {
    
    this.screenSize = this.screenSizeService.appScreenSize;
    this._rebuild(this._calculateMaxItems());

    this.screenSizeService.appScreenSize$.subscribe((size) => {
      this.screenSize = size;
      this._rebuild(this._calculateMaxItems());
    })
    this.activitiesService.activitiesTree$.subscribe((treeChanged) => {
      this._rebuild(this._calculateMaxItems());
    });

  }

  public onClickOpenTimelogEntry() {
    this.daybookService.openTimelogGridItem(this.gridItem);
  }


  private _calculateMaxItems(): number{
    let maxItems: number;

    const table: {
      screenSize: ScreenSizes,
      itemSize: 'VERY_SMALL' | 'SMALL' | 'NORMAL' | 'LARGE',
      maxItems: number
    }[] = [
      { screenSize: ScreenSizes.MOBILE, itemSize: 'VERY_SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'NORMAL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'LARGE', maxItems: 4 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'VERY_SMALL', maxItems: 4 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'SMALL', maxItems: 4 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'NORMAL', maxItems: 5 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'LARGE', maxItems: 6 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'VERY_SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'NORMAL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'LARGE', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'VERY_SMALL', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'SMALL', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'NORMAL', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'LARGE', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'VERY_SMALL', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'SMALL', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'NORMAL', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'LARGE', maxItems: 8 },
    ];

    let itemSize: 'VERY_SMALL' | 'SMALL' | 'NORMAL' | 'LARGE';
    if(this.isVerySmallSize){ itemSize = 'VERY_SMALL'; }
    else if(this.isSmallSize){ itemSize = 'SMALL'; }
    else if(this.isNormalSize){ itemSize = 'NORMAL'; }
    else if(this.isLargeSize){ itemSize = 'LARGE'; }

    const foundItem = table.find(item => item.itemSize === itemSize && item.screenSize === this.screenSize);
    if(foundItem){
      return foundItem.maxItems;
    }else{
      console.log('Error determining Timelog Entry max items size');
      return 2;
    }
  }

  private _rebuild(maxItems: number) {
    // let displayEntry: TimelogEntryDisplayItem = new TimelogEntryDisplayItem(this.gridItem, this.activitiesService.activitiesTree);
    // this._displayEntry = displayEntry;


    let activityItems: TimelogEntryActivityDisplay[] = [];
    let remainingItems: TimelogEntryActivityDisplay[] = [];

    if (this.gridItem.timelogEntries.length > 0) {
      let mergedTimelogEntry = this.gridItem.timelogEntries[0];
      if (this.gridItem.timelogEntries.length > 1) {
        const startTime = moment(this.gridItem.timelogEntries[0].startTime);
        const endTime = moment(this.gridItem.timelogEntries[this.gridItem.timelogEntries.length - 1].endTime);
        const totalMS = endTime.diff(startTime, 'milliseconds');
        let activities: { activityTreeId: string, milliseconds: number }[] = [];
        this.gridItem.timelogEntries.forEach((timelogEntry) => {
          activities = activities.concat(timelogEntry.timelogEntryActivities.map((tlea) => {
            const tleMS = timelogEntry.endTime.diff(timelogEntry.startTime, 'milliseconds');
            const milliseconds: number = (100 / tlea.percentage) * tleMS;
            return {
              activityTreeId: tlea.activityTreeId,
              milliseconds: milliseconds,
            };
          }));
        });
        mergedTimelogEntry = new TimelogEntryItem(startTime, endTime);
        mergedTimelogEntry.timelogEntryActivities = activities.map((activity) => {
          const percentage = (activity.milliseconds / totalMS) * 100;
          return {
            activityTreeId: activity.activityTreeId,
            percentage: percentage,
          }
        });
      }

      const entryDurationMS: number = mergedTimelogEntry.durationMilliseconds;


      let itemsRemainingCount = maxItems;
      
      let backgroundColorSet: boolean = false;

      mergedTimelogEntry.timelogEntryActivities.sort((a1, a2) => {
        if (a1.percentage > a2.percentage) return -1;
        else if (a1.percentage < a2.percentage) return 1;
        else return 0;
      }).forEach((activityEntry) => {

        let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
        if(!backgroundColorSet){
          const alpha = 0.04;
          this._backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
          backgroundColorSet  = true;
        }
        

        
        let durationMS: number = (activityEntry.percentage * entryDurationMS) / 100;
        const activityDisplayItem: TimelogEntryActivityDisplay = new TimelogEntryActivityDisplay(durationMS, foundActivity);

        if(itemsRemainingCount > 0){
          activityItems.push(activityDisplayItem);
          itemsRemainingCount -= 1;
        }else{
          remainingItems.push(activityDisplayItem);
        }
        
        
      });
    }


    this._activityItems = activityItems;
    this._remainingItems = remainingItems;
  }



}
