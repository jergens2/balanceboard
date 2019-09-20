import { Component, OnInit, Input } from '@angular/core';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';

@Component({
  selector: 'app-activity-display-item',
  templateUrl: './activity-display-item.component.html',
  styleUrls: ['./activity-display-item.component.css']
})
export class ActivityDisplayItemComponent implements OnInit {

  constructor() { }

  private _activity: ActivityCategoryDefinition;
  @Input() public set activity(activity: ActivityCategoryDefinition){
    this._activity = activity;
    this.updateDisplay();
  }; 
  public get activity(): ActivityCategoryDefinition{
    return this._activity;
  }

  ngOnInit() {
    if(this.activity != null){
      this.updateDisplay();
    }
  }

  private updateDisplay(){
    this._titleBorderBottom = { "border-bottom": "1px solid " + this.activity.color };
  }

  private _titleBorderBottom: any = {};
  public get titleBorderBottom(): any{
    return this._titleBorderBottom;
  }

}
