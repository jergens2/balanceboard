
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


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
import { UserSettingsComponent } from './shared/document-definitions/user-account/user-settings/user-settings.component';
import { HeaderMenuComponent } from './nav/header/header-menu/header-menu.component';
import { ModalComponent } from './modal/modal.component';
import { DefaultModalComponent } from './modal/custom-modals/default-modal/default-modal.component';

import { ConfirmModalComponent } from './modal/custom-modals/confirm-modal/confirm-modal.component';
import { NotepadModalComponent } from './modal/custom-modals/notepad-modal/notepad-modal.component';
import { SharedModule } from './shared/shared.module';
import { SearchBarComponent } from './nav/search-bar/search-bar.component';
import { ToolsMenuModule } from './toolbox-menu/tools-menu.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';
import { PinPadUnlockComponent } from './authentication/pin-pad-unlock/pin-pad-unlock.component';
import { InitialRegComponent } from './authentication/registration/initial-reg/initial-reg.component';
import { ConfirmPasswordComponent } from './authentication/registration/confirm-password/confirm-password.component';
import { TermsComponent } from './authentication/registration/terms/terms.component';
import { SuccessConfirmationComponent } from './authentication/registration/success-confirmation/success-confirmation.component';
import { UserActionPromptComponent } from './user-action-prompt/user-action-prompt.component';




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
    ConfirmModalComponent,
    NotepadModalComponent,
    SearchBarComponent,
    RegistrationComponent,
    LoginComponent,
    PinPadUnlockComponent,
    InitialRegComponent,
    ConfirmPasswordComponent,
    TermsComponent,
    SuccessConfirmationComponent,
    UserActionPromptComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DashboardModule,
    SharedModule,
    ToolsMenuModule,
    AppRoutingModule,
    FontAwesomeModule,
    ColorPickerModule,
  ],
  providers: [
    AuthenticationService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
