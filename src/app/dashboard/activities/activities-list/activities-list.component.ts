import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToolboxService } from '../../../toolbox-menu/toolbox.service';
import { ActivityTree } from '../api/activity-tree.class';
import { ActivityHttpService } from '../api/activity-http.service';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';
import { AppScreenSizeService } from '../../../shared/app-screen-size/app-screen-size.service';
import { ActivityComponentService } from '../activity-component.service';
import { AppScreenSizeLabel } from '../../../shared/app-screen-size/app-screen-size-label.enum';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {

  public faPlus = faPlus;

  constructor(private toolboxService: ToolboxService, private activityDefService: ActivityHttpService,
    private activityService: ActivityComponentService, private sizeService: AppScreenSizeService) { }

  private _activityTree: ActivityTree;
  private _containerNgClass: string[] = [];
  public get rootActivities(): ActivityCategoryDefinition[] { return this._activityTree.rootActivities; }
  public get trashedActivities(): ActivityCategoryDefinition[] { return this._activityTree.allTrashed; }

  public get containerNgClass(): string[] { return this._containerNgClass; }
  @Output() public activityOpened: EventEmitter<ActivityCategoryDefinition> = new EventEmitter();

  ngOnInit(): void {
    this._activityTree = this.activityDefService.activityTree;
  }

  public onActivityOpened(activity: ActivityCategoryDefinition) {
    this.activityService.openActivity(activity);
    if (this.sizeService.appScreenSize.label !== AppScreenSizeLabel.VERY_LARGE) {
      this.activityService.closeList();
    }
  }

  private _mouseIsInList: boolean = true;
  private _timerSub: Subscription = new Subscription();
  public onMouseLeaveList() {
    this._mouseIsInList = false;
    this._timerSub.unsubscribe();
    this._timerSub = timer(2500).subscribe(s => {
      if (!this._mouseIsInList) {
        if (this.activityService.componentSize === 'MEDIUM') {
          if (this.activityService.currentActivity) {
            this.activityService.closeList();
          }
        }
      }
    });
  }
  public onMouseEnterList() { this._mouseIsInList = true; }

}
