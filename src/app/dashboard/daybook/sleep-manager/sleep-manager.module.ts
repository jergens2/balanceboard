import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SleepManagerComponent } from './sleep-manager.component';
import { SmWakeupTimeComponent } from './sm-wakeup-time/sm-wakeup-time.component';
import { SmPrevFallAsleepTimeComponent } from './sm-prev-fall-asleep-time/sm-prev-fall-asleep-time.component';
import { SmSleepDurationComponent } from './sm-sleep-duration/sm-sleep-duration.component';
import { SmEnergyAtWakeupComponent } from './sm-energy-at-wakeup/sm-energy-at-wakeup.component';
import { SmEnergyAtPresentComponent } from './sm-energy-at-present/sm-energy-at-present.component';
import { SmDreamsComponent } from './sm-dreams/sm-dreams.component';
import { SmBedtimeComponent } from './sm-bedtime/sm-bedtime.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    SleepManagerComponent,
    SmWakeupTimeComponent,
    SmPrevFallAsleepTimeComponent,
    SmSleepDurationComponent,
    SmEnergyAtWakeupComponent,
    SmEnergyAtPresentComponent,
    SmDreamsComponent,
    SmBedtimeComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule,
  ],
  exports: [
    SleepManagerComponent,
  ]
})
export class SleepManagerModule { }
