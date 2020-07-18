import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../../daybook/api/daybook-day-item.class';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { ActivityComponentService } from '../../../activity-component.service';

@Component({
  selector: 'app-ado-merge-with',
  templateUrl: './ado-merge-with.component.html',
  styleUrls: ['./ado-merge-with.component.css']
})
export class AdoMergeWithComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _mergeFrom: ActivityCategoryDefinition;
  private _mergeTo: ActivityCategoryDefinition; 

  public get mergeFrom(): ActivityCategoryDefinition { return this._mergeFrom; }
  public get mergeTo(): ActivityCategoryDefinition { return this._mergeTo; }

  @Input() public daybookItems: DaybookDayItem[] = [];

  ngOnInit(): void {
    this._mergeFrom = this.activityService.currentActivity;
  
  }


  public onActivitySelected(activity: ActivityCategoryDefinition){
    console.log("Activity! " + activity.name, activity)
    this._mergeTo = activity;
  }

  public onExecuteMerge(){
    if(this._mergeTo && this._mergeFrom){
      this.activityService.executeMerge(this._mergeTo);
    }else{
      console.log("Error:  missing a value: " , this._mergeFrom, this._mergeTo);
    }

  }

}
