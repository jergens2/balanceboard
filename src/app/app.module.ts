import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthenticationService } from './services/authentication.service';
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
import { MonthViewComponent } from './views/month-view/month-view.component';
import { DayViewComponent } from './views/day-view/day-view.component';
import { YearViewComponent } from './views/year-view/year-view.component';
import { EventFormComponent } from './views/day-view/event-form/event-form.component';
import { IvyleeComponent } from './productivity/ivylee/ivylee.component';
import { TaskService } from './services/task.service';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { ContentComponent } from './nav/content/content.component';
import { AuthenticationComponent } from './authentication/authentication.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'ivylee', component: IvyleeComponent },
  { path: 'auth', component: AuthenticationComponent }
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
    IvyleeComponent,
    SidebarComponent,
    ContentComponent,
    AuthenticationComponent
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
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    EventFormComponent
  ]
})
export class AppModule { }
