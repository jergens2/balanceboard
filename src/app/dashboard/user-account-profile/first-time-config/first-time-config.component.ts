import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { UserAccountProfileService } from '../user-account-profile.service';
import { UAPAppConfiguration } from '../api/uap-app-configuraiton.interface';

@Component({
  selector: 'app-first-time-config',
  templateUrl: './first-time-config.component.html',
  styleUrls: ['./first-time-config.component.css']
})
export class FirstTimeConfigComponent implements OnInit {

  constructor(private userProfileService: UserAccountProfileService) { }

  public faCheck = faCheck;

  private _wakeupTime: moment.Moment;
  private _fallAsleepTime: moment.Moment;

  public get wakeupTime(): moment.Moment { return moment(this._wakeupTime); }
  public get fallAsleepTime(): moment.Moment { return moment(this._fallAsleepTime); }

  @Output() public complete: EventEmitter<boolean> = new EventEmitter();


  ngOnInit(): void {
    this._wakeupTime = moment().startOf('day').hour(7).minute(30);
    this._fallAsleepTime = moment().startOf('day').hour(22).minute(30);
  }

  public onFallAsleepTimeChanged(time: moment.Moment){
    this._fallAsleepTime = moment(time);
  }
  public onWakeupTimeChanged(time: moment.Moment){
    this._wakeupTime = moment(time);
  }

  public onClickContinue(){

    const now = moment();
    let wakeupHour = this.wakeupTime.hour();
    if(this.wakeupTime.isBefore(now.startOf('day'))){
      wakeupHour = 0 - (24-wakeupHour);
    }
    let fallAsleepHour = this.fallAsleepTime.hour()
    if(this.fallAsleepTime.isAfter(now.endOf('day'))){
      fallAsleepHour = fallAsleepHour + 24;
    }

    const config: UAPAppConfiguration = {
      defaultWakeupHour: wakeupHour,
      defaultWakeupMinute: this.wakeupTime.minute(),
      defaultFallAsleepHour: fallAsleepHour,
      defaultFallAsleepMinute: this.fallAsleepTime.minute(),
    }
    this.userProfileService.setAppConfig$(config).subscribe((isComplete)=>{
      console.log("NEEEEEEEEEEXT")
      this.complete.next(true);
    });
  }

}
