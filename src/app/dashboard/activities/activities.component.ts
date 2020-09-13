import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { ActivityHttpService } from './api/activity-http.service';
import { ActivityTree } from './api/activity-tree.class';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ActivityComponentService } from './activity-component.service';
import { Subscription } from 'rxjs';
import { DaybookHttpService } from '../daybook/daybook-day-item/daybook-http.service';
import { AppScreenSizeService } from '../../shared/app-screen-size/app-screen-size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.class';
import { AppScreenSizeLabel } from '../../shared/app-screen-size/app-screen-size-label.enum';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  constructor(private activityDefinitionService: ActivityHttpService,
    private activityCompService: ActivityComponentService, private modalService: ModalService,
    private daybookHttpService: DaybookHttpService, private sizeService: AppScreenSizeService) { }


  private _isLoading: boolean = true;
  private _activityTree: ActivityTree;
  private _openActivity: ActivityCategoryDefinition;
  private _rootNgClass: string[] = [];

  private _subs: Subscription[] = [];

  public get faCalendarAlt() { return faCalendarAlt };
  public get faPlus() { return faPlus };
  public get maxHeightPx(): string { return (this.sizeService.maxComponentHeightPx-40) + "px"; }

  public get openActivity(): ActivityCategoryDefinition { return this._openActivity; }
  public get isLoading(): boolean { return this._isLoading; }
  public get rootNgClass(): string[] { return this._rootNgClass; }

  public get size(): 'SMALL' | 'MEDIUM' | 'LARGE' { return this.activityCompService.componentSize; }
  public get sizeIsSmall(): boolean { return this.size === 'SMALL'; }
  public get sizeIsMedium(): boolean { return this.size === 'MEDIUM'; }
  public get sizeIsLarge(): boolean { return this.size === 'LARGE'; }
  public get listIsOpen(): boolean { return this.activityCompService.listIsOpen; }

  public get screenSize(): AppScreenSize { return this.sizeService.appScreenSize; }

  public onActivityOpened(activity: ActivityCategoryDefinition) {
    this.activityCompService.openActivity(activity);
  }

  public get rootActivities(): ActivityCategoryDefinition[] {
    if (this._activityTree) {
      return this._activityTree.rootActivities;
    } else {
      return [];
    }
  }

  public onClickNewRoutine() {
    console.log("New routine button clicked");
  }

  ngOnInit() {
    this._activityTree = this.activityDefinitionService.activityTree;
    this._subs = [
      this.sizeService.appScreenSize$.subscribe(s => this._resize()),
      this.activityCompService.currentActivity$.subscribe((activityChanged) => {
        this._openActivity = activityChanged;
      }),
      this.activityDefinitionService.activityTree$.subscribe((changedTree) => {
        this._activityTree = changedTree
      }),
      this.activityCompService.initiate$(this.activityDefinitionService, this.modalService, this.daybookHttpService)
        .subscribe(isComplete => {
          this._isLoading = false;
        }),
    ];
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe());
    this._subs = [];
  }

  private _resize() {
    let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM';
    if (this.screenSize.label === AppScreenSizeLabel.VERY_LARGE) {
      size = 'LARGE';
      this.activityCompService.openList();
    } else if (this.screenSize.label === AppScreenSizeLabel.MOBILE) {
      size = 'SMALL';
    }
    this.activityCompService.setComponentSize(size);
    if(size === 'SMALL' || size === 'MEDIUM'){
      if (this.activityCompService.currentActivity) {
        this.activityCompService.closeList();
      } else {
        this.activityCompService.openList();
      }
    }
    
  }

}
