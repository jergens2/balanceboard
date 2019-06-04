import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TimelogEntry } from '../time-log/timelog-entry/timelog-entry.class';
import { TimelogEntryActivityZZ } from '../time-log/timelog-entry/timelog-entry-activity.class';
import { faPlus, faCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ActivitiesService } from '../../activities/activities.service';
import { UserDefinedActivity } from '../../activities/user-defined-activity.model';
import { TimelogService } from '../time-log/timelog.service';
import { ITimelogEntryFormData } from './timelog-entry-form-data.interface';
import { Subscription } from 'rxjs';
import { Modal } from '../../../modal/modal.model';
import { ModalService } from '../../../modal/modal.service';
import { IModalOption } from '../../../modal/modal-option.interface';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { ITLEActivity } from '../time-log/timelog-entry/timelog-entry-activity.interface';


@Component({
  selector: 'app-time-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {


  faPlus = faPlus;
  faCaretDown = faCaretDown;
  faTimes = faTimes;


  constructor(private activitiesService: ActivitiesService, private timelogService: TimelogService, private modalService: ModalService) { }

  // previousTimelogEntryEnd: moment.Moment;

  private _providedFormData: ITimelogEntryFormData = null;
  @Input() set providedFormData(data: ITimelogEntryFormData) {
    this._providedFormData = data;
    console.log("data is ", data);
    this.action = this._providedFormData.action;
  };

  @Output() closeForm: EventEmitter<boolean> = new EventEmitter();

  timelogEntryForm: FormGroup = null;

  timelogEntryActivities: TimelogEntryActivityZZ[] = [];

  ifAddActivity: boolean = false;

  private selectedActivity: UserDefinedActivity = null;

  durationString: string = "";

  private timelogEntrys: TimelogEntry[] = [];
  action: string = "";
  public get viewAction(): string {
    if(this.action){
      let string: string = this.action.charAt(0).toUpperCase() + this.action.slice(1).toLowerCase();
      return string;
    }else{
      return "?";
    }
  }

  private _startDate: moment.Moment;
  get startDate(): string {
    return this._startDate.format('YYYY-MM-DD');
  }

  private controlSubscriptions: Subscription[] = [];

  ngOnInit() {

    console.log("Don't use this form any more.")
    // this.timelogEntrys = Object.assign([], this.timelogService.timelogEntrys);



    // if (this.action == "NEW") {

    //   console.log("Action is NEW")

    //   let startTime: moment.Moment = this.findNewStartTime();
    //   let endTime: moment.Moment = null
    //   // if (Math.abs(moment().diff(moment(startTime), "hours")) > 12) {
    //   //   console.log("start time was more than 12 hours ago or from now");
    //   // }

    //   if (moment().isAfter(moment(startTime))) {
    //     endTime = moment();
    //   } else {
    //     console.log("Problem: now is before the start time" + startTime.format('YYYY-MM-DD hh:mm a'));
    //   }

    //   if (moment(endTime).isBefore(moment(startTime).add(12, 'hours')) || moment(endTime).format('YYYY-MM-DD') == moment(startTime).format('YYYY-MM-DD')) {
    //     endTime = moment();
    //   } else {
    //     console.log("start and end were beyond 12 hours / 1 day of another.")
    //     endTime = moment(startTime).add(1, 'hour');
    //   }


    //   this.timelogEntryForm = new FormGroup({
    //     'startTime': new FormControl(moment(startTime).format('HH:mm'), Validators.required),
    //     'startTimeDate': new FormControl(moment(startTime).format('YYYY-MM-DD')),
    //     'endTime': new FormControl(moment(endTime).format('HH:mm'), Validators.required),
    //     'endTimeDate': new FormControl(moment(endTime).format('YYYY-MM-DD')),
    //     'description': new FormControl(),
    //   });




    // } else if (this.action == "REVIEW" || this.action == "SET") {

    //   this.timelogEntryForm = new FormGroup({
    //     'startTime': new FormControl(this._providedFormData.timelogEntry.startTime.format('HH:mm'), Validators.required),
    //     'startTimeDate': new FormControl(this._providedFormData.timelogEntry.startTime.format('YYYY-MM-DD')),
    //     'endTime': new FormControl(this._providedFormData.timelogEntry.endTime.format('HH:mm'), Validators.required),
    //     'endTimeDate': new FormControl(this._providedFormData.timelogEntry.endTime.format('YYYY-MM-DD')),
    //     'description': new FormControl(this._providedFormData.timelogEntry.description),
    //   });
    //   this.timelogEntryActivities = Object.assign([], this._providedFormData.timelogEntry.tleActivities);
    // }
    // this.validateTimes();



    // this.controlSubscriptions.push(
    //   this.timelogEntryForm.controls['startTime'].valueChanges.subscribe(() => {
    //     this.validateTimes();
    //   })
    // );
    // this.controlSubscriptions.push(
    //   this.timelogEntryForm.controls['startTimeDate'].valueChanges.subscribe(() => {
    //     this.validateTimes();
    //   })
    // );
    // this.controlSubscriptions.push(
    //   this.timelogEntryForm.controls['endTime'].valueChanges.subscribe(() => {
    //     this.validateTimes();
    //   })
    // );
    // this.controlSubscriptions.push(
    //   this.timelogEntryForm.controls['endTimeDate'].valueChanges.subscribe(() => {
    //     this.validateTimes();
    //   })
    // );

  }
  ngOnDestroy() {
    this.controlSubscriptions.forEach((sub) => { sub.unsubscribe(); });
    this._modalSubscription.unsubscribe();
  }

  private buildDate(formTime:string, formDate:string): moment.Moment{

    let hour: number = parseInt(formTime.substr(0,2));
    let minute: number = parseInt(formTime.substr(3,2));
    console.log("1st is start, 2nd is end: ", moment(formDate).hour(hour).minute(minute).format('hh:mm a'))
    return moment(formDate).hour(hour).minute(minute);
  }

  private validateTimes() {

    let start:moment.Moment = this.buildDate(this.timelogEntryForm.controls['startTime'].value, this.timelogEntryForm.controls['startTimeDate'].value);
    let end: moment.Moment = this.buildDate(this.timelogEntryForm.controls['endTime'].value, this.timelogEntryForm.controls['endTimeDate'].value);


    if (start.isAfter(end)) {
      this.startTimeError = true;
      this.endTimeError = true;
      this.durationString = "Start must be before end"
    } else {
      this.startTimeError = false;
      this.endTimeError = false;

      let duration: number = moment(end).diff(moment(start), "minutes");
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
    if (this.timelogEntrys.length > 0) {
      for (let timelogEntry of this.timelogEntrys) {
        if (latestTime == null) {
          latestTime = moment(timelogEntry.endTime);
        }
        if (moment(timelogEntry.endTime).isAfter(moment(latestTime))) {
          latestTime = moment(timelogEntry.endTime);
        }
      }
      return moment(latestTime);
    } else {
      console.log("there were no timelog entrys");
      return moment().subtract(1, "hour");
    }
  }




  get startTimeDate(): string {
    let value = moment(this.timelogEntryForm.controls['startTimeDate'].value).format('YYYY-MM-DD')
    return value;
  }
  get endTimeDate(): string {
    let startDate = moment(this.timelogEntryForm.controls['startTimeDate'].value).format('YYYY-MM-DD');
    let value = moment(this.timelogEntryForm.controls['endTimeDate'].value).format('YYYY-MM-DD')
    if (value == startDate) {
      return "Same Date"
    } else {
      return value;
    }
  }


  private _modalSubscription: Subscription = new Subscription();
  onClickDeleteTimeEvent(){
    this._modalSubscription.unsubscribe();
    let modalOptions: IModalOption[] = [
      {
        value: "Yes",
        dataObject: null
      },
      {
        value: "No",
        dataObject: null
      }
    ];     
    let modal: Modal = new Modal("Delete Time Event", "Confirm: Delete Time Event?", null, modalOptions, {}, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption)=>{
      if(selectedOption.value == "Yes"){

        this.timelogService.deleteTimelogEntry(this._providedFormData.timelogEntry);
        this.closeForm.emit(true);
      }else if(selectedOption.value == "No"){

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
      let itleActivity: ITLEActivity = {
        activityTreeId: this.selectedActivity.treeId,
        durationMinutes: 0,
      }
      console.log("Warning: this is the old method and isn't great. need to kill this component.", this.selectedActivity);
      this.timelogEntryActivities.push(new TimelogEntryActivityZZ(this.activitiesService, itleActivity));
      this.ifAddActivity = false;
    }else{

    }


  }
  onClickCancelActivity() {
    this.ifAddActivity = false;
  }

  onClickSaveTimelogEntry() {
    // let startTime:moment.Moment = this.buildDate(this.timelogEntryForm.controls['startTime'].value, this.timelogEntryForm.controls['startTimeDate'].value)
    // let endTime: moment.Moment = this.buildDate(this.timelogEntryForm.controls['endTime'].value, this.timelogEntryForm.controls['endTimeDate'].value)
    // let newTimelogEntry: TimelogEntry;

    // if (this.action == "NEW" || this.action == "SET") {
      
    //   newTimelogEntry = new TimelogEntry(null, null, startTime.toISOString(), endTime.toISOString(), this.timelogEntryForm.get('description').value, this.activitiesService);
    //   newTimelogEntry.activities = this.timelogEntryActivities;
    //   this.timelogService.saveTimelogEntry(newTimelogEntry);

    // } else if (this.action == "REVIEW" ) {

    //   let reviewTimelogEntry: TimelogEntry = this._providedFormData.timelogEntry;
    //   newTimelogEntry = new TimelogEntry(reviewTimelogEntry.id, reviewTimelogEntry.userId, startTime.toISOString(), endTime.toISOString(), this.timelogEntryForm.get('description').value);
    //   for (let activity of this.timelogEntryActivities) {
    //     newTimelogEntry.activities.push(activity)
    //   }
    //   this.timelogService.updateTimelogEntry(newTimelogEntry);

    // }
    // this.controlSubscriptions.forEach((sub) => { sub.unsubscribe(); });
    // this.timelogEntryForm.reset()
    // this.closeForm.emit();

  }

  onClickCancel() {
    this.closeForm.emit();
  }

}
