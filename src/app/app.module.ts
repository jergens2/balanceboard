import { GenericDataEntryService } from './services/generic-data-entry.service';
import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthenticationService } from './authentication/authentication.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeService } from './services/home.service';
import { TimeService } from './services/time.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './nav/header/header.component';
import { MonthViewComponent } from './home/widgets/month-view/month-view.component';
import { DayViewComponent } from './home/widgets/day-view/day-view.component';
import { YearViewComponent } from './home/widgets/year-view/year-view.component';
import { EventFormComponent } from './home/widgets/day-view/event-form/event-form.component';
import { IvyleeCreationComponent } from './productivity/ivylee/ivylee-creation/ivylee-creation.component';
import { TaskService } from './services/task.service';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { ContentComponent } from './nav/content/content.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { IvyleeManageComponent } from './productivity/ivylee/ivylee-manage/ivylee-manage.component';
import { IvyleeWidgetComponent } from './home/widgets/ivylee-widget/ivylee-widget.component';
import { BodyWeightWidgetComponent } from './home/widgets/body-weight/body-weight-widget.component';
import { HealthComponent } from './health/health.component';
import { BodyWeightComponent } from './health/body-weight/body-weight.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'ivyleeCreation', component: IvyleeCreationComponent },
  { path: 'ivyleeManagement', component: IvyleeManageComponent },
  { path: 'bodyWeight', component: BodyWeightComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MonthViewComponent,
    DayViewComponent,
    YearViewComponent,
    EventFormComponent,
    IvyleeCreationComponent,
    SidebarComponent,
    ContentComponent,
    AuthenticationComponent,
    IvyleeManageComponent,
    IvyleeWidgetComponent,
    BodyWeightWidgetComponent,
    HealthComponent,
    BodyWeightComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot()
  ],
  providers: [ 

    AuthenticationService,
    TimeService, 
    HomeService,
    TaskService,
    GenericDataEntryService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    EventFormComponent
  ]
})
export class AppModule { }
