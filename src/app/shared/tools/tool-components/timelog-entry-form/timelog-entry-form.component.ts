import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimelogEntry } from '../../../../dashboard/daybook/time-log/timelog-entry-tile/timelog-entry.model';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';
import { UserDefinedActivity } from '../../../../dashboard/activities/user-defined-activity.model';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TimelogEntryActivity } from '../../../../dashboard/daybook/time-log/timelog-entry-activity.model';
import { DurationString } from './duration-string.class';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { ActivitySliderBar } from './tlef-activity-slider-bar/activity-slider-bar.class';
import { TLEFActivityListItem } from './tlef-activity-list-item.class';
import { isUndefined } from 'util';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  faTimes = faTimes;
  faEdit = faEdit;

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService) { }

  mostRecentTimelogEntry: TimelogEntry;
  currentTimelogEntry: TimelogEntry;
  timelogEntryForm: FormGroup = new FormGroup({});

  clockSubscription: Subscription = new Subscription();


  private _now = moment();

  initiated: boolean = false;
  formIsValid: boolean = false;
  activityItems: TLEFActivityListItem[] = [];


  timelogEntryStart: moment.Moment;
  timelogEntryEnd: moment.Moment;


  ngOnInit() {

    this.mostRecentTimelogEntry = this.timelogService.mostRecentTimelogEntry;


    this.clockSubscription = timer(0, 1000).subscribe(() => {
      this._now = moment();

    })



    let timelogEntryStart: moment.Moment = moment(this.mostRecentTimelogEntry.endTime);
    let timelogEntryEnd: moment.Moment = moment();



    this.timelogEntryStart = timelogEntryStart;
    this.timelogEntryEnd = timelogEntryEnd;




    this.timelogEntryForm = new FormGroup({
      "startTime": new FormControl(timelogEntryStart.format('hh:mm a')),
      "startDate": new FormControl(timelogEntryStart.format('YYYY-MM-DD')),
      "endTime": new FormControl(timelogEntryEnd.format('hh:mm a')),
      "endDate": new FormControl(timelogEntryEnd.format('YYYY-MM-DD')),
      "description": new FormControl(),
    });

    this.initiated = true;
  }
  ngOnDestroy() {
    this.clockSubscription.unsubscribe();
  }



  onClickSaveTimelogEntry() {
    let startTime: string = this.timelogEntryStart.second(0).millisecond(0).toISOString();
    let endTime: string = this.timelogEntryEnd.second(0).millisecond(0).toISOString();
    let description: string = this.timelogEntryForm.controls['description'].value;
    let newTimelogEntry: TimelogEntry = new TimelogEntry("", this.timelogService.userId, startTime, endTime, description);
    this.activityItems.forEach((activityItem) => {
      newTimelogEntry.activities.push(new TimelogEntryActivity(activityItem.activity, ""))
    });
    this.timelogService.saveTimelogEntry(newTimelogEntry);
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  get timelogEntryMinutes(): number {
    return this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes");
  }

  private updateForm() {
    this.timelogEntryForm.controls["startTime"].setValue(this.timelogEntryStart.format('HH:mm'));
    this.timelogEntryForm.controls["startDate"].setValue(this.timelogEntryStart.format('YYYY-MM-DD'));
    this.timelogEntryForm.controls["endTime"].setValue(this.timelogEntryEnd.format('HH:mm'));
    this.timelogEntryForm.controls["endDate"].setValue(this.timelogEntryEnd.format('YYYY-MM-DD'));
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
    let durationPercent = durationMinutes / (this.timelogEntryMinutes) * 100;
    if (this.activityItems.length > 0) {
      this.formIsValid = true;
      this.activityItems.forEach((activityItem) => {
        activityItem.durationMinutes = durationMinutes;
        activityItem.durationPercent = durationPercent;
      });
    }

  }

  onActivityValueChanged(activity: UserDefinedActivity) {
    // This is the event of a new activity being added.
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length + 1);
    let durationPercent = durationMinutes / (this.timelogEntryMinutes) * 100;

    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;

    if (this.activityItems.length > 1) {
      maximumPercent = (100 - ((this.activityItems.length - 1) * minimumActivityPercent));
    }

    let activityItem: TLEFActivityListItem = new TLEFActivityListItem(activity, durationMinutes, durationPercent, this.timelogEntryMinutes, maximumPercent);

    this.activityItems.push(activityItem);

    this.updateChangeSubscriptions();
    this.updatePercentages(activityItem);

    this.updateForm();
  }

  private changeSubscriptions: Subscription[] = [];
  private updateChangeSubscriptions() {
    this.changeSubscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    this.changeSubscriptions = [];
    for (let activityItem of this.activityItems) {
      activityItem.sliderBar.deactivate();
      this.changeSubscriptions.push(activityItem.percentChanged$.subscribe((percentChanged) => {
        this.updatePercentages(activityItem, percentChanged);
      }))
    }
  }

  private updatePercentages(changedActivityItem: TLEFActivityListItem, newPercent?: number) {
    const minimumActivityPercent: number = 2;
    let maximumPercent: number = 100;

    if (this.activityItems.length > 1) {
      maximumPercent = (100 - ((this.activityItems.length - 1) * minimumActivityPercent));
    }
    if (newPercent) {

      if (this.activityItems.length == 1) {
        this.activityItems[0].updatePercentage(100, false, 100);
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

            if(itemsLength > 0){
              let subtractEvenly: number = totalSubtract / itemsLength;

              this.activityItems.forEach((activityItem) => {
                if (activityItem.activity.treeId != changedActivityItem.activity.treeId && activityItem.durationPercent > minimumActivityPercent) {
                  if (activityItem.durationPercent > minimumActivityPercent) {
                    if ((activityItem.durationPercent - subtractEvenly) > minimumActivityPercent) {
                      totalSubtract -= subtractEvenly;
                      activityItem.updatePercentage(activityItem.durationPercent - subtractEvenly, true, maximumPercent);
                    } else {
                      totalSubtract -= (activityItem.durationPercent - minimumActivityPercent);
                      activityItem.updatePercentage(minimumActivityPercent, true, maximumPercent)
                    }
                  }
                }
                if (subtractEvenly <= minimumActivityPercent) {
                  if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                    activityItem.updatePercentage(activityItem.durationPercent - totalSubtract, false, maximumPercent);
                  }
                }
              });
            }else{
              this.activityItems.forEach((activityItem) => {
                if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                  activityItem.updatePercentage(activityItem.durationPercent - totalSubtract, false, maximumPercent);
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
            if(itemsLength > 0){
              let addEvenly: number = totalAdd / itemsLength;
              this.activityItems.forEach((activityItem) => {
  
                if (activityItem.activity.treeId != changedActivityItem.activity.treeId && activityItem.durationPercent < maximumPercent) {
                  if ((activityItem.durationPercent + addEvenly) <= maximumPercent) {
                    totalAdd -= addEvenly;
                    activityItem.updatePercentage(activityItem.durationPercent + addEvenly, true, maximumPercent);
                  } else {
                    let difference: number = (maximumPercent - activityItem.durationPercent)
                    totalAdd -= difference;
                    activityItem.updatePercentage(activityItem.durationPercent + difference, true, maximumPercent);
                  }
                }
  
                if (addEvenly <= 1) {
                  if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                    activityItem.updatePercentage(activityItem.durationPercent + totalAdd, false, maximumPercent);
                  }
                  totalAdd = 0;
                }
              });
            }else{
              this.activityItems.forEach((activityItem)=>{
                if (activityItem.activity.treeId == changedActivityItem.activity.treeId) {
                  activityItem.updatePercentage(activityItem.durationPercent + totalAdd, false, maximumPercent);
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
        console.log("divided evenly", dividedEvenlyPercentage)
        activityItem.sliderBar.deactivate();
        activityItem.updatePercentage(dividedEvenlyPercentage, true, maximumPercent);
      }
    }

  }







  editingTimes: boolean = false;
  onClickEditTimes() {
    this.editingTimes = true;
  }

  onMouseEnterActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = true;
  }

  onMouseLeaveActivity(activityItem: TLEFActivityListItem) {
    activityItem.mouseOver = false;
  }
  onClickRemoveActivity(activityItem: TLEFActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
    this.updatePercentages(activityItem);
    this.updateForm();
  }

  mouseOverTimes: boolean = false;
  onMouseEnterTimes() {
    this.mouseOverTimes = true;
  }
  onMouseLeaveTimes() {
    this.mouseOverTimes = false;
  }


  onClickClose() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  public get currentTime(): moment.Moment {
    return this._now
  }


  public get saveDisabled(): string {
    if (this.formIsValid) {
      return "";
    } else {
      return "disabled";
    }
  }

  public get currentTimelogEntryDuration(): string {
    return DurationString.calculateDurationString(this.timelogEntryStart, this.timelogEntryEnd);
  }

}
