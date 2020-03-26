import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionService } from '../../../../../../activities/api/activity-category-definition.service';
import { TimelogEntryActivity } from '../../../../../api/data-items/timelog-entry-activity.interface';
import { TLEFController } from '../../TLEF-controller.class';


@Component({
  selector: 'app-tlef-existing-previous',
  templateUrl: './tlef-existing-previous.component.html',
  styleUrls: ['./tlef-existing-previous.component.css']
})
export class TlefExistingPreviousComponent implements OnInit {


  public get activities(): ActivityCategoryDefinition[] {
    return this.entryItem.timelogEntryActivities.map(item => this._convertToActivity(item.activityTreeId));
  }

  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  private _controller: TLEFController;
  @Input() public set controller(controller: TLEFController) { this._controller = controller; }
  public get controller(): TLEFController { return this._controller; }

  public get entryItem(): TimelogEntryItem { return this._controller.initialTimelogEntry; }

  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  ngOnInit() {
  }

  private _convertToActivity(treeId: string) {
    return this.activitiesService.findActivityByTreeId(treeId)
  }


  public onClickEdit(){
    this._isEditing = true;
  }

}
