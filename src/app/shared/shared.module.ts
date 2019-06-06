import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { YearViewComponent } from './time-views/year-view/year-view.component';
import { SixWeekViewComponent } from './time-views/six-week-view/six-week-view.component';
import { TimeViewsComponent } from './time-views/time-views.component';
import { MultiYearViewComponent } from './time-views/multi-year-view/multi-year-view.component';
import { WeekViewComponent } from './time-views/week-view/week-view.component';
import { SingleDayViewComponent } from './time-views/single-day-view/single-day-view.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { CustomRangeTimeViewComponent } from './time-views/custom-range-time-view/custom-range-time-view.component';
import { ToolsComponent } from './tools/tools.component';
import { ActionItemFormComponent } from './document-definitions/action-item-form/action-item-form.component';
import { NotebookEntryFormComponent } from "./document-definitions/notebook-entry-form/notebook-entry-form.component";
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TimelogEntryFormComponent } from './document-definitions/timelog-entry-form/timelog-entry-form.component';
import { FutureEventFormComponent } from './document-definitions/future-event-form/future-event-form.component';
import { DirectoryInputComponent } from './directory/directory-input/directory-input.component';
import { ActivityInputDropdownComponent } from "./activity-input-dropdown/activity-input-dropdown.component";
import { TlefChartComponent } from "./document-definitions/timelog-entry-form/tlef-chart/tlef-chart.component";
import { ActivitySliderBarComponent } from './document-definitions/timelog-entry-form/tlef-activities/tlef-activity-slider-bar/activity-slider-bar.component';
import { TlefActivitiesComponent } from './document-definitions/timelog-entry-form/tlef-activities/tlef-activities.component';
import { RecurringTaskFormComponent } from "./document-definitions/recurring-task/recurring-task-form/recurring-task-form.component";
import { ActivityCategoryDefinitionFormComponent } from "./document-definitions/activity-category-definition-form/activity-category-definition-form.component";
import { RtRepititionsComponent } from "./document-definitions/recurring-task/recurring-task-form/rt-repititions/rt-repititions.component";
import { DtlToolComponent } from './tools/tool-components/dtl-tool/dtl-tool.component';



@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FontAwesomeModule
    ],
    declarations: [
        YearViewComponent,
        SixWeekViewComponent,
        TimeViewsComponent,
        MultiYearViewComponent,
        WeekViewComponent,
        SingleDayViewComponent,
        ColorPickerComponent,
        CustomRangeTimeViewComponent,
        NotebookEntryFormComponent,
        ToolsComponent,
        ActionItemFormComponent,
        TimelogEntryFormComponent,
        FutureEventFormComponent,
        DirectoryInputComponent,
        ActivityInputDropdownComponent,
        TlefChartComponent,
        ActivitySliderBarComponent,
        TlefActivitiesComponent,
        RecurringTaskFormComponent,
        ActivityCategoryDefinitionFormComponent,
        RtRepititionsComponent,
        DtlToolComponent,
    ],
    exports: [
        CommonModule,
        TimeViewsComponent,
        YearViewComponent,
        ColorPickerComponent,
        ToolsComponent,
        ActionItemFormComponent,
        NotebookEntryFormComponent,
        ActivityInputDropdownComponent,
        TimelogEntryFormComponent,
        RecurringTaskFormComponent,
        
    ]
})

export class SharedModule {}