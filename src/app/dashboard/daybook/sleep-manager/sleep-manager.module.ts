import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SleepManagerComponent } from './sleep-manager.component';
import { SmWakeupTimeComponent } from './sleep-manager-form/smfa-wakeup-time/sm-wakeup-time.component';
import { SmPrevFallAsleepTimeComponent } from './sleep-manager-form/smfa-prev-fall-asleep-time/sm-prev-fall-asleep-time.component';
import { SmSleepDurationComponent } from './sleep-manager-form/smfa-sleep-duration/sm-sleep-duration.component';
import { SmDreamsComponent } from './sleep-manager-form/smfa-dreams/sm-dreams.component';
import { SmBedtimeComponent } from './sleep-manager-form/smfa-bedtime/sm-bedtime.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../../shared/shared.module';
import { SleepManagerFormComponent } from './sleep-manager-form/sleep-manager-form.component';
import { SmfaEnergyComponent } from './sleep-manager-form/smfa-energy/smfa-energy.component';


@NgModule({
  declarations: [
    SleepManagerComponent,
    SmWakeupTimeComponent,
    SmPrevFallAsleepTimeComponent,
    SmSleepDurationComponent,
    SmDreamsComponent,
    SmBedtimeComponent,
    SleepManagerFormComponent,
    SmfaEnergyComponent,
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
