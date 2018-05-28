import { TimeService } from './services/time.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { MonthViewComponent } from './views/month-view/month-view.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MonthViewComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [ TimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
