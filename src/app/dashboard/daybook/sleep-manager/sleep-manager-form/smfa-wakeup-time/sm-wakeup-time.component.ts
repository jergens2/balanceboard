import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';
import { SleepManagerService } from '../../sleep-manager.service';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { timer } from 'rxjs';

@Component({
  selector: 'app-sm-wakeup-time',
  templateUrl: './sm-wakeup-time.component.html',
  styleUrls: ['./sm-wakeup-time.component.css']
})
export class SmWakeupTimeComponent implements OnInit {

  constructor(private sleepService: SleepManagerService) { }

  public faCheckCircle = faCheckCircle;
  private _saveClicked = false;
  private _durationAgo: string = "";
  private _date: string;

  private _sectionIsComplete: boolean = false;

  public get date(): string { return this._date; }
  // public get sectionIsComplete(): boolean { return this.sleepService.previousWakeTimeIsSet; }

  ngOnInit() {
    this.maxWakeupTime = moment();
    // this._sectionIsComplete = this.sleepService.previousWakeTimeIsSet;
    
    if(this.sleepService.sleepManagerForm.formInputWakeupTime){
      this._time = moment(this.sleepService.sleepManagerForm.formInputWakeupTime)
    }else{
      this._time = moment(this.sleepService.sleepManager.previousWakeupTime);
    }
    timer(0, 60000).subscribe((tick)=>{
      this._date = moment(this._time).format('dddd, MMM Do')
      this._calculateDurationString();
    });

    console.log("big chunky warning")
    // if(lastActivityTime){
    //   this.minWakeupTime = moment(lastActivityTime);
    // }else{
      this.minWakeupTime = moment().subtract(23, 'hours');
    // }

    

    // console.log("Min and max val:  " + this.minWakeupTime.format('YYYY-MM-DD hh:mm a') + " to  " + this.maxWakeupTime.format('YYYY-MM-DD hh:mm a'))

    
    this.onTimeChanged(this._time);
  }


  private _time: moment.Moment;
  public get time(): moment.Moment { return this._time; };

  public minWakeupTime: moment.Moment;
  public maxWakeupTime: moment.Moment;

  public get durationAgo(): string {
    return this._durationAgo;
  }

  onTimeChanged(time: moment.Moment) {
    this._time = moment(time);
    this._calculateDurationString();
    this.sleepService.sleepManagerForm.setformInputWakeupTime(moment(time));
  }

  public get isToday(): boolean { return true; }


  private _calculateDurationString() {
    let durationString: string = "";

    if (moment().isAfter(this.time)) {

      const minutes = moment().diff(this.time, 'minutes');
      if (minutes <= 2) {
        durationString = 'Just recently';
      } else if (minutes <= 5) { 
        durationString = 'A few minutes ago';
      }else {
        durationString = DurationString.calculateDurationString(this.time, moment()) + " ago";
      }
    } else {
      console.log('error with clock time / wakeup time')
    }


    this._durationAgo = durationString;


  }




}
