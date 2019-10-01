import { Component, OnInit } from '@angular/core';
import { ActivityCategoryDefinitionService } from './api/activity-category-definition.service';
import { ActivityTree } from './api/activity-tree.class';


import { TimeViewConfiguration } from '../../shared/time-views/time-view-configuration.interface';

import { TimeViewDayData } from '../../shared/time-views/time-view-day-data-interface';
import * as moment from 'moment';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { Modal } from '../../modal/modal.class';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { RoutineDefinitionService } from './routines/api/routine-definition.service';
import { RoutineDefinition } from './routines/api/routine-definition.class';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {





  constructor(
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService,
    private routineDefinitionService: RoutineDefinitionService,
    private modalService: ModalService) { }

  private activityTree: ActivityTree;


  ngOnInit() {
    this.activityTree = this.activityCategoryDefinitionService.activitiesTree;
    this._activityRoutines = this.activityTree.activityRoutines;
    let things = this.activityTree.scheduleConfigurationActivities;
    console.log("Things: ")
    things.forEach((thing)=>{
      console.log("Schedule item: " , thing.name , " : ", thing)
    })

    // this._openActivity = this.activityTree.getSleepActivity();
    this._openActivity = null;

    this.activityCategoryDefinitionService.activitiesTree$.subscribe((changedTree) => {
      this.activityTree = changedTree;
      this._activityRoutines = this.activityTree.activityRoutines;
      this.buildTimeViewConfiguration();
      this.findScheduledItems();
    });

    this.buildTimeViewConfiguration();

    console.log("Root: ", this.activityTree.rootActivities)
  }


  private findScheduledItems(){
    this._scheduledItems = this.activityTree.allActivities.filter((activity)=>{
      return activity.scheduleRepititions.length > 0;
    });
    console.log("found schedule items:" , this._scheduledItems)
  }
  private _scheduledItems: ActivityCategoryDefinition[] = [];
  public get scheduledItems(): ActivityCategoryDefinition[]{
    return this._scheduledItems;
  }




  private _openActivity: ActivityCategoryDefinition;
  public get openActivity(): ActivityCategoryDefinition{
    return this._openActivity;
  }

  public onOpenActivity(activity: ActivityCategoryDefinition){
    console.log("BOOLA WOOLA")
    this._openActivity = activity;
  }


  private _activityRoutines: ActivityCategoryDefinition[] = [];
  public get activityRoutines(): ActivityCategoryDefinition[] { 
    return this._activityRoutines;
  }

  public get rootActivities(): ActivityCategoryDefinition[] {
    if (this.activityTree) {
      return this.activityTree.rootActivities;
    } else {
      return [];
    }
  }

  public onClickNewActivity() {
    let modal: Modal = new Modal("New Activity", "", null, [], null, ModalComponentType.ActivityCategoryDefinition)
    this.modalService.activeModal = modal;
    this.modalService.modalResponse$.subscribe((response) => {
      console.log("modal response:", response);
    });
  }
  public onClickNewRoutine(){
    console.log("New routine button clicked");
  }

  private _timeViewConfiguration: TimeViewConfiguration;
  private buildTimeViewConfiguration() {

    function hexToRGB(hex: string, alpha: number) {
      var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

      if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
      } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
      }
    }
  }


  public get timeViewConfiguration(): TimeViewConfiguration {
    return this._timeViewConfiguration;
  }

  faCalendarAlt = faCalendarAlt;
  faPlus = faPlus;
}
