import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from './timelog-entry-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ScreenSizeService } from '../../../../../../../shared/screen-size/screen-size.service';
import { ScreenSizes } from '../../../../../../../shared/screen-size/screen-sizes-enum';
import { ColorConverter } from '../../../../../../../shared/utilities/color-converter.class';
import { ColorType } from '../../../../../../../shared/utilities/color-type.enum';
import { TimelogDisplayGridItem } from '../../../timelog-display-grid-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
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

  private _activityItems: TimelogEntryActivityDisplay[] = [];
  private _remainingItems: TimelogEntryActivityDisplay[] = [];
  private _noteText: string = "";
  private _noteTextSmall: string = "";
  private _hasText: boolean = false;

  public screenSize: ScreenSizes;

  @Input() public gridItem: TimelogDisplayGridItem;

  private _backgroundColor: string = "";

  public get isLargeSize(): boolean { return this.gridItem.isLargeGridItem; }
  public get isSmallSize(): boolean { return this.gridItem.isSmallGridItem; }
  public get isVerySmallSize(): boolean { return this.gridItem.isVerySmallItem; }
  public get isNormalSize(): boolean { return !this.isSmallSize && !this.isVerySmallSize && !this.isLargeSize; }

  public get hasText(): boolean { return this._hasText; }
  public get backgroundColor(): string { return this._backgroundColor; };

  public get activityItems(): TimelogEntryActivityDisplay[] { return this._activityItems; }
  public get remainingItems(): TimelogEntryActivityDisplay[] { return this._remainingItems; }

  public get noteText(): string { return this._noteText; }
  public get noteTextSmall(): string { return this._noteTextSmall;}

  
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
    const table: {
      screenSize: ScreenSizes,
      itemSize: 'VERY_SMALL' | 'SMALL' | 'NORMAL' | 'LARGE',
      maxItems: number
    }[] = [
      { screenSize: ScreenSizes.MOBILE, itemSize: 'VERY_SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'NORMAL', maxItems: 2 },
      { screenSize: ScreenSizes.MOBILE, itemSize: 'LARGE', maxItems: 2 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'VERY_SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'NORMAL', maxItems: 4 },
      { screenSize: ScreenSizes.TABLET, itemSize: 'LARGE', maxItems: 4 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'VERY_SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'SMALL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'NORMAL', maxItems: 2 },
      { screenSize: ScreenSizes.NORMAL, itemSize: 'LARGE', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'VERY_SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'NORMAL', maxItems: 4 },
      { screenSize: ScreenSizes.LARGE, itemSize: 'LARGE', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'VERY_SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'SMALL', maxItems: 3 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'NORMAL', maxItems: 6 },
      { screenSize: ScreenSizes.VERY_LARGE, itemSize: 'LARGE', maxItems: 6 },
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
    let activityItems: TimelogEntryActivityDisplay[] = [];
    let remainingItems: TimelogEntryActivityDisplay[] = [];
    this._setNoteText();
    if (this.gridItem.timelogEntries.length > 0) {
      let mergedTimelogEntry = this.gridItem.timelogEntries[0];
      if (this.gridItem.timelogEntries.length > 1) {
        const startTime = moment(this.gridItem.timelogEntries[0].startTime);
        const endTime = moment(this.gridItem.timelogEntries[this.gridItem.timelogEntries.length - 1].endTime);
        let activities: { activityTreeId: string, milliseconds: number }[] = [];
        this.gridItem.timelogEntries.forEach((timelogEntry) => {
          activities = activities.concat(timelogEntry.timelogEntryActivities.map((tlea) => {
            const tleMS = timelogEntry.durationMilliseconds;
            const milliseconds: number = (tlea.percentage / 100) * tleMS;
            return {
              activityTreeId: tlea.activityTreeId,
              milliseconds: milliseconds,
            };
          }));
        });
        mergedTimelogEntry = new TimelogEntryItem(startTime, endTime);
        const totalMS = mergedTimelogEntry.durationMilliseconds;
        mergedTimelogEntry.timelogEntryActivities = activities.map((activity) => {
          const percentage = (activity.milliseconds / totalMS) * 100;
          // console.log("Percentage: " + percentage)
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
    }else{
      console.log("no timelog entry")
    }
    this._activityItems = activityItems;
    this._remainingItems = remainingItems;
  }

  private _setNoteText(){
    let noteText: string = "";
    let textFound: boolean = false;
    this.gridItem.timelogEntries.sort((tle1, tle2)=>{
      if(tle1.durationMilliseconds > tle2.durationMilliseconds){
        return -1;
      }else if(tle1.durationMilliseconds < tle2.durationMilliseconds){
        return 1;
      }else{ 
        return 0;
      }
    }).forEach((tle)=>{
      if(!textFound){
        if(tle.embeddedNote){
          noteText = tle.embeddedNote;
          textFound = true;
        }
      }
    });
    if(textFound){
      if(this.isNormalSize || this.isLargeSize){
        if(noteText.length > 80){
          this._noteText = noteText.substring(0, 80) + "...";
        }else{
          this._noteText = noteText;
        }
        this._noteTextSmall = "";
      }else{
        if(noteText.length > 30){
          this._noteTextSmall = noteText.substring(0, 30) + "...";
        }else{
          this._noteTextSmall = noteText;
        }
        this._noteText = "";
      }
      this._hasText = true;
    }else{
      this._hasText = false;
    }
    
  }
}
