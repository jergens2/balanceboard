import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";


import { ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DirectoryInputComponent } from './directory/directory-input/directory-input.component';
import { ActivityInputDropdownComponent } from "./activity-input-dropdown/activity-input-dropdown.component";

import { RecurringTaskFormComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/recurring-task-form.component";
import { RtRepititionsComponent } from "./document-definitions/recurring-task-definition/recurring-task-form/rt-repititions/rt-repititions.component";
import { BrowseActivityComponent } from './activity-input-dropdown/browse-activity/browse-activity.component';

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
import { ColorPickerComponent } from "./color-picker/color-picker.component";
import { ActivitySearchComponent } from './activity-search/activity-search.component';
import { ClockComponent } from './clock/clock.component';
import { NewItemCircleButtonComponent } from './components/new-item-circle-button/new-item-circle-button.component';



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
        ActivitySearchComponent,
        ClockComponent,
        NewItemCircleButtonComponent,
    ],
    exports: [
        CommonModule,
        ColorPickerComponent,
        
        RecurringTaskFormComponent,
        ActivityInputDropdownComponent,
        ActivitySearchComponent,
        DeleteConfirmButtonComponent,

        DropdownListComponent,
        TimeInputComponent,
        SpinnerComponent,
        SliderBarComponent,

        ResponsiveMenuListComponent,
        TitleDisplayerModifierComponent,

        TimeViewsComponent,
        ButtonMenuComponent,
        ClockComponent,
        NewItemCircleButtonComponent,
    ]
})

export class SharedModule {}