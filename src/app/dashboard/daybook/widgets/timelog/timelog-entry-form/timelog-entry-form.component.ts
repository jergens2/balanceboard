import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../../modal/modal.service';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';

import { DurationString } from './duration-string.class';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { ActivityCategoryDefinitionService } from '../../../../../shared/document-definitions/activity-category-definition/activity-category-definition.service';

import { TimelogEntryFormService } from './timelog-entry-form.service';
import { DaybookTimelogEntryDataItem } from '../../../api/data-items/daybook-timelog-entry-data-item.interface';
import { TimelogEntryActivity } from '../../../api/data-items/timelog-entry-activity.interface';
import { TimelogEntryForm } from './timelog-entry-form.class';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  constructor(private timelogEntryService: TimelogEntryFormService, private toolsService: ToolsService, private modalService: ModalService, private activityCategoryDefinitionService: ActivityCategoryDefinitionService) { }

  @Input('timelogEntry') modifyTimelogEntry: DaybookTimelogEntryDataItem;


  timelogEntryForm: TimelogEntryForm;

  timesFormGroup: FormGroup;

  ngOnInit() {
    this.timelogEntryForm = new TimelogEntryForm();
    this.timesFormGroup = new FormGroup({
      fallAsleepTime: new FormControl(this.timelogEntryForm.lastNightFallAsleepTimeHHmm),
      wakeupTime: new FormControl(this.timelogEntryForm.wakeupTimeHHmm)
    })
  }


  public get message(): string {
    return this.timelogEntryForm.message;
  }
  public get lastNightFallAsleepTimeHHmm(): string {
    return this.timelogEntryForm.lastNightFallAsleepTimeHHmm;
  }
  public get timeSinceWakeup(): string {
    return this.timelogEntryForm.timeSinceWakeup;
  }
  public get timeUntilBedtime(): string {
    return this.timelogEntryForm.timeUntilBedtime;
  }

  public get wakeupTimeHHmm(): string {
    return this.timelogEntryForm.wakeupTimeHHmm;
  }

  public get wakeupTime(): moment.Moment{
    return this.timelogEntryForm.wakeupTime;
  }
  public get bedtime(): moment.Moment{
    return this.timelogEntryForm.bedtime;
  }
  public get currentTime(): moment.Moment {
    return this.timelogEntryForm.currentTime;
  }

  public onClickSleepTimes() {
    // this.timelogEntryForm.saveTimes();
    let wakeupTime: any = this.parseFormTimeInput(this.timesFormGroup.controls["wakeupTime"].value);
    let fallAsleepTime: any = this.parseFormTimeInput(this.timesFormGroup.controls["fallAsleepTime"].value);
    this.timelogEntryForm.onClickSaveSleepTimes(wakeupTime, fallAsleepTime);
  }


  private parseFormTimeInput(formInput: string): {hour: number, minute: number}{
    console.log("form input value is: " , formInput);
    if(formInput){
      let hours: number = Number(formInput.substring(0, 2));
      let minutes: number = Number(formInput.substring(3, 5));
      return {
        hour: hours,
        minute: minutes,
      }
    }else{
      return null;
    }
  } 












  action: string = "NEW";
  faEdit = faEdit;
  currentTimelogEntry: DaybookTimelogEntryDataItem;
  // timelogEntryForm: FormGroup = new FormGroup({});

  clockSubscription: Subscription = new Subscription();




  initiated: boolean = false;
  formIsValid: boolean = false;



  timelogEntryStart: moment.Moment;
  timelogEntryEnd: moment.Moment;



  ngOnDestroy() {
    this.clockSubscription.unsubscribe();
    this.timelogEntryForm = null;
  }





  onClickSaveTimelogEntry() {

    if (this.modifyTimelogEntry) {
      // Currently cannot modify timelog entry start or end time.
      // let description: string = this.timelogEntryForm.controls['description'].value;
      // this.modifyTimelogEntry.note = description;

      this.updateITLEActivities();
      this.modifyTimelogEntry.timelogEntryActivities = this.timelogEntryActivities;

      this.timelogEntryService.updateTimelogEntry(this.modifyTimelogEntry);
      this.modalService.closeModal();
    } else {
      let startTime: string = this.timelogEntryStart.toISOString();
      let endTime: string = this.timelogEntryEnd.toISOString();
      let utcOffsetMinutes: number = this.timelogEntryStart.utcOffset();
      // let description: string = this.timelogEntryForm.controls['description'].value;
      // let newTimelogEntry: DaybookTimelogEntryDataItem = {
      //   startTimeISO: startTime,
      //   endTimeISO: endTime,
      //   utcOffsetMinutes: utcOffsetMinutes,
      //   isConfirmed: true,
      //   note: description,
      //   timelogEntryActivities: this.timelogEntryActivities
      // }
      this.updateITLEActivities();

      // this.timelogEntryService.saveTimelogEntry(newTimelogEntry);
      this.toolsService.closeTool();
    }


  }

  get timelogEntryMinutes(): number {
    return this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes");
  }


  private timelogEntryActivities: TimelogEntryActivity[] = [];
  private updateITLEActivities() {
    let timelogEntryActivities: TimelogEntryActivity[] = [];
    if (this.activityItems.length > 0) {
      this.activityItems.forEach((activityItem: TLEFActivityListItem) => {
        // let durationMinutes: number = totalDuration * (activityItem.durationPercent / 100);
        timelogEntryActivities.push({
          activityTreeId: activityItem.activity.treeId,
          percentage: activityItem.durationPercent,
        });
      });
      this.timelogEntryActivities = timelogEntryActivities;
    } else {
      this.timelogEntryActivities = [];
    }
    if (this.timelogEntryActivities.length > 0) {
      this.formIsValid = true;
    } else {
      this.formIsValid = false;
    }
  }
  private activityItems: TLEFActivityListItem[] = [];
  onActivitiesChanged(activityItems: TLEFActivityListItem[]) {
    this.activityItems = activityItems;
    this.updateITLEActivities();

  }




  editingTimes: boolean = false;
  onClickEditTimes() {
    this.editingTimes = true;
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




  public get onClickSaveDisabled(): string {
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
