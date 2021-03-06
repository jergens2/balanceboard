import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { TLEFActivityListItem } from './tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { Subscription } from 'rxjs';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DurationString } from '../../../../../../../shared/time-utilities/duration-string.class';

import { DaybookTimelogEntryDataItem } from '../../../../../daybook-day-item/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../../../daybook-day-item/data-items/timelog-entry-activity.interface';
import { ActivityHttpService } from '../../../../../../activities/api/activity-http.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';


@Component({
  selector: 'app-tlef-modify-activities',
  templateUrl: './tlef-modify-activities.component.html',
  styleUrls: ['./tlef-modify-activities.component.css']
})
export class TlefModifyActivitiesComponent implements OnInit, OnDestroy {

  constructor(private activitiesService: ActivityHttpService, private daybookService: DaybookDisplayService) { }

  private _timelogEntry: TimelogEntryItem;
  private _timelogEntryActivities: TimelogEntryActivity[] = [];
  private _activityItems: TLEFActivityListItem[] = [];

  public faTimes = faTimes;

  @Input() public set initialActivities(activities: TimelogEntryActivity[]) {
    this._timelogEntryActivities = Object.assign([], activities);
  }

  @Output() public tlefActivitiesChanged: EventEmitter<TimelogEntryActivity[]> = new EventEmitter();

  public get activityItems(): TLEFActivityListItem[] { return this._activityItems; }
  public get timelogEntry(): TimelogEntryItem { return this._timelogEntry; }
  public get timelogEntryMinutes(): number {
    return this._timelogEntry.durationSeconds / 60;
  }
  public get currentTimelogEntryDuration(): string {
    return DurationString.calculateDurationString(moment(this._timelogEntry.startTime), moment(this._timelogEntry.endTime));
  }

  ngOnInit() {
    this._reload();
    // this.tlefActivitiesChanged.emit(this.activityItems.map(item => item.toEntryActivity()));
  }

  ngOnDestroy() {
    this._timelogEntryActivities = [];
    this._activityItems = [];
    this._changeSubscriptions.forEach(s => s.unsubscribe());
    this._changeSubscriptions = [];
    this._timelogEntry = null;
  }

