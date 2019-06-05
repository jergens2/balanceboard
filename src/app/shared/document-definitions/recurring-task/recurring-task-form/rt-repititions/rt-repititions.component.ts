import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RecurringTaskRepitition, RecurringTaskRepititionPeriod } from './recurring-task-repitition.interface';
import { faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

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

  
  constructor() { }

  repititions: RecurringTaskRepitition[] = [];

  repititionForm: FormGroup;

  periods: {
    display: string,
    period: RecurringTaskRepititionPeriod
  }[] = [];


  ngOnInit() {

    let startDate: moment.Moment = moment().minute(0).second(0).millisecond(0);

    this.repititions = [
      {
        value: 1,
        period: RecurringTaskRepititionPeriod.Days,
        startDate: startDate.toISOString()
      }
    ]
    this.repititionsValueChanged.emit(this.repititions);

    this.repititionForm = new FormGroup({
      "value": new FormControl(1, Validators.required),
      "period": new FormControl(RecurringTaskRepititionPeriod.Days, Validators.required),
      "startDate": new FormControl(startDate.format("HH:mm"), Validators.required),
    });

    this.periods = [
      {display: "Hours" , period:RecurringTaskRepititionPeriod.Hours },
      {display: "Days", period:RecurringTaskRepititionPeriod.Days },
      {display: "Weeks", period:RecurringTaskRepititionPeriod.Weeks },
      {display: "Months", period:RecurringTaskRepititionPeriod.Months },
      {display: "Years", period:RecurringTaskRepititionPeriod.Years },
    ]


  }

  onClickAddRepitition(){
    let startDate: moment.Moment = moment().minute(0).second(0).millisecond(0);
    this.repititions.push({
      value: 1,
      period: RecurringTaskRepititionPeriod.Days,
      startDate: startDate.toISOString()
    })    
  }

  onClickDeleteRepitition(repitition: RecurringTaskRepitition){
    this.repititions.splice(this.repititions.indexOf(repitition), 1);
  }


}
