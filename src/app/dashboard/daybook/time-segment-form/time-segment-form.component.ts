import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TimeSegment } from '../time-log/time-segment.model';
import { TimeSegmentActivity } from '../time-log/time-segment-activity.model';
import { faPlus, faCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ActivitiesService } from '../../activities/activities.service';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';
import { TimelogService } from '../time-log/timelog.service';
import { ITimeSegmentFormData } from './time-segment-form-data.interface';
import { Subscription } from 'rxjs';
import { Modal } from '../../../modal/modal.model';
import { ModalService } from '../../../modal/modal.service';


@Component({
  selector: 'app-time-segment-form',
  templateUrl: './time-segment-form.component.html',
  styleUrls: ['./time-segment-form.component.css']
})
export class TimeSegmentFormComponent implements OnInit, OnDestroy {


  faPlus = faPlus;
  faCaretDown = faCaretDown;
  faTimes = faTimes;


  constructor(private activitiesService: ActivitiesService, private timelogService: TimelogService, private modalService: ModalService) { }

  // previousTimeSegmentEnd: moment.Moment;

  private _providedFormData: ITimeSegmentFormData = null;
  @Input() set providedFormData(data: ITimeSegmentFormData) {
    this._providedFormData = data;
    console.log("data is ", data);
    this.action = this._providedFormData.action;
  };

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter();

  timeSegmentForm: FormGroup = null;

  timeSegmentActivities: TimeSegmentActivity[] = [];

  ifAddActivity: boolean = false;

  private selectedActivity: UserDefinedActivity = null;

  durationString: string = "";

  private timeSegments: TimeSegment[] = [];
  action: string = "";
  public get viewAction(): string {

    if (this.action == "BLANK" || this.action == "NEW") {
      return "New";
    } else if (this.action == "REVIEW") {
      return "Review";
    } else {
      return "";
    }
  }

  private _startDate: moment.Moment;
  get startDate(): string {
    return this._startDate.format('YYYY-MM-DD');
  }

  private controlSubscriptions: Subscription[] = [];

  ngOnInit() {


    this.timeSegments = Object.assign([], this.timelogService.timeSegments);



    if (this.action == "BLANK") {

      let startTime: moment.Moment = this.findNewStartTime();
      let endTime: moment.Moment = null
      if (Math.abs(moment().diff(moment(startTime), "hours")) > 12) {
        console.log("start time was more than 12 hours ago or from now");
      }

      if (moment().isAfter(moment(startTime))) {
        endTime = moment();
      } else {
        console.log("Problem: now is before the start time" + startTime.format('YYYY-MM-DD hh:mm a'));
      }

      if (moment(endTime).isBefore(moment(startTime).add(12, 'hours')) || moment(endTime).format('YYYY-MM-DD') == moment(startTime).format('YYYY-MM-DD')) {
        endTime = moment();
      } else {
        console.log("start and end were beyond 12 hours / 1 day of another.")
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
        'startTime': new FormControl(this._providedFormData.timeSegment.startTime.format('HH:mm'), Validators.required),
        'startTimeDate': new FormControl(this._providedFormData.timeSegment.startTime.format('YYYY-MM-DD')),
        'endTime': new FormControl(this._providedFormData.timeSegment.endTime.format('HH:mm'), Validators.required),
        'endTimeDate': new FormControl(this._providedFormData.timeSegment.endTime.format('YYYY-MM-DD')),
        'description': new FormControl(this._providedFormData.timeSegment.description),
      });
      this.timeSegmentActivities = Object.assign([], this._providedFormData.timeSegment.activities);
    }
    this.validateTimes();



