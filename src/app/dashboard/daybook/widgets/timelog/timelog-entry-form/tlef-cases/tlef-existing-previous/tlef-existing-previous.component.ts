import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { TLEFController } from '../../TLEF-controller.class';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-tlef-existing-previous',
  templateUrl: './tlef-existing-previous.component.html',
  styleUrls: ['./tlef-existing-previous.component.css']
})
export class TlefExistingPreviousComponent implements OnInit {

  private _activities: ActivityCategoryDefinition[] = [];
  public get activities(): ActivityCategoryDefinition[] {
    return this._activities;
  }

  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  private _entryItem: TimelogEntryItem;
  public get entryItem(): TimelogEntryItem { return this._entryItem; }

  constructor(private activitiesService: ActivityCategoryDefinitionService, private daybookService: DaybookDisplayService) { }
  private _subs: Subscription[] = [];

  ngOnInit() {
    this._reload();
    this._subs = [
      this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((item)=>{
        if(item){
          this._reload();
        }
      }),
      this.daybookService.tlefController.changesMadeTLE$.subscribe((change)=>{
        if(change === null){
          this._isEditing = false;
        }
      }),
    ];
    
  }

  private _reload(){
    if(this.daybookService.tlefController.currentlyOpenTLEFItem.isTLEItem){
      this._entryItem = this.daybookService.tlefController.currentlyOpenTLEFItem.getInitialTLEValue();
      this._activities = this.entryItem.timelogEntryActivities.map(item => this._convertToActivity(item.activityTreeId));
    }
    
  }   

  private _convertToActivity(treeId: string) {
    return this.activitiesService.findActivityByTreeId(treeId)
  }


  public onClickEdit(){
    this._isEditing = true;
  }

}
