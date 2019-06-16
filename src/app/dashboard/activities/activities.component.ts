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

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  constructor(private activityCategoryDefinitionService: ActivityCategoryDefinitionService, private activityDataService: ActivityDayDataService) { }

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


    if (this.allActivityData.length > 0) {
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
