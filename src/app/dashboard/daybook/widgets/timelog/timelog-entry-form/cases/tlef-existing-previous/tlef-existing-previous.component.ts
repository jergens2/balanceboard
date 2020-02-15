import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { TimelogEntryActivity } from '../../../../../../daybook/api/data-items/timelog-entry-activity.interface';

@Component({
  selector: 'app-tlef-existing-previous',
  templateUrl: './tlef-existing-previous.component.html',
  styleUrls: ['./tlef-existing-previous.component.css']
})
export class TlefExistingPreviousComponent implements OnInit {

  @Input() entryItem: TimelogEntryItem;
  public get activities(): ActivityCategoryDefinition[] { 
    return this.entryItem.timelogEntryActivities.map(item => this._convertToActivity(item.activityTreeId));
  }

  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  ngOnInit() {
  }

  private _convertToActivity(treeId: string){
    return this.activitiesService.findActivityByTreeId(treeId)
  }

}
