import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../../shared/shared.module';
import { SleepDataFormComponent } from './sleep-data-prompt/sleep-data-form/sleep-data-form.component';
import { SleepDataPromptComponent } from './sleep-data-prompt/sleep-data-prompt.component';
import { SmpFooterComponent } from './sleep-data-prompt/sleep-data-prompt-footer/smp-footer.component';
import { SdfHourCountComponent } from './sleep-data-prompt/sleep-data-form/sdf-hour-count/sdf-hour-count.component';


@NgModule({
  declarations: [
    SleepDataPromptComponent,
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
