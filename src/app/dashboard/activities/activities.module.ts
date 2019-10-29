import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesComponent } from './activities.component';

import { ActivityListItemComponent } from './activity-list-item/activity-list-item.component';
import { RoutineComponent } from './routines/routine/routine.component';

import { ActivityDisplayItemComponent } from './activity-display-item/activity-display-item.component';

import { ActivityScheduleDisplayComponent } from './activity-display-item/activity-schedule-display/activity-schedule-display.component';
import { ActivityScheduleConfigurationComponent } from './activity-display-item/activity-schedule-configuration/activity-schedule-configuration.component';
import { ActivityRepititionDisplayComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/activity-repitition-display.component';
import { RepititionOccurrenceFormComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/repitition-occurrence-form/repitition-occurrence-form.component';
import { RepititionOccurrenceComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/repitition-occurrence.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { ActivityCategoryDefinitionFormComponent } from './activity-category-definition-form/activity-category-definition-form.component';
import { DayOccurrenceComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/day-occurrence/day-occurrence.component';
import { WeekOccurrenceComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/week-occurrence/week-occurrence.component';
import { MonthOccurrenceComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/month-occurrence/month-occurrence.component';
import { YearOccurrenceComponent } from './activity-display-item/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/year-occurrence/year-occurrence.component';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [
    ActivitiesComponent,


    ActivityListItemComponent,
    RoutineComponent,

    ActivityDisplayItemComponent,
    ActivityScheduleConfigurationComponent,
    ActivityRepititionDisplayComponent,
    RepititionOccurrenceFormComponent,
    RepititionOccurrenceComponent,
    ActivityScheduleDisplayComponent,
    ActivityCategoryDefinitionFormComponent,
    DayOccurrenceComponent,
    WeekOccurrenceComponent,
    MonthOccurrenceComponent,
    YearOccurrenceComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SharedModule,
    ColorPickerModule
  ],
  exports: [
    ActivityCategoryDefinitionFormComponent
  ]
})
export class ActivitiesModule { }
