import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlefNewCurrentComponent } from './tlef-cases/tlef-new-current/tlef-new-current.component';
import { TlefNewPreviousComponent } from './tlef-cases/tlef-new-previous/tlef-new-previous.component';
import { TlefNewFutureComponent } from './tlef-cases/tlef-new-future/tlef-new-future.component';
import { TlefExistingFutureComponent } from './tlef-cases/tlef-existing-future/tlef-existing-future.component';
import { TlefExistingPreviousComponent } from './tlef-cases/tlef-existing-previous/tlef-existing-previous.component';
import { SleepInputFormComponent } from './sleep-entry-form/sleep-entry-form.component';
import { TlefNewOrModifyComponent } from './tlef-parts/tlef-new-or-modify/tlef-new-or-modify.component';
import { TlefViewOnlyComponent } from './tlef-parts/tlef-view-only/tlef-view-only.component';
import { TlefFallAsleepTimeComponent } from './tlef-parts/tlef-fall-asleep-time/tlef-fall-asleep-time.component';
import { TimelogEntryFormComponent } from './timelog-entry-form.component';
import { TlefWakeupTimeComponent } from './tlef-parts/tlef-wakeup-time/tlef-wakeup-time.component';
import { TlefModifyTimesComponent } from './tlef-parts/tlef-modify-times/tlef-modify-times.component';
import { TlefModifyActivitiesComponent } from './tlef-parts/tlef-modify-activities/tlef-modify-activities.component';
import { TlefFooterComponent } from './tlef-parts/tlef-footer/tlef-footer.component';
import { TlefNewCurrentFutureComponent } from './tlef-cases/tlef-new-current-future/tlef-new-current-future.component';
import { TlefExistingCurrentComponent } from './tlef-cases/tlef-existing-current/tlef-existing-current.component';
import { ActivitySliderBarComponent } from './tlef-parts/tlef-modify-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TLEFGridItemsBarComponent } from './tlef-parts/tlef-grid-items-bar/tlef-grid-items-bar.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { TlefTimesComponent } from './tlef-parts/tlef-times/tlef-times.component';
import { ColorPickerModule } from 'ngx-color-picker';



@NgModule({
  declarations: [
    ActivitySliderBarComponent,
    TlefNewCurrentComponent,
    TlefNewPreviousComponent,
    TlefNewFutureComponent,
    TlefExistingFutureComponent,
    TlefExistingPreviousComponent,
    TlefNewOrModifyComponent,
    SleepInputFormComponent,
    TlefViewOnlyComponent,
    TlefFallAsleepTimeComponent,
    TimelogEntryFormComponent,
    TlefWakeupTimeComponent,
    TlefModifyTimesComponent,
    TlefModifyActivitiesComponent,
    TlefFooterComponent,
    TlefNewCurrentFutureComponent,
    TlefExistingCurrentComponent,
    TLEFGridItemsBarComponent,
    TlefTimesComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedModule,
    ColorPickerModule,
  ],
  exports: [
    // DaybookEntryFormComponent,
    TimelogEntryFormComponent,
    SleepInputFormComponent,
    TlefModifyActivitiesComponent,
    TlefWakeupTimeComponent,
    // ActivitySliderBarComponent,
  ]
})
export class TLEFModule { }
