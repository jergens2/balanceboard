import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { TLEFActivityListItem } from './tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ActivityCategoryDefinition } from '../../../../document-definitions/activity-category-definition/activity-category-definition.class';
import { Subscription } from 'rxjs';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DurationString } from '../duration-string.class';
import { TimelogEntry } from '../../timelog-entry.class';
import { TimelogEntryActivity } from '../../timelog-entry-activity.class';


@Component({
  selector: 'app-tlef-activities',
  templateUrl: './tlef-activities.component.html',
  styleUrls: ['./tlef-activities.component.css']
})
export class TlefActivitiesComponent implements OnInit {
  faTimes = faTimes;
  constructor() { }

  @Input() timelogEntryStart: moment.Moment;
  @Input() timelogEntryEnd: moment.Moment;
  @Input() modifyTimelogEntry: TimelogEntry;
  @Output() tlefActivitiesChanged: EventEmitter<TLEFActivityListItem[]> = new EventEmitter();

  activityItems: TLEFActivityListItem[] = [];

  get timelogEntryMinutes(): number {
    return this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes");
  }

  public get currentTimelogEntryDuration(): string {
    return DurationString.calculateDurationString(this.timelogEntryStart, this.timelogEntryEnd);
  }

  ngOnInit() {
    console.log("Timelog Entry tool opened");
    if (this.modifyTimelogEntry) {
      this.timelogEntryStart = this.modifyTimelogEntry.startTime;
      this.timelogEntryEnd = this.modifyTimelogEntry.endTime;

      let maxPercent: number = 100;
      if (this.modifyTimelogEntry.tleActivities.length > 1) {
        maxPercent = 100 - ((this.modifyTimelogEntry.tleActivities.length - 1) * 2);
      }
      let activityItems: TLEFActivityListItem[] = [];
      this.modifyTimelogEntry.tleActivities.forEach((tleActivity: TimelogEntryActivity) => {
        let durationPercent = tleActivity.durationMinutes / this.modifyTimelogEntry.durationMinutes * 100;
        activityItems.push(new TLEFActivityListItem(tleActivity.activity, tleActivity.durationMinutes, durationPercent, this.modifyTimelogEntry.durationMinutes, maxPercent))
      })

      this.activityItems = activityItems;
      this.updateChangeSubscriptions();
      this.activityItems.forEach((activityItem)=>{
        activityItem.updatePercentage(activityItem.durationPercent, maxPercent, true);
      });
      this.tlefActivitiesChanged.emit(this.activityItems);
    }
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
    for(let item of currentItems){
      if(item.activity.treeId == activityItem.activity.treeId){
        alreadyIn = true;
      }
    }
    if(!alreadyIn){
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
