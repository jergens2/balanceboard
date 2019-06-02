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
import { ITLEFActivityListItem } from './tlef-activity-list-item.interface';

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
  activityItems: ITLEFActivityListItem[] = [];

  
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

  get timelogEntryMinutes(): number{
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
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length + 1);
    let durationPercent = durationMinutes / (this.timelogEntryMinutes) * 100;

    let sliderBar: ActivitySliderBar = new ActivitySliderBar(durationPercent, activity.color);


    let activityItem: ITLEFActivityListItem = {
      activity: activity,
      durationMinutes: durationMinutes,
      durationPercent: durationPercent,
      mouseOver: false,
      sliderBar: sliderBar,
    }

    this.activityItems.push(activityItem);

    this.updatePercentages(activityItem);
   
    this.updateForm();
  }

  private updatePercentages(activityItem: ITLEFActivityListItem, newPercent?: number){
    if(newPercent){

    }else{
      
    }

  }

  onActivityItemPercentChanged(activityItem: ITLEFActivityListItem, newPercent: number){
    console.log("Percent changed: " + newPercent);
    this.updatePercentages(activityItem, newPercent);
  }

  



  editingTimes: boolean = false;
  onClickEditTimes(){
    this.editingTimes = true;
  }

  onMouseEnterActivity(activityItem: ITLEFActivityListItem) {
    activityItem.mouseOver = true;
  }

  onMouseLeaveActivity(activityItem: ITLEFActivityListItem) {
    activityItem.mouseOver = false;
  }
  onClickRemoveActivity(activityItem: ITLEFActivityListItem) {
    this.activityItems.splice(this.activityItems.indexOf(activityItem), 1);
    let durationMinutes: number = this.timelogEntryMinutes / (this.activityItems.length);
    this.activityItems.forEach((activityItem) => {
      activityItem.durationMinutes = durationMinutes;
    });
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
