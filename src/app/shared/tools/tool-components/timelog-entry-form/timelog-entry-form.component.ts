import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimelogEntry } from '../../../../dashboard/daybook/time-log/timelog-entry/timelog-entry.class';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';
import { UserDefinedActivity } from '../../../../dashboard/activities/user-defined-activity.model';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TimelogEntryActivityZZ } from '../../../../dashboard/daybook/time-log/timelog-entry/timelog-entry-activity.class';
import { DurationString } from './duration-string.class';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { ActivitySliderBar } from './tlef-activities/tlef-activity-slider-bar/activity-slider-bar.class';
import { TLEFActivityListItem } from './tlef-activities/tlef-activity-slider-bar/tlef-activity-list-item.class';
import { isUndefined } from 'util';
import { ActivitiesService } from '../../../../dashboard/activities/activities.service';
import { ITLEActivity } from '../../../../dashboard/daybook/time-log/timelog-entry/timelog-entry-activity.interface';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {


  faEdit = faEdit;

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService, private activitiesService: ActivitiesService) { }

  mostRecentTimelogEntry: TimelogEntry;
  currentTimelogEntry: TimelogEntry;
  timelogEntryForm: FormGroup = new FormGroup({});

  clockSubscription: Subscription = new Subscription();


  private _now = moment();

  initiated: boolean = false;
  formIsValid: boolean = false;



  timelogEntryStart: moment.Moment;
  timelogEntryEnd: moment.Moment;


  ngOnInit() {

    this.mostRecentTimelogEntry = this.timelogService.mostRecentTimelogEntry;

    this.timelogEntryStart = moment(this.mostRecentTimelogEntry.endTime);
    this.timelogEntryEnd = moment(this._now);
    this.clockSubscription = timer(0, 1000).subscribe(() => {
      this._now = moment();
      this.timelogEntryStart = moment(this.mostRecentTimelogEntry.endTime);
      this.timelogEntryEnd = moment(this._now);
    })



    this.timelogEntryForm = new FormGroup({
      "startTime": new FormControl(this.timelogEntryStart.format('hh:mm a')),
      "startDate": new FormControl(this.timelogEntryStart.format('YYYY-MM-DD')),
      "endTime": new FormControl(this.timelogEntryEnd.format('hh:mm a')),
      "endDate": new FormControl(this.timelogEntryEnd.format('YYYY-MM-DD')),
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
    let newTimelogEntry: TimelogEntry = new TimelogEntry("", this.timelogService.userId, startTime, endTime, description, this.activitiesService);
    this.updateITLEActivities();
    newTimelogEntry.setTleActivities(this.itleActivities);

    
    // console.log("Saving timelogEntry: ", newTimelogEntry);
    // console.log(newTimelogEntry.httpSave);

    this.timelogService.saveTimelogEntry(newTimelogEntry);
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  get timelogEntryMinutes(): number {
    return this.timelogEntryEnd.diff(this.timelogEntryStart, "minutes");
  }







  private itleActivities: ITLEActivity[] = [];
  private updateITLEActivities(){
    let totalDuration = this.timelogEntryMinutes;
    let itleActivities: ITLEActivity[] = [];
    if(this.activityItems.length > 0){
      this.activityItems.forEach((activityItem: TLEFActivityListItem) => {
        let durationMinutes: number = totalDuration * (activityItem.durationPercent / 100);
        itleActivities.push({
          activityTreeId: activityItem.activity.treeId,
          durationMinutes: durationMinutes
        });
      });
      this.itleActivities = itleActivities;
    }else{
      this.itleActivities = [];
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
