import { HomeService } from './services/home.service';
import { TimeService } from './services/time.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { MonthViewComponent } from './views/month-view/month-view.component';
import { DayViewComponent } from './views/day-view/day-view.component';
import { YearViewComponent } from './views/year-view/year-view.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MonthViewComponent,
    DayViewComponent,
    YearViewComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [ 
    TimeService, 
    HomeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
