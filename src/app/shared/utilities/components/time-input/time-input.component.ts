import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.css']
})

export class TimeInputComponent implements OnInit {

  constructor() { }

  private _timeValue: moment.Moment;
  @Input() public set timeValue(value: moment.Moment) {
    this._timeValue = moment(value);
    if (this.timeInputForm) {
      this._changeIsTextInput = false;
      this.timeInputForm.patchValue({ "timeValue": this._timeValue.format("HH:mm") });
    }
  }
  public get timeValue(): moment.Moment {
    return this._timeValue;
  }
  @Input() maxValue: moment.Moment;
  @Input() minValue: moment.Moment;
  @Input() buttons: boolean = true;

  @Output() timeChanged: EventEmitter<moment.Moment> = new EventEmitter();


  public timeInputForm: FormGroup;

  private _changeIsTextInput: boolean = true;

  ngOnInit() {
    this.timeInputForm = new FormGroup({
      timeValue: new FormControl(this._timeValue.format('HH:mm')),
    });
    this.timeInputForm.valueChanges.subscribe((valueChange) => {
      if (this.timeInputForm.controls['timeValue'].value && this._changeIsTextInput) {
        this.emitNewValue();
      }
      this._changeIsTextInput = true;
    });
  }
  
  private emitNewValue(){
    let formInputValue = this.parseFormTimeInput(this.timeInputForm.controls['timeValue'].value);
    this._timeValue = moment(this.timeValue).hour(formInputValue.hour).minute(formInputValue.minute).second(0).millisecond(0);
    this.timeChanged.emit(this.timeValue);
    this._changeIsTextInput = true;
  }


  public onClickChangeTime(action: "ADD" | "SUBTRACT", time: string) {
    this._changeIsTextInput = false;
    let newValue: moment.Moment;
    if (action == "ADD") {
      newValue = moment(this.timeValue).add(30, "minutes");
    } else if (action == "SUBTRACT") {
      newValue = moment(this.timeValue).subtract(30, "minutes");
    }

    if (this.maxValue) {
      if (newValue.isAfter(this.maxValue)) {
        newValue = moment(this.maxValue);
      }
    }
    if (this.minValue) {
      if (newValue.isBefore(this.minValue)) {
        newValue = moment(this.minValue);
      }
    }

    this.timeValue = moment(newValue);
    this.timeInputForm.patchValue({ "timeValue": this.timeValue.format("HH:mm") });
    this.emitNewValue();
  }



  public onClickTimeValueInput() {
    /**
     * To do:  implement a drop down function, so if you click on the time then you can select a dropdown of times.
     * would just add a bit more functionality to this component.
     */
    console.log("Ze clicker");
  }


  private parseFormTimeInput(formInput: string): { hour: number, minute: number } {
    if (formInput) {
      let hours: number = Number(formInput.substring(0, 2));
      let minutes: number = Number(formInput.substring(3, 5));
      return {
        hour: hours,
        minute: minutes,
      }
    } else {
      return null;
    }
  }


  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;


}
