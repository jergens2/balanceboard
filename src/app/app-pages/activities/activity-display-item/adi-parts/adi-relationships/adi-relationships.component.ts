import { Component, OnInit } from '@angular/core';
import { ActivityComponentService } from '../../../activity-component.service';
import { ActivityCategoryDefinition } from '../../../api/activity-category-definition.class';

@Component({
  selector: 'app-adi-relationships',
  templateUrl: './adi-relationships.component.html',
  styleUrls: ['./adi-relationships.component.css']
})
export class AdiRelationshipsComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _parent: ActivityCategoryDefinition;
  private _currentActivity: ActivityCategoryDefinition;
  private _children: ActivityCategoryDefinition[];

  public get parent(): ActivityCategoryDefinition { return this._parent; }
  public get children(): ActivityCategoryDefinition[] { return this._children; }
  public get currentActivity(): ActivityCategoryDefinition { return this._currentActivity; }

  public get childrenCount(): number { return this._children.length; }
  public get hasChildren(): boolean { return this.childrenCount > 0; }
  public get hasParent(): boolean { return this._parent !== null; }

  ngOnInit(): void {
    this._reload();
    this.activityService.currentActivity$.subscribe(activity => {
      if (activity) {
        this._reload();
      }
    });
  }

  private _reload() {
    this._parent = null;
    const currentActivity = this.activityService.currentActivity;
    this._children = currentActivity.children;
    this._currentActivity = currentActivity;
    if (!currentActivity.isRootLevel) {
      const parent = this.activityService.activityTree.findActivityByTreeId(currentActivity.parentTreeId);
      this._parent = parent;
    }
  }

  public onClickParent() {
    this.activityService.openActivity(this._parent);
  }
  public onClickChild(child: ActivityCategoryDefinition) {
    this.activityService.openActivity(child);
  }

}
