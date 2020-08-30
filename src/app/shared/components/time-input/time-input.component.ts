import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';
import { TimeInput } from './time-input.class';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.css']
})

export class TimeInputComponent implements OnInit {

  public readonly faPlusCircle = faPlusCircle;
  public readonly faMinusCircle = faMinusCircle;

  constructor() { }

  private _timeInput: TimeInput;
  private _timeInputForm: FormGroup;

  @Input() public set timeInput(timeInput: TimeInput) {
    this._timeInput = timeInput;
  }

  public get maxValue(): moment.Moment { return this._timeInput.maxValue; }
  public get minValue(): moment.Moment { return this._timeInput.minValue; }
  public get showButtons(): boolean { return this._timeInput.showButtons; }
  public get showDate(): boolean { return this._timeInput.showDate; }
  public get hideBorders(): boolean { return this._timeInput.hideBorders; }
  public get isBold(): boolean { return this._timeInput.isBold; }
  public get incrementMinutes(): number { return this._timeInput.incrementMinutes; }
  public get timeInputForm(): FormGroup { return this._timeInputForm; }
  public get color(): string { return this._timeInput.color; }

  public get date(): string { return this.timeValue.format('dddd, MMM Do'); }
  public get timeValue(): moment.Moment { return this._timeInput.timeValue; }

  ngOnInit() {
    this._timeInputForm = new FormGroup({
      timeValue: new FormControl(this.timeValue.format('HH:mm')),
    });
  }

  public onClickChangeTime(action: 'ADD' | 'SUBTRACT') {
    let newValue: moment.Moment;
    if (action === 'ADD') {
      newValue = moment(this.timeValue).add(this.incrementMinutes, 'minutes');
    } else if (action === 'SUBTRACT') {
      newValue = moment(this.timeValue).subtract(this.incrementMinutes, 'minutes');
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
    this._timeInput.changeTime(moment(newValue));
    this.timeInputForm.patchValue({ 'timeValue': newValue.format('HH:mm') });
  }



  public onChangeTimeValueInput() {
    const formInputValue = this.parseFormTimeInput(this.timeInputForm.controls['timeValue'].value);
    let newValue: moment.Moment = moment(this.timeValue).hour(formInputValue.hour).minute(formInputValue.minute).second(0).millisecond(0);

    if (newValue.isAfter(this.maxValue)) {
      newValue = moment(this.maxValue);
    }

    if (newValue.isBefore(this.minValue)) {
      newValue = moment(this.minValue);
    }
    this._timeInput.changeTime(newValue);
    this.timeInputForm.patchValue({ 'timeValue': newValue.format('HH:mm') });
  }


  private parseFormTimeInput(formInput: string): { hour: number, minute: number } {
    if (formInput) {
      const hours: number = Number(formInput.substring(0, 2));
      const minutes: number = Number(formInput.substring(3, 5));
      return {
        hour: hours,
        minute: minutes,
      };
    } else {
      return {
        hour: 0,
        minute: 0,
      };
    }
  }




}
