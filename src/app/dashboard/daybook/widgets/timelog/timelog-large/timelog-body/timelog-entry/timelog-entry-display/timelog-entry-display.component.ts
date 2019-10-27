import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-entry-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../../activities/api/activity-category-definition.class';
import { ScreenSizeService } from '../../../../../../../../shared/app-screen-size/screen-size.service';
import { AppScreenSize } from '../../../../../../../../shared/app-screen-size/app-screen-size.enum';
import { ColorTools } from '../../../../../../../../shared/color-picker/color-tools.class';

@Component({
  selector: 'app-timelog-entry-display',
  templateUrl: './timelog-entry-display.component.html',
  styleUrls: ['./timelog-entry-display.component.css']
})
export class TimelogEntryDisplayComponent implements OnInit {

  constructor(private activitiesService: ActivityCategoryDefinitionService, private screenSizeService: ScreenSizeService) { }

  private _entry: TimelogEntryItem;
  @Input() public set entry(item: TimelogEntryItem) {
    this._entry = item;
  }
  public get entry(): TimelogEntryItem { return this._entry; }

  private _minutesPerTwentyPixels: number;
  @Input() public set minutesPerTwentyPixels(minutesPerTwentyPixels: number) {
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    const minutes: number = this.entry.durationSeconds / 60;
    const safeBuffer: number = 5; // subtract a few px just so as to not go over
    let height: number = ((minutes * 20) / minutesPerTwentyPixels) - safeBuffer;
    console.log("Height estimate px: " + height);
  }

  public get minutesPerTwentyPixels(): number { return this._minutesPerTwentyPixels; };


  private _activityDisplayEntries: { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] = [];
  public get activityDisplayEntries(): { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] { return this._activityDisplayEntries; }

  public screenSize: AppScreenSize;

  ngOnInit() {

    console.log("Entry sleep type: ", this._entry.sleepState);
    this.screenSize = this.screenSizeService.appScreenSize;
    this.screenSizeService.appScreenSize$.subscribe((size)=>{
      this.screenSize = size;
    })
    this.activitiesService.activitiesTree$.subscribe((treeChanged) => {
      this.rebuild();
    });
    // console.log("Activity display entries:", this._activityDisplayEntries);
  }


  private _units: { color: string }[] = [];
  public get units(): { color: string }[] { return this._units; };

  private _displayString: string = "";
  public get displayString(): string { return this._displayString; };

  public firstColor: string = "";

  private rebuild() {
    const entryDuration: number = this._entry.durationSeconds/60;
    let displayStrings: string[] = [];
    let units: { color: string }[] = [];
    this._entry.timelogEntryActivities.forEach((activityEntry) => {
      let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
      let durationMinutes: number =(activityEntry.percentage * entryDuration) / 100;
      const minutesPerUnit: number = 15;
      let unitCount: number = Math.ceil(durationMinutes / minutesPerUnit);

      
      if (foundActivity) {
        for(let i=0; i< unitCount; i++){
          units.push({color: foundActivity.color});
        }
        displayStrings.push(foundActivity.name);
        if(this.firstColor == ""){
          this.firstColor = foundActivity.color;
        }
      } else {
        console.log("Unknown activity: " + activityEntry.activityTreeId);
        for(let i=0; i< unitCount; i++){
          units.push({color: "#fefefe"});
        }
        displayStrings.push("unknown activity");
      }
    });
    let displayString: string = "";
    if(displayStrings.length > 0){
      displayString = displayStrings[0];
      if(displayStrings.length == 2){
        displayString += ", " + displayStrings[1];
      }else if(displayStrings.length > 2){
        const remaining: number = displayStrings.length -2;
        displayString += ", " + displayStrings[1] + " and " + remaining + " more";
      }
    }
    
    this._displayString = displayString;
    this._units = units;
  }

  // private rebuild(){
  // this._activityDisplayEntries = [];
  // const durationMinutes: number = this._entry.durationSeconds/60;
  // this._entry.timelogEntryActivities.forEach((activityEntry)=>{
  //   let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
  //   let displayEntry:  { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number };
  //   if(foundActivity){
  //     displayEntry = {
  //       activity: foundActivity,
  //       name: foundActivity.name,
  //       color: foundActivity.color,
  //       durationMinutes: (activityEntry.percentage * durationMinutes) / 100,
  //     }
  //   }else{
  //     displayEntry = {
  //       activity: null,
  //       name: "Unknown activity: " + activityEntry.activityTreeId,
  //       color: "white",
  //       durationMinutes: (activityEntry.percentage * durationMinutes) / 100,
  //     }
  //   }
  //   this._activityDisplayEntries.push(displayEntry);
  // });
  // this.buildUnits();
  // }


  // private buildUnits(){

  //   this._entry.timelogEntryActivities.forEach((activity)=>{
  //     activity.
  //   })


  // }

}
