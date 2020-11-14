import { Component, OnInit } from '@angular/core';
import { ActivityComponentService } from '../activity-component.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faList, faCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { ActivityCategoryDefinition } from '../api/activity-category-definition.class';

@Component({
  selector: 'app-activities-view-tabs',
  templateUrl: './activities-view-tabs.component.html',
  styleUrls: ['./activities-view-tabs.component.css']
})
export class ActivitiesViewTabsComponent implements OnInit {

  constructor(private activityService: ActivityComponentService) { }

  private _tabs: {
    id: 'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY',
    label: string,
    icon: IconDefinition,
    activity: ActivityCategoryDefinition,
    isActive: boolean,
  }[];

  public get tabs(): {
    id: 'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY',
    label: string,
    icon: IconDefinition,
    activity: ActivityCategoryDefinition,
    isActive: boolean,
  }[] { return this._tabs; }

  ngOnInit(): void {
    this._tabs = [
      {
        id: 'SUMMARY',
        label: 'Summary',
        icon: faCalendar,
        activity: null,
        isActive: true,
      },
      {
        id: 'LIST',
        label: 'All activities',
        icon: faList,
        activity: null,
        isActive: false,
      },
      {
        id: 'QUERY',
        label: 'Query',
        icon: faSearch,
        activity: null,
        isActive: false,
      }
    ];
    this.activityService.currentActivity$.subscribe(activity => {
      if (activity) {
        const foundIndex = this._tabs.findIndex(item => item.id === 'ACTIVITY');
        if (foundIndex > -1) {
          this._tabs.splice(foundIndex, 1);
        }
        this._tabs.push({
          id: 'ACTIVITY',
          label: activity.name,
          icon: faCircle,
          activity: activity,
          isActive: true,
        });
        this._tabs.forEach(tab => {
          if (tab.id !== 'ACTIVITY') {
            tab.isActive = false;
          }
        });
      } else {
        const foundIndex = this._tabs.findIndex(item => item.id === 'ACTIVITY');
        if (foundIndex > -1) {
          this._tabs.splice(foundIndex, 1);
        }
      }
    });
    this.activityService.currentViewMode$.subscribe(viewMode => {
      this._tabs.forEach(tab => {
        if (tab.id === viewMode) {
          tab.isActive = true;
        } else {
          tab.isActive = false;
        }
      });
    });
  }

  public onClickTab(id: 'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY') {
    if (id === 'ACTIVITY') {
      const foundItem = this._tabs.find(item => item.id === 'ACTIVITY');
      this.activityService.openActivity(foundItem.activity);
    } else if (id === 'LIST') {
      this.activityService.viewAllActivities();
    } else if (id === 'SUMMARY') {
      this.activityService.viewSummary();
    } else if (id === 'QUERY') {
      this.activityService.viewQuery();
    }
  }

}
