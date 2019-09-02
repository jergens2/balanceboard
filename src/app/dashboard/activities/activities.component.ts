import { Component, OnInit } from '@angular/core';
import { ActivityCategoryDefinitionService } from './api/activity-category-definition/activity-category-definition.service';
import { ActivityTree } from './api/activity-category-definition/activity-tree.class';


import { TimeViewConfiguration } from '../../shared/time-views/time-view-configuration.interface';

import { TimeViewDayData } from '../../shared/time-views/time-view-day-data-interface';
import * as moment from 'moment';
import { ActivityCategoryDefinition } from './api/activity-category-definition/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { Modal } from '../../modal/modal.class';
import { ModalComponentType } from '../../modal/modal-component-type.enum';
import { RoutineDefinitionService } from './routines/routine-definition/api/routine-definition.service';
import { RoutineDefinition } from './routines/routine-definition/api/routine-definition.class';

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
    this.activityCategoryDefinitionService.activitiesTree$.subscribe((changedTree) => {
      this.activityTree = changedTree;
      this.buildTimeViewConfiguration();
    });

    this._routines = this.routineDefinitionService.routineDefinitions;
    this.routineDefinitionService.routineDefinitions$.subscribe((routineDefs)=>{
      this._routines = routineDefs;
    })

    this.buildTimeViewConfiguration();

    console.log("Root: ", this.activityTree.rootActivities)
  }

  private _routines: RoutineDefinition[] = [];
  public get routines(): RoutineDefinition[] { 
    return this._routines;
  }

  public get rootActivities(): ActivityCategoryDefinition[] {
    if (this.activityTree) {
      return this.activityTree.rootActivities;
    } else {
      return [];
    }
  }

  onClickNewActivity() {
    let modal: Modal = new Modal("New Activity", "", null, [], null, ModalComponentType.ActivityCategoryDefinition)
    this.modalService.activeModal = modal;
    this.modalService.modalResponse$.subscribe((response) => {
      console.log("modal response:", response);
    });
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

    // function findTopActivity(data: ActivityDayData): ActivityDayDataItem {
    //   let result: ActivityDayDataItem = data.activityItems.find((activityItem) => {
    //     return activityItem.activityTreeId != "5b9c362dd71b00180a7cf701_default_sleep";
    //   });
    //   if (!result) {
    //     result = data.activityItems[0];
    //   }
    //   return result;
    // }


    // if (this.allActivityData.length > 0 && this.activityTree) {
    //   let minValue: number = 0;
    //   let maxValue: number = 0;
    //   let data: TimeViewDayData[] = [];

    //   this.allActivityData.forEach((activityData: ActivityDayData) => {
    //     let topActivity: ActivityDayDataItem = findTopActivity(activityData);
    //     data.push({
    //       dateYYYYMMDD: activityData.dateYYYYMMDD,
    //       value: topActivity.durationMinutes,
    //       name: this.activityTree.findActivityByTreeId(topActivity.activityTreeId).name,
    //       date: moment(activityData.dateYYYYMMDD).startOf("day"),
    //       style: {
    //         "background-color": hexToRGB(this.activityTree.findActivityByTreeId(topActivity.activityTreeId).color, 0.5),
    //       },
    //       isHighlighted: false,
    //       mouseOver: false,
    //     });
    //   });

    //   let configuration: TimeViewConfiguration = {
    //     units: "top activity",
    //     singleValueType: false,
    //     minValue: minValue,
    //     maxValue: maxValue,
    //     data: data,
    //   }
    //   this._timeViewConfiguration = configuration;
    // }
  }
  public get timeViewConfiguration(): TimeViewConfiguration {
    return this._timeViewConfiguration;
  }


}
