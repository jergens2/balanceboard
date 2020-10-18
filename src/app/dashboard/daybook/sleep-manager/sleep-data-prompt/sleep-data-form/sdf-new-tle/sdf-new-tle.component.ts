import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DurationString } from '../../../../../../shared/time-utilities/duration-string.class';
import { TimeInput } from '../../../../../../shared/components/time-input/time-input.class';
import { SleepService } from '../../../sleep.service';
import { Subscription } from 'rxjs';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ActivityCategoryDefinition } from '../../../../../activities/api/activity-category-definition.class';
import { TLEFActivityListItem } from '../../../../widgets/timelog/timelog-entry-form/tlef-parts/tlef-modify-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import * as moment from 'moment';
import { ActivityHttpService } from '../../../../../activities/api/activity-http.service';

@Component({
  selector: 'app-sdf-new-tle',
  templateUrl: './sdf-new-tle.component.html',
  styleUrls: ['./sdf-new-tle.component.css']
})
export class SdfNewTleComponent implements OnInit {

  public readonly faTimes = faTimes;

  constructor(private sleepService: SleepService, private activitiesService: ActivityHttpService) { }
  private _startTimeInput: TimeInput;
  private _endTimeInput: TimeInput;
  private _durationString: string = '';
  private _durationMin: number = 0;
  private _startSub: Subscription = new Subscription();
  private _endSub: Subscription = new Subscription();
  private _activityItems: TLEFActivityListItem[] = [];

  public get activityItems(): TLEFActivityListItem[] { return this._activityItems; }

  public get durationString(): string { return this._durationString; }
  public get startTimeInput(): TimeInput { return this._startTimeInput; }
  public get endTimeInput(): TimeInput { return this._endTimeInput; }
  @Input() public set startTimeInput(timeInput: TimeInput) {
    this._startTimeInput = timeInput;
    this._startSub.unsubscribe();
    this._startSub = this._startTimeInput.timeValue$.subscribe(t => this._update());
    this._update();
  }
  @Input() public set endTimeInput(timeInput: TimeInput) {
    this._endTimeInput = timeInput;
    this._endSub.unsubscribe();
    this._endSub = this._endTimeInput.timeValue$.subscribe(t => this._update());
    this._update();
  }

  @Output() cancel: EventEmitter<boolean> = new EventEmitter();
  @Output() activities: EventEmitter<TLEFActivityListItem[]> = new EventEmitter();

  ngOnInit(): void {
    this._update();
  }

  public onClickCancel() { this.cancel.emit(true); }

  private _update() {
    if (this._startTimeInput && this._endTimeInput) {
      this._durationString = DurationString.calculateDurationString(this._startTimeInput.timeValue, this._endTimeInput.timeValue);
      this._durationMin = moment(this._endTimeInput.timeValue).diff(this._startTimeInput.timeValue, 'minutes');
    }
    if (this._activityItems.length > 0) {
      this._activityItems.forEach(item => item.updateDuration(this._durationMin))
    }
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
    const durationMinutes: number = this._durationMin / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this._updateChangeSubscriptions();
    this._updatePercentages(activityItem);
  }


  public onActivityValueChanged(activity: ActivityCategoryDefinition) {
    activity = this.activitiesService.findActivityByTreeId(activity.treeId);
    const durationMinutes: number = this._durationMin / (this._activityItems.length + 1);
    const durationPercent = durationMinutes / (this._durationMin) * 100;
    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;
    if (this._activityItems.length > 1) {
      maximumPercent = (100 - ((this._activityItems.length - 1) * minimumActivityPercent));
    }
    const activityItem: TLEFActivityListItem = new TLEFActivityListItem(activity, durationMinutes, durationPercent, this._durationMin, maximumPercent);
    this._activityItems = this._addNewActivityItem(activityItem);
    this._updateChangeSubscriptions();
    this._updatePercentages(activityItem);
    this._updateActivityChangedSubscriptions();
    this.activities.next(this._activityItems);
  }

  private _addNewActivityItem(activityItem: TLEFActivityListItem): TLEFActivityListItem[] {
    const currentItems = this._activityItems;
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
    for (const activityItem of this._activityItems) {
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
    this._activityItems.forEach((item) => {
      this._activityChangedSubscriptions.push(item.activityModified$.subscribe((activity) => {
        this.activitiesService.updateActivity$(activity);
      }));
    });
  }


  private _updatePercentages(changedActivityItem?: TLEFActivityListItem, newPercent?: number) {
    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;
    if (changedActivityItem) {
      if (this._activityItems.length > 1) {
        maximumPercent = (100 - ((this._activityItems.length - 1) * minimumActivityPercent));
      }
      if (newPercent) {
        if (this._activityItems.length == 1) {
          this._activityItems[0].updatePercentage(100, 100, false);
        } else if (this._activityItems.length > 1) {
          let percentageSum: number = 0;
          this._activityItems.forEach((activityItem) => { percentageSum += activityItem.durationPercent });
          if (percentageSum > 100) {
            let totalSubtract: number = percentageSum - 100;
            while (totalSubtract > 0) {
              const itemsLength = (this._activityItems.filter((item) => {
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
                  this._activityItems.forEach((activityItem) => {
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
                this._activityItems.forEach((activityItem) => {
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
              const itemsLength = (this._activityItems.filter((item) => {
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
                  this._activityItems.forEach((activityItem) => {
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
                this._activityItems.forEach((activityItem) => {
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
        for (const activityItem of this._activityItems) {
          const durationMinutes: number = this._durationMin / (this._activityItems.length);
          const dividedEvenlyPercentage = durationMinutes / (this._durationMin) * 100;
          activityItem.deactivate();
          activityItem.updatePercentage(dividedEvenlyPercentage, maximumPercent, true);
        }
      }
    }
  }
}

