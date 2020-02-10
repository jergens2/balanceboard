import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';
import { DurationString } from '../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-sleep-profile-large',
  templateUrl: './sleep-profile-large.component.html',
  styleUrls: ['./sleep-profile-large.component.css']
})
export class SleepProfileLargeComponent implements OnInit {

  constructor(private daybookService: DaybookControllerService) { }

  public get wakeupTime(): moment.Moment { 
    return this.daybookService.activeDayController.wakeupTime; 
  }
  public get wakeupTimeIsSet(): boolean { 
    return this.daybookService.activeDayController.wakeupTimeIsSet;
  }
  public get fallAsleepTime(): moment.Moment { 
    return this.daybookService.activeDayController.fallAsleepTime;
  }
  public get prevDayFallAsleepTime(): moment.Moment{ 
    return this.daybookService.activeDayController.prevDayFallAsleepTime;
  }
  public get currentEnergy(): number { 
    return (this.daybookService.getCurrentEnergy() * 100);
  }

  public get awakeForString(): string {
    let now = this.daybookService.clock;
    if(now.isBefore(this.wakeupTime)){
      return "Just woke up";
    }else{
      return DurationString.calculateDurationString(this.wakeupTime, now);
    }
  }

  public get timeUntilFallAsleepString(): string { 
    let now = this.daybookService.clock;
    if(now.isBefore(this.fallAsleepTime)){
      return DurationString.calculateDurationString(now, this.fallAsleepTime);
    }else{
      "It's time to go to sleep."
    }
  }
  
  ngOnInit() {
    
  }



}
