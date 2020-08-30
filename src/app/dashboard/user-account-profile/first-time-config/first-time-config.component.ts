import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { UserAccountProfileService } from '../user-account-profile.service';
import { UAPAppConfiguration } from '../api/uap-app-configuraiton.interface';
import { SleepService } from '../../daybook/sleep-manager/sleep.service';
import { TimeInput } from '../../../shared/components/time-input/time-input.class';

@Component({
  selector: 'app-first-time-config',
  templateUrl: './first-time-config.component.html',
  styleUrls: ['./first-time-config.component.css']
})
export class FirstTimeConfigComponent implements OnInit {

  constructor(private userProfileService: UserAccountProfileService, private sleepService: SleepService) { }

  public faCheck = faCheck;

  private _wakeupTime: moment.Moment;
  private _fallAsleepTime: moment.Moment;
  private _wakeupTimeInput: TimeInput;
  private _fallAsleepTimeInput: TimeInput;

  public get wakeupTime(): moment.Moment { return this._wakeupTime; }
  public get fallAsleepTime(): moment.Moment { return this._fallAsleepTime; }
  public get wakeupTimeInput(): TimeInput { return this._wakeupTimeInput; }
  public get fallAsleepTimeInput(): TimeInput { return this._fallAsleepTimeInput; }

  @Output() public complete: EventEmitter<boolean> = new EventEmitter();


  ngOnInit(): void {
    this._wakeupTime = moment().startOf('day').hour(7).minute(30);
    this._fallAsleepTime = moment().startOf('day').hour(22).minute(30);
    this._wakeupTimeInput = new TimeInput(this._wakeupTime);
    this._wakeupTimeInput.configure(true, false, false, 5);
    this._wakeupTimeInput.timeValue$.subscribe(t => this._wakeupTime = moment(t));
    this._fallAsleepTimeInput = new TimeInput(this._fallAsleepTime, null, null);
    this._fallAsleepTimeInput.configure(true, false, false, 5);
    this._fallAsleepTimeInput.timeValue$.subscribe(t => this._fallAsleepTime = moment(t));
  }

  public onFallAsleepTimeChanged(time: moment.Moment) {
    this._fallAsleepTime = moment(time);
  }
  public onWakeupTimeChanged(time: moment.Moment) {
    this._wakeupTime = moment(time);
  }

  public onClickContinue() {

    const now = moment();
    let wakeupHour = this.wakeupTime.hour();
    if (this.wakeupTime.isBefore(now.startOf('day'))) {
      wakeupHour = 0 - (24 - wakeupHour);
    }
    let fallAsleepHour = this.fallAsleepTime.hour()
    if (this.fallAsleepTime.isAfter(now.endOf('day'))) {
      fallAsleepHour = fallAsleepHour + 24;
    }

    const config: UAPAppConfiguration = {
      defaultWakeupHour: wakeupHour,
      defaultWakeupMinute: this.wakeupTime.minute(),
      defaultFallAsleepHour: fallAsleepHour,
      defaultFallAsleepMinute: this.fallAsleepTime.minute(),
    }
    this.userProfileService.saveAppConfigChanges$(config).subscribe((isComplete) => {
      console.log("IT IS COMPLETE>")
      console.log(this.userProfileService.userProfile)
      this.complete.next(true);
    });
  }

}
