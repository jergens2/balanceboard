import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";


import { ColorPickerComponent } from './color-picker/color-picker.component';
import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DirectoryInputComponent } from './directory/directory-input/directory-input.component';
import { ActivityInputDropdownComponent } from "./activity-input-dropdown/activity-input-dropdown.component";

import { RecurringTaskFormComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/recurring-task-form.component";
import { RtRepititionsComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/rt-repititions/rt-repititions.component";
import { BrowseActivityComponent } from './activity-input-dropdown/browse-activity/browse-activity.component';
import { DataEntryItemInputComponent } from './z_data-entry-item-input/data-entry-item-input.component';
import { TimelogEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/timelog-entry-input/timelog-entry-input.component';
import { FinancialEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/financial-entry-input/financial-entry-input.component';
import { ActionItemEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/action-item-entry-input/action-item-entry-input.component';
import { ReminderEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/reminder-entry-input/reminder-entry-input.component';
import { ScheduledEventInputComponent } from './z_data-entry-item-input/data-entry-input-components/scheduled-event-input/scheduled-event-input.component';
import { DietaryEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/dietary-entry-input/dietary-entry-input.component';
import { FeelingEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/feeling-entry-input/feeling-entry-input.component';
import { WeightlogEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/weightlog-entry-input/weightlog-entry-input.component';
import { CountEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/count-entry-input/count-entry-input.component';
import { RuleConditionEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/rule-condition-entry-input/rule-condition-entry-input.component';
import { HealthSymptomEntryInputComponent } from './z_data-entry-item-input/data-entry-input-components/health-symptom-entry-input/health-symptom-entry-input.component';

import { ColorPickerModule } from "ngx-color-picker";
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DropdownListComponent } from "./components/dropdown-list/dropdown-list.component";
import { DeleteConfirmButtonComponent } from "./components/delete-confirm-button/delete-confirm-button.component";
import { TimeInputComponent } from "./components/time-input/time-input.component";
import { SliderBarComponent } from './components/slider-bar/slider-bar.component';
import { ResponsiveMenuListComponent } from './components/responsive-menu-list/responsive-menu-list.component';
import { TitleDisplayerModifierComponent } from './components/title-displayer-modifier/title-displayer-modifier.component';
import { TimeViewsComponent } from "./time-views/time-views.component";
import { ButtonMenuComponent } from "./components/button-menu/button-menu.component";
import { TvMonthViewComponent } from './time-views/tv-month-view/tv-month-view.component';
import { TvYearViewComponent } from './time-views/tv-year-view/tv-year-view.component';
import { TvWeekViewComponent } from './time-views/tv-week-view/tv-week-view.component';
import { TvSpecifyViewComponent } from './time-views/tv-specify-view/tv-specify-view.component';



@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        BrowserAnimationsModule,
        ColorPickerModule,
    ],
    declarations: [

        ColorPickerComponent,
        DirectoryInputComponent,
        ActivityInputDropdownComponent,
        RecurringTaskFormComponent,

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
        DropdownListComponent,
        TimeInputComponent,
        DeleteConfirmButtonComponent,
        SpinnerComponent,
        SliderBarComponent,
        ResponsiveMenuListComponent,
        TitleDisplayerModifierComponent,

        TimeViewsComponent,
        ButtonMenuComponent,
        TvMonthViewComponent,
        TvYearViewComponent,
        TvWeekViewComponent,
        TvSpecifyViewComponent,
    ],
    exports: [
        CommonModule,
        ColorPickerComponent,
        


        RecurringTaskFormComponent,
        ActivityInputDropdownComponent,
        DataEntryItemInputComponent,
        DeleteConfirmButtonComponent,

        DropdownListComponent,
        TimeInputComponent,
        SpinnerComponent,
        SliderBarComponent,

        ResponsiveMenuListComponent,
        TitleDisplayerModifierComponent,

        TimeViewsComponent,
        ButtonMenuComponent,
    ]
})

export class SharedModule {}