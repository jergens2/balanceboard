import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivityCategoryDefinitionService } from './api/activity-category-definition.service';
import { ActivityTree } from './api/activity-tree.class';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ActivityComponentService } from './activity-component.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {





  constructor(private activityDefinitionService: ActivityCategoryDefinitionService,
    private activityCompService: ActivityComponentService, private modalService: ModalService) { }

  private _activityTree: ActivityTree;
  private _openActivity: ActivityCategoryDefinition;
  public get openActivity(): ActivityCategoryDefinition { return this._openActivity; }


  private _subs: Subscription[] = [];

  ngOnInit() {
    this.activityCompService.initiate(this.activityDefinitionService, this.modalService);
    this._activityTree = this.activityDefinitionService.activitiesTree;
    this._subs = [
      this.activityCompService.currentActivity$.subscribe((activityChanged) => {
        this._openActivity = activityChanged;
      }),
      this.activityDefinitionService.activitiesTree$.subscribe((changedTree) => {
        this._activityTree = changedTree
      }),
    ];
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe());
    this._subs = [];
  }

  public onActivityOpened(activity: ActivityCategoryDefinition) {
    this.activityCompService.openActivity(activity);
  }


  // private _activityRoutines: ActivityCategoryDefinition[] = [];
  // public get activityRoutines(): ActivityCategoryDefinition[] {
  //   return this._activityRoutines;
  // }

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

  //   private _timeViewConfiguration: TimeViewConfiguration;
  //   private buildTimeViewConfiguration() {

  //     function hexToRGB(hex: string, alpha: number) {
  //       var r = parseInt(hex.slice(1, 3), 16),
  //         g = parseInt(hex.slice(3, 5), 16),
  //         b = parseInt(hex.slice(5, 7), 16);

  //       if (alpha) {
  //         return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  //       } else {
  //         return "rgb(" + r + ", " + g + ", " + b + ")";
  //       }
  //     }
  //   }


  //   public get timeViewConfiguration(): TimeViewConfiguration {
  //     return this._timeViewConfiguration;
  //   }

  faCalendarAlt = faCalendarAlt;
  faPlus = faPlus;
}
