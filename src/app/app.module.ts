import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthenticationService } from './authentication/authentication.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './nav/header/header.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { AuthenticationComponent } from './authentication/authentication.component';


@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    HeaderComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    DashboardModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [
    AuthenticationService,
    NgbModule,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
