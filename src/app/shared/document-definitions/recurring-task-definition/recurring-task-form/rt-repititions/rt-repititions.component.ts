import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { RecurringTaskRepitition, RecurringTaskRepititionPeriod } from './recurring-task-repitition.interface';
import { faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rt-repititions',
  templateUrl: './rt-repititions.component.html',
  styleUrls: ['./rt-repititions.component.css']
})
export class RtRepititionsComponent implements OnInit {

  faPlusCircle = faPlusCircle;
  faTimes = faTimes;


  @Output() repititionsValueChanged: EventEmitter<RecurringTaskRepitition[]> = new EventEmitter();
  @Output() formIsValid: EventEmitter<boolean> = new EventEmitter();

  @Input() updateRepititions: RecurringTaskRepitition[];

  constructor() { }

  repititions: { repitition: RecurringTaskRepitition, form: FormGroup }[] = [];

  repititionForm: FormGroup;

  periods: {
    display: string,
    period: RecurringTaskRepititionPeriod
  }[] = [];

  private formChangeSubscriptions: Subscription[] = [];


  ngOnInit() {

    if(this.updateRepititions && this.updateRepititions.length>0){
      this.updateRepititions.forEach((updateRepitition)=>{
        this.repititions.push({
          repitition: {
            value: updateRepitition.value,
            period: updateRepitition.period,
            startDate: updateRepitition.startDate,
          },
          form: new FormGroup({
            "value": new FormControl(updateRepitition.value, Validators.required),
            "period": new FormControl(updateRepitition.period, Validators.required),
            "startDate": new FormControl(moment(updateRepitition.startDate).format("HH:mm"), Validators.required),
          }),
        })
      });
      this.subscribeToFormGroups();
      this.update();
    }else{
      let startDate: moment.Moment = moment().minute(0).second(0).millisecond(0);

      let group: FormGroup = new FormGroup({
        "value": new FormControl(1, Validators.required),
        "period": new FormControl(RecurringTaskRepititionPeriod.Days, Validators.required),
        "startDate": new FormControl(startDate.format("HH:mm"), Validators.required),
      });

      this.repititions = [
        {
          repitition: {
            value: 1,
            period: RecurringTaskRepititionPeriod.Days,
            startDate: startDate.toISOString()
          },
          form: group,
        },
  
      ]
    }

  
    this.periods = [
      { display: "Hours", period: RecurringTaskRepititionPeriod.Hours },
      { display: "Days", period: RecurringTaskRepititionPeriod.Days },
      { display: "Weeks", period: RecurringTaskRepititionPeriod.Weeks },
      { display: "Months", period: RecurringTaskRepititionPeriod.Months },
      { display: "Years", period: RecurringTaskRepititionPeriod.Years },
    ]

    
    this.subscribeToFormGroups();
    this.update();
  }

  private subscribeToFormGroups() {
    this.formChangeSubscriptions.forEach((subscription)=>{subscription.unsubscribe();})
    this.formChangeSubscriptions = [];
    this.repititions.forEach((repObject) => {
      this.formChangeSubscriptions.push(repObject.form.valueChanges.subscribe((formValue) => { this.update(); }));
    })
  }

  private update() {
    this.repititions.forEach((repObject)=>{
      let formStartValue: String = repObject.form.controls["startDate"].value;
      let hours:number = parseInt(formStartValue.substr(0,2));
      let minutes:number = parseInt(formStartValue.substr(3, 2));
      let startTime = moment().hour(hours).minute(minutes);
      repObject.repitition.period = repObject.form.controls["period"].value;
      repObject.repitition.startDate = startTime.toISOString();
      repObject.repitition.value = repObject.form.controls["value"].value;
    })
    this.repititionsValueChanged.emit(this.repititions.map((element) => { return element.repitition }));
  }

  onClickAddRepitition() {
    let startDate: moment.Moment = moment().minute(0).second(0).millisecond(0);
    this.repititions.push({
      repitition: {
        value: 1,
        period: RecurringTaskRepititionPeriod.Days,
        startDate: startDate.toISOString()
      },
      form: new FormGroup({
        "value": new FormControl(1, Validators.required),
        "period": new FormControl(RecurringTaskRepititionPeriod.Days, Validators.required),
        "startDate": new FormControl(startDate.format("HH:mm"), Validators.required),
      }),
    })
    
    this.subscribeToFormGroups();
    this.update();
  }

  onClickDeleteRepitition(repitition: { repitition: RecurringTaskRepitition, form: FormGroup }) {
    this.repititions.splice(this.repititions.indexOf(repitition), 1);    
    this.subscribeToFormGroups();
    this.update();
  }


}
