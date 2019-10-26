import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../timelog-entry-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../../../activities/api/activity-category-definition.service';
import { ActivityCategoryDefinition } from '../../../../../../../activities/api/activity-category-definition.class';

@Component({
  selector: 'app-timelog-entry-display',
  templateUrl: './timelog-entry-display.component.html',
  styleUrls: ['./timelog-entry-display.component.css']
})
export class TimelogEntryDisplayComponent implements OnInit {

  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  private _entry: TimelogEntryItem;
  @Input() public set entry(item: TimelogEntryItem){
    this._entry = item;
  }
  public get entry(): TimelogEntryItem{ return this._entry;}

  private _activityDisplayEntries: { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] = [];
  public get activityDisplayEntries(): { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number }[] { return this._activityDisplayEntries; }

  ngOnInit() {

    
    this.activitiesService.activitiesTree$.subscribe((treeChanged)=>{
      this.rebuild();
    });
    // console.log("Activity display entries:", this._activityDisplayEntries);
  }

  private rebuild(){
    this._activityDisplayEntries = [];
    const durationMinutes: number = this._entry.durationSeconds/60;
    this._entry.timelogEntryActivities.forEach((activityEntry)=>{
      let foundActivity: ActivityCategoryDefinition = this.activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
      let displayEntry:  { activity: ActivityCategoryDefinition, name: string, color: string, durationMinutes: number };
      if(foundActivity){
        displayEntry = {
          activity: foundActivity,
          name: foundActivity.name,
          color: foundActivity.color,
          durationMinutes: (activityEntry.percentage * durationMinutes) / 100,
        }
      }else{
        displayEntry = {
          activity: null,
          name: "Unknown activity: " + activityEntry.activityTreeId,
          color: "white",
          durationMinutes: (activityEntry.percentage * durationMinutes) / 100,
        }
      }
      this._activityDisplayEntries.push(displayEntry);
    });
  }

}
