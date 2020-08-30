import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdfaWakeupTimeComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-wakeup-time/sdfa-wakeup-time.component';
import { SdfaDreamsComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-dreams/sdfa-dreams.component';
import { SdfaBedtimeComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-bedtime/sdfa-bedtime.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../../shared/shared.module';
import { SleepDataFormComponent } from './sleep-data-prompt/sleep-data-form/sleep-data-form.component';
import { SdfaEnergyComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-energy/sdfa-energy.component';
import { SleepDataPromptComponent } from './sleep-data-prompt/sleep-data-prompt.component';
import { SmpFooterComponent } from './sleep-data-prompt/sleep-data-prompt-footer/smp-footer.component';
import { SdfaPrevFallAsleepTimeComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-prev-fall-asleep-time/sdfa-prev-fall-asleep-time.component';
import { SdfaSleepDurationComponent } from './sleep-data-prompt/sleep-data-form/z_sdfa-garbage/sdfa-sleep-duration/sdfa-sleep-duration.component';
import { SdfHourCountComponent } from './sleep-data-prompt/sleep-data-form/sdf-hour-count/sdf-hour-count.component';


@NgModule({
  declarations: [
    SleepDataPromptComponent,

    SdfaWakeupTimeComponent,
    SdfaDreamsComponent,
    SdfaBedtimeComponent,
    SdfaPrevFallAsleepTimeComponent,
    SdfaSleepDurationComponent,
    SdfaEnergyComponent,

    SleepDataFormComponent,
    SmpFooterComponent,
    SdfHourCountComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule,
  ],
  exports: [
    SleepDataPromptComponent,
  ]
})
export class SleepManagerModule { }
