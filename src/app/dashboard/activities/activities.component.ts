import { Component, OnInit } from '@angular/core';
import { ActivityCategoryDefinitionService } from '../../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { ActivityTree } from '../../shared/document-definitions/activity-category-definition/activity-tree.class';
import { TimeViewDataSource } from '../../shared/time-views/time-view-data-source.enum';
import { ActivityDayDataService } from '../../shared/document-data/activity-day-data/activity-day-data.service';
import { TimeViewConfiguration } from '../../shared/time-views/time-view-configuration.interface';
import { ActivityDayData, ActivityDayDataItem } from '../../shared/document-data/activity-day-data/activity-day-data.class';
import { TimeViewDayData } from '../../shared/time-views/time-view-day-data-interface';
import * as moment from 'moment';
import { ActivityCategoryDefinition } from '../../shared/document-definitions/activity-category-definition/activity-category-definition.class';
import { ModalService } from '../../modal/modal.service';
import { Modal } from '../../modal/modal.class';
import { ModalComponentType } from '../../modal/modal-component-type.enum';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

/*

For each activity, properties to have:
-increase or decrease hours per week?
-generic priority
-activity related to time (duration) or incidences (count), example brush teeth, smoke cigarette, thc, alcohol, etc.  
-mental focus required (high, normal, low)
-enjoyment (high, normal, low)
-purpose statement (why do you do this?)
-ideal range rules, recurrences:
  -- this will merge into recurring activities  
  e.g. once per day, twice per day, 45 min per day is good, 2 hours per day is too much / unnecessary
  overwatch:  0-5 hours per week is good
              5-10 hours per week is acceptable
              over 10 hours per week is bad.
-mandatoryness

*/




  constructor(
    private activityCategoryDefinitionService: ActivityCategoryDefinitionService, 
    private activityDataService: ActivityDayDataService,
    private modalService: ModalService) { }

  private activityTree: ActivityTree;
  private allActivityData: ActivityDayData[] = [];

  ngOnInit() {
    this.activityTree = this.activityCategoryDefinitionService.activitiesTree;
    this.activityCategoryDefinitionService.activitiesTree$.subscribe((changedTree) => {
      this.activityTree = changedTree;
      this.buildTimeViewConfiguration();
    });
    this.allActivityData = this.activityDataService.activityDayDatas;
    this.activityDataService.activityDayDatas$.subscribe((allData) => {
      this.allActivityData = allData;
      this.buildTimeViewConfiguration();
    });

    this.buildTimeViewConfiguration();

    console.log("Root: ", this.activityTree.rootActivities)
  }


  public get rootActivities(): ActivityCategoryDefinition[]{
    if(this.activityTree){
      return this.activityTree.rootActivities;
    }else{
      return [];
    }
  }

  onClickNewActivity(){
    let modal: Modal = new Modal("New Activity", "", null, [], null, ModalComponentType.ActivityCategoryDefinition)
    this.modalService.activeModal = modal;
    this.modalService.modalResponse$.subscribe((response)=>{
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

    function findTopActivity(data: ActivityDayData): ActivityDayDataItem{
      let result: ActivityDayDataItem = data.activityItems.find((activityItem)=>{
        return activityItem.activityTreeId != "5b9c362dd71b00180a7cf701_default_sleep";
      });
      if(!result){
        result = data.activityItems[0];
      }
      return result;
    }


    if (this.allActivityData.length > 0 && this.activityTree) {
      let minValue: number = 0;
      let maxValue: number = 0;
      let data: TimeViewDayData[] = [];

      this.allActivityData.forEach((activityData: ActivityDayData) => {
        let topActivity: ActivityDayDataItem = findTopActivity(activityData);
        data.push({
          dateYYYYMMDD: activityData.dateYYYYMMDD,
          value: topActivity.durationMinutes,
          name: this.activityTree.findActivityByTreeId(topActivity.activityTreeId).name,
          date: moment(activityData.dateYYYYMMDD).startOf("day"),
          style: {
            "background-color": hexToRGB(this.activityTree.findActivityByTreeId(topActivity.activityTreeId).color, 0.5),
          },
          isHighlighted: false,
          mouseOver: false,
        });
      });

      let configuration: TimeViewConfiguration = {
        units: "top activity",
        singleValueType: false,
        minValue: minValue,
        maxValue: maxValue,
        data: data,
      }
      this._timeViewConfiguration = configuration;
    }
  }
  public get timeViewConfiguration(): TimeViewConfiguration {
    return this._timeViewConfiguration;
  }


}
