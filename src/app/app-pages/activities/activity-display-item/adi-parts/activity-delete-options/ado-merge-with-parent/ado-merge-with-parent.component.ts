import { Component, OnInit } from '@angular/core';
import { ActivityComponentService } from '../../../../activity-component.service';
import { ActivityHttpService } from '../../../../api/activity-http.service';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { ActivityCategoryDefinition } from '../../../../api/activity-category-definition.class';

@Component({
  selector: 'app-ado-merge-with-parent',
  templateUrl: './ado-merge-with-parent.component.html',
  styleUrls: ['./ado-merge-with-parent.component.css']
})
export class AdoMergeWithParentComponent implements OnInit {

  public get faExclamationTriangle() { return faExclamationTriangle; }

  constructor(private activitiesService: ActivityComponentService, private definitionService: ActivityHttpService) { }

  private _parent: ActivityCategoryDefinition;
  private _parentName: string = "";
  public get parentName(): string { return this._parentName; }

  ngOnInit(): void {
    const activity = this.activitiesService.currentActivity;
    this._parent = this.definitionService.findActivityByTreeId(activity.parentTreeId);
    if(this._parent){
      this._parentName = this._parent.name;
    }else{
      console.log("Error getting parent");
    }
  }

  public onDeleteActivity(){
      this.activitiesService.executeMergeWithOther(this._parent);

  }

}
