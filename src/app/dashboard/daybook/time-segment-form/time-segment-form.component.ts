import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TimeSegment } from '../time-log/time-segment.model';
import { TimeSegmentActivity } from '../time-log/time-segment-activity.model';
import { faPlus, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { ActivitiesService } from '../../activities/activities.service';
import { ActivityTree } from '../../activities/activity-tree.model';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';
import { TimelogService } from '../time-log/timelog.service';
import { ITimeSegmentFormData } from './time-segment-form-data.interface';


@Component({
  selector: 'app-time-segment-form',
  templateUrl: './time-segment-form.component.html',
  styleUrls: ['./time-segment-form.component.css']
})
export class TimeSegmentFormComponent implements OnInit {


  faPlus = faPlus;
  faCaretDown = faCaretDown;


  constructor(private activitiesService: ActivitiesService, private timelogService: TimelogService) { }

  previousTimeSegmentEnd: moment.Moment;

  private _providedFormData: ITimeSegmentFormData = null;
  @Input() set providedFormData(data: ITimeSegmentFormData) {
    this._providedFormData = data;
    this.action = this._providedFormData.action;
    console.log(this.action)
  };

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter();

  timeSegmentForm: FormGroup = null;

  timeSegmentActivities: TimeSegmentActivity[] = [];

  ifAddActivity: boolean = false;

  activityTextInputValue: string = "";
  private selectedActivity: UserDefinedActivity = null;
  private activitiesTree: ActivityTree = null;
  activitiesDropDownList: UserDefinedActivity[] = [];

  private timeSegments: TimeSegment[] = [];
  private action: string = "";
  public get viewAction(): string {

    if (this.action == "BLANK" || this.action == "NEW") {
      return "New";
    } else if (this.action == "REVIEW") {
      return "Review";
    } else {
      return "";
    }
  }

  ngOnInit() {


    this.timeSegments = Object.assign([], this.timelogService.timeSegments);

    this.activitiesTree = this.activitiesService.activitiesTree;

    if (this.action == "BLANK") {

      let startTime: moment.Moment = this.findNewStartTime();
      let endTime: moment.Moment = moment();
      if (moment(endTime).isBefore(moment(moment(startTime).add(12, 'hours'))) || moment(endTime).format('YYYY-MM-DD') == moment(startTime).format('YYYY-MM-DD')) {
        endTime = moment();
      } else {
        endTime = moment(startTime).add(1, 'hour');
      }


      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(moment(startTime).format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(moment(startTime).format('YYYY-MM-DD')),
        'endTime': new FormControl(moment(endTime).format('HH:mm'), Validators.required),
        'endTimeDate': new FormControl(moment(endTime).format('YYYY-MM-DD')),
        'description': new FormControl(),
      });

    } else if (this.action == "REVIEW" || this.action == "SET") {
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(this.providedFormData.timeSegment.startTime.format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(this.providedFormData.timeSegment.startTime.format('YYYY-MM-DD')),
        'endTime': new FormControl(this.providedFormData.timeSegment.endTime.format('HH:mm'), Validators.required),
        'endTimeDate': new FormControl(this.providedFormData.timeSegment.endTime.format('YYYY-MM-DD')),
        'description': new FormControl(this.providedFormData.timeSegment.description),
      });
      this.timeSegmentActivities = Object.assign([], this.providedFormData.timeSegment.activities);
    }


  }

  private findNewStartTime() {
    let latestTime: moment.Moment = null;
    for (let timeSegment of this.timeSegments) {
      if (latestTime == null) {
        latestTime = moment(timeSegment.endTime);
      }
      if (moment(timeSegment.endTime).isAfter(moment(latestTime))) {
        latestTime = moment(timeSegment.endTime);
      }
    }
    return moment(latestTime);
  }



  get durationString(): string {
    let startTimeValue: string = this.timeSegmentForm.controls['startTime'].value;
    let startHour = parseInt(startTimeValue.substr(0, 2));
    let startMinute = parseInt(startTimeValue.substr(3, 2));
    let startTime: moment.Moment = moment().hour(startHour).minute(startMinute);


    let endTimeValue: string = this.timeSegmentForm.controls['endTime'].value;
    let endHour = parseInt(endTimeValue.substr(0, 2));
    let endMinute = parseInt(endTimeValue.substr(3, 2));
    let endTime: moment.Moment = moment().hour(endHour).minute(endMinute);

    let durationMinutes = moment(endTime).diff(moment(startTime), "minutes");

    if (this.action == "NEW") {
      return "Activities in the last " + durationMinutes + " minutes";
    } else if (this.action == "REVIEW") {
      return "The duration of this time segment was " + durationMinutes + " minutes";
    }

  }


  private searchForActivities(searchValue: string) {
    if (searchValue.length > 0) {
      let searchResults: UserDefinedActivity[] = [];
      let activitiesArray: UserDefinedActivity[] = Object.assign([], this.activitiesTree.allActivities);
      for (let activity of activitiesArray) {
        if (activity.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
          searchResults.push(Object.assign({}, activity));
        }
      }
      this.activitiesDropDownList = searchResults;
    } else {
      this.activitiesDropDownList = [];
    }

  }

  get activityDropdownHeight(): string {
    let px = this.activitiesDropDownList.length * 30;
    if (px <= 30) {
      return "30px";
    } else if (px >= 200) {
      return "200px";
    } else {
      return "" + px + "px";
    }

  }


  onClickAddActivityButton() {
    this.ifAddActivity = !this.ifAddActivity;
  }

  onClickActivityDropdown() {
    if (this.activitiesDropDownList.length > 0) {
      this.activitiesDropDownList = [];
    } else {
      if (this.activityTextInputValue.length > 0) {
        this.searchForActivities(this.activityTextInputValue);
      } else {
        this.viewTreeList();
      }
    }
  }

  private viewTreeList() {
    let rootActivities: UserDefinedActivity[] = Object.assign([], this.activitiesTree.rootActivities);

    for (let activity of rootActivities) {

    }

    this.activitiesDropDownList = Object.assign([], rootActivities);
  }

  onClickActivityDropdownItem(activity: UserDefinedActivity) {

    this.activityTextInputValue = activity.name;
    this.selectedActivity = activity;
    this.activitiesDropDownList = [];
  }

  onActivityInputKeyUp($event) {
    let searchValue: string = $event.target.value;
    this.searchForActivities(searchValue);
  }


  onClickSaveActivity() {
    this.activityTextInputValue = "";
    this.timeSegmentActivities.push(new TimeSegmentActivity(this.selectedActivity, 0, ''));
    this.ifAddActivity = false;
  }
  onClickCancelActivity() {
    this.ifAddActivity = false;
  }

  onClickSaveTimeSegment() {
    let startTime = moment(this.timeSegmentForm.get('startTimeDate').value + ' ' + this.timeSegmentForm.get('startTime').value).toISOString();
    let endTime = moment(this.timeSegmentForm.get('endTimeDate').value + ' ' + this.timeSegmentForm.get('endTime').value).toISOString();
    let newTimeSegment: TimeSegment;
    if (this.action == "NEW" || this.action == "BLANK") {
      newTimeSegment = new TimeSegment(null, null, startTime, endTime, this.timeSegmentForm.get('description').value);
      newTimeSegment.activities = this.timeSegmentActivities;
      this.timelogService.saveTimeSegment(newTimeSegment);
    } else if (this.action == "REVIEW") {
      newTimeSegment = new TimeSegment(this.providedFormData.timeSegment.id, this.providedFormData.timeSegment.userId, startTime, endTime, this.timeSegmentForm.get('description').value);
      for (let activity of this.timeSegmentActivities) {
        newTimeSegment.activities.push(activity)
      }
      this.timelogService.updateTimeSegment(newTimeSegment);
    }
    this.timeSegmentForm.reset()
    this.closeForm.emit();

  }

  onClickCancel() {
    this.closeForm.emit();
  }

}
