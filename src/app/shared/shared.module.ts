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

@NgModule({
    imports: [
        CommonModule,
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
    ],
    exports: [
        CommonModule,
        TimeViewsComponent,
        YearViewComponent,
        ColorPickerComponent
    ]
})

export class SharedModule {}