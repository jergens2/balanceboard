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

  @Input() action: string = "New";
  @Input() newTimeSegment: TimeSegment = null;
  @Input() reviewTimeSegment: TimeSegment;

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter();

  timeSegmentForm: FormGroup = null;

  timeSegmentActivities: TimeSegmentActivity[] = [];

  ifAddActivity: boolean = false;

  activityTextInputValue: string = "";
  private selectedActivity: UserDefinedActivity = null;
  private activitiesTree: ActivityTree = null;
  activitiesDropDownList: UserDefinedActivity[] = [];



  ngOnInit() {

    this.activitiesTree = this.activitiesService.activitiesTree;



    if (this.action == "New") {
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(moment(this.newTimeSegment.startTime).format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(moment(this.newTimeSegment.startTime).format('YYYY-MM-DD')),
        'endTime': new FormControl(moment(this.newTimeSegment.endTime).format('HH:mm'), Validators.required),
        'endTimeDate': new FormControl(moment(this.newTimeSegment.endTime).format('YYYY-MM-DD')),
        'description': new FormControl(),
      });
    } else if (this.action == "Review") {
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(this.reviewTimeSegment.startTime.format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(this.reviewTimeSegment.startTime.format('YYYY-MM-DD')),
        'endTime': new FormControl(this.reviewTimeSegment.endTime.format('HH:mm'), Validators.required),
        'endTimeDate': new FormControl(this.reviewTimeSegment.endTime.format('YYYY-MM-DD')),
        'description': new FormControl(this.reviewTimeSegment.description),
      });
      this.timeSegmentActivities = Object.assign([], this.reviewTimeSegment.activities);
    } else {
      // bad action
    }


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

    if (this.action == "New") {
      return "Activities in the last " + durationMinutes + " minutes";
    } else if (this.action = "Review") {
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
    if (this.action == "New") {
      newTimeSegment = new TimeSegment(null, null, startTime, endTime, this.timeSegmentForm.get('description').value);
      newTimeSegment.activities = this.timeSegmentActivities;
      this.timelogService.saveTimeSegment(newTimeSegment);
    } else if (this.action == "Review") {
      newTimeSegment = new TimeSegment(this.reviewTimeSegment.id, this.reviewTimeSegment.userId, startTime, endTime, this.timeSegmentForm.get('description').value);
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