    this.controlSubscriptions.push(
      this.timeSegmentForm.controls['startTime'].valueChanges.subscribe(() => {
        this.validateTimes();
      })
    );
    this.controlSubscriptions.push(
      this.timeSegmentForm.controls['startTimeDate'].valueChanges.subscribe(() => {
        this.validateTimes();
      })
    );
    this.controlSubscriptions.push(
      this.timeSegmentForm.controls['endTime'].valueChanges.subscribe(() => {
        this.validateTimes();
      })
    );
    this.controlSubscriptions.push(
      this.timeSegmentForm.controls['endTimeDate'].valueChanges.subscribe(() => {
        this.validateTimes();
      })
    );

  }
  ngOnDestroy() {
    this.controlSubscriptions.forEach((sub) => { sub.unsubscribe(); });
    this._modalSubscription.unsubscribe();
  }

  private validateTimes() {

    let startTimeString: string = this.timeSegmentForm.controls['startTimeDate'].value + " " + this.timeSegmentForm.controls['startTime'].value;
    let startTime = moment(startTimeString);

    let endTimeString: string = this.timeSegmentForm.controls['endTimeDate'].value + " " + this.timeSegmentForm.controls['endTime'].value;
    let endTime = moment(endTimeString);





    if (startTime.isAfter(endTime)) {
      this.startTimeError = true;
      this.endTimeError = true;
      this.durationString = "Start must be before end"
    } else {
      this.startTimeError = false;
      this.endTimeError = false;

      let duration: number = moment(endTime).diff(moment(startTime), "minutes");
      let durationString: string = "";
      if(duration >= 0 && duration <= 60){
        durationString = duration.toFixed(0) + " min"
      }else if(duration > 60){
        durationString = Math.floor(duration/60).toFixed(0) + " hr " + (duration- (60 * (Math.floor(duration/60)))) + " min"
      }else{
        this.startTimeError = true;
        this.endTimeError = true;
        durationString = "Error with duration"; 
      }
  
      this.durationString = durationString;

    }

  }

  private findNewStartTime() {
    let latestTime: moment.Moment = null;
    if (this.timeSegments.length > 0) {
      for (let timeSegment of this.timeSegments) {
        if (latestTime == null) {
          latestTime = moment(timeSegment.endTime);
        }
        if (moment(timeSegment.endTime).isAfter(moment(latestTime))) {
          latestTime = moment(timeSegment.endTime);
        }
      }
      return moment(latestTime);
    } else {
      console.log("there were no timesegments");
      return moment().subtract(1, "hour");
    }
  }




  get startTimeDate(): string {
    let value = moment(this.timeSegmentForm.controls['startTimeDate'].value).format('YYYY-MM-DD')
    return value;
  }
  get endTimeDate(): string {
    let startDate = moment(this.timeSegmentForm.controls['startTimeDate'].value).format('YYYY-MM-DD');
    let value = moment(this.timeSegmentForm.controls['endTimeDate'].value).format('YYYY-MM-DD')
    if (value == startDate) {
      return "Same Date"
    } else {
      return value;
    }
  }


  private _modalSubscription: Subscription = new Subscription();
  onClickDeleteTimeEvent(){
    this._modalSubscription.unsubscribe();
    let modalOptions: string[] = ["Yes", "No"];     
    let modal: Modal = new Modal("Confirm: Delete Time Event?", modalOptions);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: string)=>{
      if(selectedOption == "Yes"){

        this.timelogService.deleteTimeSegment(this._providedFormData.timeSegment);
        this.closeForm.emit(true);
      }else if(selectedOption == "No"){

      }else{
        //error 
      }
    });
    this.modalService.activeModal = modal;
  }



  startTimeError: boolean = false;
  endTimeError: boolean = false;

  modifyStartDate: boolean = false;
  onClickModifyStartDate() {
    this.modifyStartDate = !this.modifyStartDate;
  }
  modifyEndDate: boolean = false;
  onClickModifyEndDate() {
    this.modifyEndDate = !this.modifyEndDate;
  }

  onClickAddActivityButton() {
    this.ifAddActivity = !this.ifAddActivity;
  }


  onActivityInputDropdownValueChanged(activityValue: UserDefinedActivity) {
    this.selectedActivity = activityValue;
  }






  onClickSaveActivity() {

    if(this.selectedActivity){
      this.timeSegmentActivities.push(new TimeSegmentActivity(this.selectedActivity, 0, ''));
      this.ifAddActivity = false;
    }else{

    }


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
