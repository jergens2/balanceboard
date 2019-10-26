import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { TLEFActivityListItem } from './tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ActivityCategoryDefinition } from '../../../../../activities/api/activity-category-definition.class';
import { Subscription } from 'rxjs';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DurationString } from '../../../../../../shared/utilities/time-utilities/duration-string.class';

import { DaybookTimelogEntryDataItem } from '../../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../api/data-items/timelog-entry-activity.interface';
import { ActivityCategoryDefinitionService } from '../../../../../activities/api/activity-category-definition.service';


@Component({
  selector: 'app-tlef-activities',
  templateUrl: './tlef-activities.component.html',
  styleUrls: ['./tlef-activities.component.css']
})
export class TlefActivitiesComponent implements OnInit {
  faTimes = faTimes;
  constructor(private activitiesService: ActivityCategoryDefinitionService) { }

  private _timelogEntryDataItem: DaybookTimelogEntryDataItem;
  @Input() public set timelogEntryDataItem(dataItem: DaybookTimelogEntryDataItem) {
    console.log("Setting data item: ", dataItem)
    this._timelogEntryDataItem = dataItem;
    this.reload();
  }
  @Output() tlefActivitiesChanged: EventEmitter<TLEFActivityListItem[]> = new EventEmitter();

  activityItems: TLEFActivityListItem[] = [];

  get timelogEntryMinutes(): number {
    return moment(this._timelogEntryDataItem.endTimeISO).diff(moment(this._timelogEntryDataItem.startTimeISO), "minutes");
  }

  public get currentTimelogEntryDuration(): string {
    return DurationString.calculateDurationString(moment(this._timelogEntryDataItem.startTimeISO), moment(this._timelogEntryDataItem.endTimeISO));
  }

  ngOnInit() {
    this.tlefActivitiesChanged.emit(this.activityItems);
    
  }

  private reload(){
    console.log("tlef-activities.reload()")
    let maxPercent: number = 100;
    if (this._timelogEntryDataItem.timelogEntryActivities.length > 1) {
      maxPercent = 100 - ((this._timelogEntryDataItem.timelogEntryActivities.length - 1) * 2);
    }
    let activityItems: TLEFActivityListItem[] = [];
    this._timelogEntryDataItem.timelogEntryActivities.forEach((tleActivity: TimelogEntryActivity) => {
      let totalDuration: number = moment(this._timelogEntryDataItem.endTimeISO).diff(this._timelogEntryDataItem.startTimeISO, "minutes");
      let durationMinutes = ((tleActivity.percentage / 100) * totalDuration);
      let durationPercent = tleActivity.percentage;
      let activity = this.activitiesService.findActivityByTreeId(tleActivity.activityTreeId);
      activityItems.push(new TLEFActivityListItem(activity, durationMinutes, durationPercent, totalDuration, maxPercent))
    });
    this.activityItems = activityItems;
    this.updateChangeSubscriptions();
    this.activityItems.forEach((activityItem) => {
      activityItem.updatePercentage(activityItem.durationPercent, maxPercent, true);
    });
    this.updateActivityChangedSubscriptions();
  }

  private _activityChangedSubscriptions: Subscription[] = [];
  private updateActivityChangedSubscriptions(){
    this._activityChangedSubscriptions.forEach((sub)=>{ sub.unsubscribe();});
    this._activityChangedSubscriptions = [];
    this.activityItems.forEach((item)=>{
      this._activityChangedSubscriptions.push(item.activityModified$.subscribe((activity)=>{
        this.activitiesService.updateActivity(activity);
      }));
    });
  }

  onMouseEnterActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = true;
  }

  onMouseLeaveActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = false;
    activityItem.deactivate();
  }
  onClickRemoveActivity(activityItem: TLEFActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this.updateChangeSubscriptions();
    this.updatePercentages(activityItem);
  }

  onActivityValueChanged(activity: ActivityCategoryDefinition) {
    // This is the event of a new activity being added.
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length + 1);
    let durationPercent = durationMinutes / (this.timelogEntryMinutes) * 100;

    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;

    if (this.activityItems.length > 1) {
      maximumPercent = (100 - ((this.activityItems.length - 1) * minimumActivityPercent));
    }



    let activityItem: TLEFActivityListItem = new TLEFActivityListItem(activity, durationMinutes, durationPercent, this.timelogEntryMinutes, maximumPercent);

    this.activityItems = this.addNewActivityItem(activityItem);

    // this.activityItems.push(activityItem);

    this.updateChangeSubscriptions();
    this.updatePercentages(activityItem);

    // this.updateForm();
  }

  private addNewActivityItem(activityItem: TLEFActivityListItem): TLEFActivityListItem[] {
    let currentItems = this.activityItems;
    let alreadyIn: boolean = false;
    for (let item of currentItems) {
      if (item.activity.treeId == activityItem.activity.treeId) {
        alreadyIn = true;
      }
    }
    if (!alreadyIn) {
      currentItems.push(activityItem);
    }
    return currentItems;
  }


  private changeSubscriptions: Subscription[] = [];
  private updateChangeSubscriptions() {
    this.changeSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this.changeSubscriptions = [];
    for (let activityItem of this.activityItems) {
      activityItem.deactivate();
      this.changeSubscriptions.push(activityItem.percentChanged$.subscribe((percentChanged) => {
        this.updatePercentages(activityItem, percentChanged);
      }))
    }
  }




  private updatePercentages(changedActivityItem?: TLEFActivityListItem, newPercent?: number) {
    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;
    if (changedActivityItem) {
      if (this.activityItems.length > 1) {
        maximumPercent = (100 - ((this.activityItems.length - 1) * minimumActivityPercent));
      }
      if (newPercent) {
        if (this.activityItems.length == 1) {
          this.activityItems[0].updatePercentage(100, 100, false);
        } else if (this.activityItems.length > 1) {
          let percentageSum: number = 0;
          this.activityItems.forEach((activityItem) => { percentageSum += activityItem.durationPercent });
          if (percentageSum > 100) {
            let totalSubtract: number = percentageSum - 100;
            while (totalSubtract > 0) {
              let itemsLength = (this.activityItems.filter((item) => {
                if (item.durationPercent > minimumActivityPercent && item.activity.treeId != changedActivityItem.activity.treeId) {
                  return item;
                }
              })).length;
              if (itemsLength > 0) {
                if (totalSubtract < 1) {
                  changedActivityItem.updatePercentage(changedActivityItem.durationPercent - totalSubtract, maximumPercent, false);
                  totalSubtract = 0;
                } else {
                  let subtractEvenly: number = totalSubtract / itemsLength;
                  this.activityItems.forEach((activityItem) => {
                    if (activityItem.activity.treeId != changedActivityItem.activity.treeId && activityItem.durationPercent > minimumActivityPercent) {
                      if (activityItem.durationPercent > minimumActivityPercent) {
                        if ((activityItem.durationPercent - subtractEvenly) > minimumActivityPercent) {
                          totalSubtract -= subtractEvenly;
                          activityItem.updatePercentage(activityItem.durationPercent - subtractEvenly, maximumPercent, true);
                        } else {
                          totalSubtract -= (activityItem.durationPercent - minimumActivityPercent);
                          activityItem.updatePercentage(minimumActivityPercent, maximumPercent, true)
                        }
                      }
                    }
                    if (subtractEvenly <= minimumActivityPercent) {
                      if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                        activityItem.updatePercentage(activityItem.durationPercent - totalSubtract, maximumPercent, false);
                      }
                    }
                  });
                }
              } else {
                this.activityItems.forEach((activityItem) => {
                  if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                    activityItem.updatePercentage(activityItem.durationPercent - totalSubtract, maximumPercent, false);
                  }
                });
                totalSubtract = 0;
              }
            }
          } else if (percentageSum < 100) {
            let totalAdd = 100 - percentageSum;
            while (totalAdd > 0) {
              let itemsLength = (this.activityItems.filter((item) => {
                if (item.durationPercent < maximumPercent && item.activity.treeId != changedActivityItem.activity.treeId) {
                  return item;
                }
              })).length;
              if (itemsLength > 0) {
                if (totalAdd < 1) {
                  changedActivityItem.updatePercentage(changedActivityItem.durationPercent + totalAdd, maximumPercent, false);
                  totalAdd = 0;
                } else {
                  let addEvenly: number = totalAdd / itemsLength;
                  this.activityItems.forEach((activityItem) => {
                    if (activityItem.activity.treeId != changedActivityItem.activity.treeId && activityItem.durationPercent < maximumPercent) {
                      if ((activityItem.durationPercent + addEvenly) <= maximumPercent) {
                        totalAdd -= addEvenly;
                        activityItem.updatePercentage(activityItem.durationPercent + addEvenly, maximumPercent, true);
                      } else {
                        let difference: number = (maximumPercent - activityItem.durationPercent)
                        totalAdd -= difference;
                        activityItem.updatePercentage(activityItem.durationPercent + difference, maximumPercent, true);
                      }
                    }
                  });
                }
              } else {
                this.activityItems.forEach((activityItem) => {
                  if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                    activityItem.updatePercentage(activityItem.durationPercent + totalAdd, maximumPercent, false);
                  }
                })
                totalAdd = 0;
              }
            }
          }
        }
      } else {
        for (let activityItem of this.activityItems) {
          let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
          let dividedEvenlyPercentage = durationMinutes / (this.timelogEntryMinutes) * 100;
          activityItem.deactivate();
          activityItem.updatePercentage(dividedEvenlyPercentage, maximumPercent, true);
        }
      }
    }


    this.tlefActivitiesChanged.emit(this.activityItems);
  }

}
