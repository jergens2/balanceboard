import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../../../daybook/api/daybook-day-item.class';
import { ActivityComponentService } from '../../../../activity-component.service';

@Component({
  selector: 'app-ado-move-to-trash',
  templateUrl: './ado-move-to-trash.component.html',
  styleUrls: ['./ado-move-to-trash.component.css']
})
export class AdoMoveToTrashComponent implements OnInit {

  private _activityDeletedId: string = "";
  
  public get activityDeletedId(): string { return this._activityDeletedId; }
  constructor(private activityService: ActivityComponentService) { }
  @Input() public daybookItems: DaybookDayItem[] = [];
  ngOnInit(): void {
    this._activityDeletedId = this.activityService.currentActivity.treeId;
  }

  public onDeleteActivity(){ this.activityService.executeMoveToTrash(); }
}
