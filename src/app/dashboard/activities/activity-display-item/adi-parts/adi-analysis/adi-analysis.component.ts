import { Component, OnInit } from '@angular/core';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';
import { ActivityComponentService } from '../../../activity-component.service';
import * as moment from 'moment';
import { TimeViewsManager } from '../../../../../shared/time-views/time-views-manager.class';

@Component({
  selector: 'app-adi-analysis',
  templateUrl: './adi-analysis.component.html',
  styleUrls: ['./adi-analysis.component.css']
})
export class AdiAnalysisComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }



  private _isLoading: boolean = false;
  private _timeViewsManager: TimeViewsManager;


  public get isLoading(): boolean { return this._isLoading; }
  public get activity(): ActivityCategoryDefinition { return this.activityService.currentActivity; }
  public get timeViewsManager(): TimeViewsManager { return this._timeViewsManager; }



  ngOnInit(): void {
    this.activityService.currentActivity$.subscribe((activity)=>{
      this._rebuild();
    });


  }

  private _rebuild(){
    this._isLoading = true;
    /**
     * Put a clause in here to get an array of all child activity Ids, recursively.
     * and then add that data to the cumulative data.
     * 
     * however, we need to be able to discern between this activity EXCLUSIVELY and this activity + all child activities in AGGREGATE.
     */
    const relevantItems = this.activityService.analyzer.daybookItems
      .filter(daybookItem => daybookItem.timelogEntryDataItems
        .find(tledi => tledi.timelogEntryActivities
          .find(tlea => tlea.activityTreeId === this.activity.treeId)));
    
    
    this._timeViewsManager = new TimeViewsManager();
    this._timeViewsManager.buildActivityViews(relevantItems, this.activity);
    this._isLoading = false;
  }

}
