import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { ActivityHttpService } from './api/activity-http.service';
import { ActivityDefinitionTree } from './api/activity-definition-tree.class';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
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
  private _activityTree: ActivityDefinitionTree;
  private _openActivity: ActivityCategoryDefinition;
  private _rootNgClass: string[] = [];


  private _subs: Subscription[] = [];

  public get faCalendarAlt() { return faCalendarAlt };
  public get faPlus() { return faPlus };
  public readonly faSearch = faSearch; 

  public get maxHeightPx(): string { return (this.sizeService.height - 40) + "px"; }

  public get openActivity(): ActivityCategoryDefinition { return this._openActivity; }
  public get isLoading(): boolean { return this._isLoading; }
  public get rootNgClass(): string[] { return this._rootNgClass; }



  public get screenSize(): AppScreenSize { return this.sizeService.appScreenSize; }


  public get viewModeIsActivity(): boolean { return this.activityCompService.viewModeIsActivity; }
  public get viewModeIsList(): boolean { return this.activityCompService.viewModeIsList; }
  public get viewModeIsSummary(): boolean { return this.activityCompService.viewModeIsSummary; }
  public get viewModeIsQuery(): boolean { return this.activityCompService.viewModeIsQuery; }




  public onClickBrowseActivities(){
    this.activityCompService.viewAllActivities();
  }

  public get rootActivities(): ActivityCategoryDefinition[] {
    if (this._activityTree) {
      return this._activityTree.rootActivities;
    } else {
      return [];
    }
  }

  ngOnInit() {
    this._activityTree = this.activityDefinitionService.activityTree;
    this._subs = [
      this.activityDefinitionService.activityTree$.subscribe((changedTree) => {
        this._activityTree = changedTree;
      }),
      this.activityCompService.initiate$(this.activityDefinitionService, this.modalService, this.daybookHttpService)
        .subscribe(isComplete => {
          this._isLoading = false;
        }, () => { }, () => { this._isLoading = false; }),
    ];
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe());
    this._subs = [];
  }

}
