import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { HomeComponent } from './home/home.component';
import { MonthViewComponent } from './home/widgets/month-view/month-view.component';
import { DayViewComponent } from './home/widgets/day-view/day-view.component';
import { YearViewComponent } from './home/widgets/year-view/year-view.component';
import { EventFormComponent } from './home/widgets/day-view/event-form/event-form.component';
import { IvyleeCreationComponent } from './productivity/ivylee/ivylee-creation/ivylee-creation.component';
import { IvyleeManageComponent } from './productivity/ivylee/ivylee-manage/ivylee-manage.component';
import { IvyleeWidgetComponent } from './home/widgets/ivylee-widget/ivylee-widget.component';
import { BodyWeightWidgetComponent } from './home/widgets/body-weight/body-weight-widget.component';
import { HealthComponent } from './health/health.component';
import { BodyWeightComponent } from './health/body-weight/body-weight.component';
import { BuildProfileComponent } from './health/build-profile/build-profile.component';
import { HeightFormComponent } from './health/body-weight/height-form/height-form.component';
import { FinanceComponent } from './finance/finance.component';
import { BudgetComponent } from './finance/budget/budget.component';
import { NetWorthComponent } from './finance/net-worth/net-worth.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TimelogModule } from './timelog/timelog.module';
import { DaybookComponent } from './daybook/daybook.component';
import { CalendarComponent } from './daybook/calendar/calendar.component';




@NgModule({
  imports: [
    TimelogModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    HomeComponent,
    MonthViewComponent,
    DayViewComponent,
    YearViewComponent,
    EventFormComponent,
    IvyleeCreationComponent,
    IvyleeManageComponent,
    IvyleeWidgetComponent,
    BodyWeightWidgetComponent,
    HealthComponent,
    BodyWeightComponent,
    BuildProfileComponent,
    HeightFormComponent,
    FinanceComponent,
    BudgetComponent,
    NetWorthComponent,
    DaybookComponent,
    CalendarComponent,
    
  ],
  providers: [],
  entryComponents: [
    EventFormComponent
  ]
})
export class DashboardModule { }
