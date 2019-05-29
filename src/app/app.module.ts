
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
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { HeaderMenuComponent } from './nav/header/header-menu/header-menu.component';
import { ModalComponent } from './modal/modal.component';
import { DefaultModalComponent } from './modal/custom-modals/default-modal/default-modal.component';
import { PrimaryObjectiveModalComponent } from './modal/custom-modals/primary-objective-modal/primary-objective-modal.component';

import { TaskQueueModalComponent } from './modal/custom-modals/task-queue-modal/task-queue-modal.component';
import { ConfirmModalComponent } from './modal/custom-modals/confirm-modal/confirm-modal.component';
import { NotepadModalComponent } from './modal/custom-modals/notepad-modal/notepad-modal.component';
import { SharedModule } from './shared/shared.module';
import { SearchBarComponent } from './nav/search-bar/search-bar.component';




@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    HeaderComponent,
    SidebarComponent,
    UserSettingsComponent,
    HeaderMenuComponent,
    ModalComponent,
    DefaultModalComponent,
    PrimaryObjectiveModalComponent,
    TaskQueueModalComponent,
    ConfirmModalComponent,
    NotepadModalComponent,
    SearchBarComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    DashboardModule,
    SharedModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [
    AuthenticationService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
