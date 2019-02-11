import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TimeSegment } from '../../timelog/time-segment.model';


@Component({
  selector: 'app-time-segment-form',
  templateUrl: './time-segment-form.component.html',
  styleUrls: ['./time-segment-form.component.css']
})
export class TimeSegmentFormComponent implements OnInit {

  constructor() { }

  previousTimeSegmentEnd: moment.Moment;

  @Input() action: string = "New";

  @Input() set lastEndTime(lastTime: string) {
    this.previousTimeSegmentEnd = moment(lastTime);
  }
  @Input() newTimeSegment: TimeSegment = null;
  @Input() reviewTimeSegment: TimeSegment;

  @Output() cancel: EventEmitter<boolean> = new EventEmitter();

  timeSegmentForm: FormGroup = null;


  ngOnInit() {

    console.log("action is ", this.action)

    if(this.action == "New"){
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(moment(this.newTimeSegment.startTime).format('HH:mm'), Validators.required),
        // 'startTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.startTime).format('YYYY-MM-DD'), Validators.required),
        'endTime': new FormControl(moment(this.newTimeSegment.endTime).format('HH:mm'), Validators.required),
        // 'endTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.endTime).format('YYYY-MM-DD'), Validators.required),
    
        'description': new FormControl("this is a new time segment from el clickeroony",),
      });
    }else if(this.action == "Review"){
      console.log("action is review:", this.reviewTimeSegment);
      
      console.log("setting the start time to ", this.reviewTimeSegment.startTime)
      console.log("setting the endTime to ", this.reviewTimeSegment.endTime)
      this.timeSegmentForm = new FormGroup({
        'startTime': new FormControl(this.reviewTimeSegment.startTime.format('HH:mm'), Validators.required),
        // 'startTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.startTime).format('YYYY-MM-DD'), Validators.required),
        'endTime': new FormControl(this.reviewTimeSegment.endTime.format('HH:mm'), Validators.required),
        // 'endTimeDate': new FormControl(moment(this.updateTimeSegment.timeSegment.endTime).format('YYYY-MM-DD'), Validators.required),
    
        'description': new FormControl(this.reviewTimeSegment.description),
      });
    }else{
      console.log("bad action");
    }

    
  }


  get duration(): string{
    let startTimeValue: string = this.timeSegmentForm.controls['startTime'].value;
    let startHour = parseInt(startTimeValue.substr(0,2));
    let startMinute = parseInt(startTimeValue.substr(3,2));
    let startTime: moment.Moment = moment().hour(startHour).minute(startMinute);

    
    let endTimeValue: string = this.timeSegmentForm.controls['endTime'].value;
    let endHour = parseInt(endTimeValue.substr(0,2));
    let endMinute = parseInt(endTimeValue.substr(3,2));
    let endTime: moment.Moment = moment().hour(endHour).minute(endMinute);

    let duration = moment(endTime).diff(moment(startTime), "minutes");
    return ""+ duration + " minutes";
  }

  onClickCancel(){
    this.cancel.emit();
  }

}
