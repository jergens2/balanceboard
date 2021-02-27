import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesComponent } from './activities.component';
import { RoutineComponent } from './routines/routine/routine.component';
import { ActivityDisplayItemComponent } from './activity-display-item/activity-display-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { ActivityCategoryDefinitionFormComponent } from './activity-category-definition-form/activity-category-definition-form.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ActivityDeleteOptionsComponent } from './activity-display-item/adi-parts/activity-delete-options/activity-delete-options.component';
import { AdoMergeWithComponent } from './activity-display-item/adi-parts/activity-delete-options/ado-merge-with/ado-merge-with.component';
import { AdoMoveToTrashComponent } from './activity-display-item/adi-parts/activity-delete-options/ado-move-to-trash/ado-move-to-trash.component';
import { AdoPermanentlyDeleteComponent } from './activity-display-item/adi-parts/activity-delete-options/ado-permanently-delete/ado-permanently-delete.component';
import { AdoMergeWithParentComponent } from './activity-display-item/adi-parts/activity-delete-options/ado-merge-with-parent/ado-merge-with-parent.component';
import { ActivityScheduleConfigurationComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-schedule-configuration.component';
import { ActivityRepititionDisplayComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/activity-repitition-display.component';
import { RepititionOccurrenceFormComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/repitition-occurrence-form/repitition-occurrence-form.component';
import { RepititionOccurrenceComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/repitition-occurrence.component';
import { ActivityScheduleDisplayComponent } from './activity-display-item/adi-parts/activity-schedule-display/activity-schedule-display.component';
import { DayOccurrenceComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/day-occurrence/day-occurrence.component';
import { WeekOccurrenceComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/week-occurrence/week-occurrence.component';
import { MonthOccurrenceComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/month-occurrence/month-occurrence.component';
import { YearOccurrenceComponent } from './activity-display-item/adi-parts/activity-schedule-configuration/activity-repitition-display/repitition-occurrence/year-occurrence/year-occurrence.component';
import { AdiSummaryComponent } from './activity-display-item/adi-parts/adi-summary/adi-summary.component';
import { AdiCumulativeHoursComponent } from './activity-display-item/adi-parts/adi-summary/adi-cumulative-hours/adi-cumulative-hours.component';
import { ActivityBrowseResultsComponent } from './activity-browse/activity-browse-results/activity-browse-results.component';
import { ActivityBrowseComponent } from './activity-browse/activity-browse.component';
import { AdiRelationshipsComponent } from './activity-display-item/adi-parts/adi-relationships/adi-relationships.component';
import { ActivitiesViewTabsComponent } from './activities-view-tabs/activities-view-tabs.component';
import { ActivitiesSummaryComponent } from './activities-summary/activities-summary.component';
import { ActivitiesQueryComponent } from './activities-query/activities-query.component';
import { ActivitiesSummaryTreemapComponent } from './activities-summary/activities-summary-treemap/activities-summary-treemap.component';
import { AstRecursiveItemComponent } from './activities-summary/activities-summary-treemap/ast-recursive-item/ast-recursive-item.component';


@NgModule({
  declarations: [
    ActivitiesComponent,
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
    ActivityDeleteOptionsComponent,
    AdoMergeWithComponent,
    AdoMoveToTrashComponent,
    AdoPermanentlyDeleteComponent,
    AdoMergeWithParentComponent,
    AdiSummaryComponent,
    AdiCumulativeHoursComponent,
    ActivityBrowseComponent,
    ActivityBrowseResultsComponent,
    AdiRelationshipsComponent,
    ActivitiesViewTabsComponent,
    ActivitiesSummaryComponent,
    ActivitiesQueryComponent,
    ActivitiesSummaryTreemapComponent,
    AstRecursiveItemComponent,
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