  public onMouseEnterActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = true;
  }

  public onMouseLeaveActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = false;
    activityItem.deactivate();
  }
  public onClickRemoveActivity(activityItem: TLEFActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    const durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this._updateChangeSubscriptions();
    this._updatePercentages(activityItem);
  }

  /** This is the event of a new activity been added to the list */
  public onActivityValueChanged(activity: ActivityCategoryDefinition) {
    activity = this.activitiesService.findActivityByTreeId(activity.treeId);
    const durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length + 1);
    const durationPercent = durationMinutes / (this.timelogEntryMinutes) * 100;
    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;
    if (this.activityItems.length > 1) {
      maximumPercent = (100 - ((this.activityItems.length - 1) * minimumActivityPercent));
    }
    const activityItem: TLEFActivityListItem = new TLEFActivityListItem(activity, durationMinutes, durationPercent, this.timelogEntryMinutes, maximumPercent);
    this._activityItems = this._addNewActivityItem(activityItem);
    this._updateChangeSubscriptions();
    this._updatePercentages(activityItem);
    this._updateActivityChangedSubscriptions();
  }

  private _reload() {
    this._timelogEntry = this.daybookService.tlefController.currentlyOpenTLEFItem.item.getInitialTLEValue();
    let maxPercent: number = 100;
    // console.log("this.timelog entry: " , this.timelogEntry, this._timelogEntryActivities)
    if (this._timelogEntryActivities.length > 1) {
      maxPercent = 100 - ((this._timelogEntryActivities.length - 1) * 2);
    }
    const activityItems: TLEFActivityListItem[] = [];
    this._timelogEntryActivities.forEach((tleActivity: TimelogEntryActivity) => {
      const durationMinutes = ((tleActivity.percentage / 100) * this.timelogEntryMinutes);
      const durationPercent = tleActivity.percentage;
      const activity = this.activitiesService.findActivityByTreeId(tleActivity.activityTreeId);
      activityItems.push(new TLEFActivityListItem(activity, durationMinutes, durationPercent, this.timelogEntryMinutes, maxPercent))
    });
    this._activityItems = activityItems;
    this._updateChangeSubscriptions();
    this.activityItems.forEach((activityItem) => {
      activityItem.updatePercentage(activityItem.durationPercent, maxPercent, true);
    });
    this._updateActivityChangedSubscriptions();

    // 
  }

  private _addNewActivityItem(activityItem: TLEFActivityListItem): TLEFActivityListItem[] {
    const currentItems = this.activityItems;
    let alreadyIn: boolean = false;
    for (const item of currentItems) {
      if (item.activity.treeId == activityItem.activity.treeId) {
        alreadyIn = true;
      }
    }
    if (!alreadyIn) {
      currentItems.push(activityItem);
    }
    return currentItems;
  }


  private _changeSubscriptions: Subscription[] = [];
  private _updateChangeSubscriptions() {
    this._changeSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this._changeSubscriptions = [];
    for (const activityItem of this.activityItems) {
      activityItem.deactivate();
      this._changeSubscriptions.push(activityItem.percentChanged$.subscribe((percentChanged) => {
        this._updatePercentages(activityItem, percentChanged);
      }));
    }
  }

  private _activityChangedSubscriptions: Subscription[] = [];
  private _updateActivityChangedSubscriptions() {
    this._activityChangedSubscriptions.forEach((sub) => { sub.unsubscribe(); });
    this._activityChangedSubscriptions = [];
    this.activityItems.forEach((item) => {
      this._activityChangedSubscriptions.push(item.activityModified$.subscribe((activity) => {
        console.log("Activity modified (color) , ", activity)
        this.activitiesService.updateActivity$(activity);
      }));
    });
  }


  private _updatePercentages(changedActivityItem?: TLEFActivityListItem, newPercent?: number) {
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
              const itemsLength = (this.activityItems.filter((item) => {
                if (item.durationPercent > minimumActivityPercent && item.activity.treeId != changedActivityItem.activity.treeId) {
                  return item;
                }
              })).length;
              if (itemsLength > 0) {
                if (totalSubtract < 1) {
                  changedActivityItem.updatePercentage(changedActivityItem.durationPercent - totalSubtract, maximumPercent, false);
                  totalSubtract = 0;
                } else {
                  const subtractEvenly: number = totalSubtract / itemsLength;
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
              const itemsLength = (this.activityItems.filter((item) => {
                if (item.durationPercent < maximumPercent && item.activity.treeId != changedActivityItem.activity.treeId) {
                  return item;
                }
              })).length;
              if (itemsLength > 0) {
                if (totalAdd < 1) {
                  changedActivityItem.updatePercentage(changedActivityItem.durationPercent + totalAdd, maximumPercent, false);
                  totalAdd = 0;
                } else {
                  const addEvenly: number = totalAdd / itemsLength;
                  this.activityItems.forEach((activityItem) => {
                    if (activityItem.activity.treeId != changedActivityItem.activity.treeId && activityItem.durationPercent < maximumPercent) {
                      if ((activityItem.durationPercent + addEvenly) <= maximumPercent) {
                        totalAdd -= addEvenly;
                        activityItem.updatePercentage(activityItem.durationPercent + addEvenly, maximumPercent, true);
                      } else {
                        const difference: number = (maximumPercent - activityItem.durationPercent)
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
        for (const activityItem of this.activityItems) {
          const durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
          const dividedEvenlyPercentage = durationMinutes / (this.timelogEntryMinutes) * 100;
          activityItem.deactivate();
          activityItem.updatePercentage(dividedEvenlyPercentage, maximumPercent, true);
        }
      }
    }


    // console.log("Emitting some emissions", this.activityItems)
    this.tlefActivitiesChanged.emit(this.activityItems.map(item => item.toEntryActivity()));
    // console.log("This.activityItems; " + this.activityItems.length);

  }

}
