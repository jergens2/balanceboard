import { HomeService } from './services/home.service';
import { TimeService } from './services/time.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { MonthViewComponent } from './views/month-view/month-view.component';
import { DayViewComponent } from './views/day-view/day-view.component';
import { YearViewComponent } from './views/year-view/year-view.component';
import { ActivityFormComponent } from './views/day-view/activity-form/activity-form.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MonthViewComponent,
    DayViewComponent,
    YearViewComponent,
    ActivityFormComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  providers: [ 
    TimeService, 
    HomeService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ActivityFormComponent
  ]
})
export class AppModule { }
