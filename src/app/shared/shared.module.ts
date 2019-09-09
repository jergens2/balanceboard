import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";


import { YearViewComponent } from './time-views/year-view/year-view.component';
import { SixWeekViewComponent } from './time-views/six-week-view/six-week-view.component';
import { TimeViewsComponent } from './time-views/time-views.component';
import { MultiYearViewComponent } from './time-views/multi-year-view/multi-year-view.component';
import { WeekViewComponent } from './time-views/week-view/week-view.component';
import { SingleDayViewComponent } from './time-views/single-day-view/single-day-view.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { CustomRangeTimeViewComponent } from './time-views/custom-range-time-view/custom-range-time-view.component';
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DirectoryInputComponent } from './directory/directory-input/directory-input.component';
import { ActivityInputDropdownComponent } from "./activity-input-dropdown/activity-input-dropdown.component";

import { RecurringTaskFormComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/recurring-task-form.component";
import { RtRepititionsComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/rt-repititions/rt-repititions.component";
import { ActivityCategoryDefinitionFormComponent } from "../dashboard/activities/activity-category-definition-form/activity-category-definition-form.component";
import { BrowseActivityComponent } from './activity-input-dropdown/browse-activity/browse-activity.component';
import { DataEntryItemInputComponent } from './data-entry-item-input/data-entry-item-input.component';
import { TimelogEntryInputComponent } from './data-entry-item-input/data-entry-input-components/timelog-entry-input/timelog-entry-input.component';
import { FinancialEntryInputComponent } from './data-entry-item-input/data-entry-input-components/financial-entry-input/financial-entry-input.component';
import { ActionItemEntryInputComponent } from './data-entry-item-input/data-entry-input-components/action-item-entry-input/action-item-entry-input.component';
import { ReminderEntryInputComponent } from './data-entry-item-input/data-entry-input-components/reminder-entry-input/reminder-entry-input.component';
import { ScheduledEventInputComponent } from './data-entry-item-input/data-entry-input-components/scheduled-event-input/scheduled-event-input.component';
import { DietaryEntryInputComponent } from './data-entry-item-input/data-entry-input-components/dietary-entry-input/dietary-entry-input.component';
import { FeelingEntryInputComponent } from './data-entry-item-input/data-entry-input-components/feeling-entry-input/feeling-entry-input.component';
import { WeightlogEntryInputComponent } from './data-entry-item-input/data-entry-input-components/weightlog-entry-input/weightlog-entry-input.component';
import { CountEntryInputComponent } from './data-entry-item-input/data-entry-input-components/count-entry-input/count-entry-input.component';
import { RuleConditionEntryInputComponent } from './data-entry-item-input/data-entry-input-components/rule-condition-entry-input/rule-condition-entry-input.component';
import { HealthSymptomEntryInputComponent } from './data-entry-item-input/data-entry-input-components/health-symptom-entry-input/health-symptom-entry-input.component';



@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        BrowserAnimationsModule,
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

        
        
        DirectoryInputComponent,
        ActivityInputDropdownComponent,
        RecurringTaskFormComponent,
        ActivityCategoryDefinitionFormComponent,
        RtRepititionsComponent,

        BrowseActivityComponent,

        DataEntryItemInputComponent,

        TimelogEntryInputComponent,

        FinancialEntryInputComponent,

        ActionItemEntryInputComponent,

        ReminderEntryInputComponent,

        ScheduledEventInputComponent,

        DietaryEntryInputComponent,

        FeelingEntryInputComponent,

        WeightlogEntryInputComponent,

        CountEntryInputComponent,

        RuleConditionEntryInputComponent,

        HealthSymptomEntryInputComponent,


        
    ],
    exports: [
        CommonModule,
        TimeViewsComponent,
        YearViewComponent,
        ColorPickerComponent,
        


        RecurringTaskFormComponent,
        ActivityInputDropdownComponent,
        DataEntryItemInputComponent,
    ]
})

export class SharedModule {}