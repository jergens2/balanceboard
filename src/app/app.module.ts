
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppPagesModule } from './app-pages/app-pages.module';

import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthenticationService } from './authentication/authentication.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './nav/app-container/full-size-container/header/header.component';
import { SidebarComponent } from './nav/app-container/full-size-container/sidebar/sidebar.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { HeaderMenuComponent } from './nav/app-container/full-size-container/header/header-menu/header-menu.component';
import { ModalComponent } from './modal/modal.component';
import { DefaultModalComponent } from './modal/custom-modals/default-modal/default-modal.component';

import { ConfirmModalComponent } from './modal/custom-modals/confirm-modal/confirm-modal.component';
import { SharedModule } from './shared/shared.module';
import { SearchBarComponent } from './nav/search-bar/search-bar.component';
import { ToolsMenuModule } from './toolbox/tools-menu.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';
import { PinPadUnlockComponent } from './authentication/pin-pad-unlock/pin-pad-unlock.component';
import { InitialRegComponent } from './authentication/registration/initial-reg/initial-reg.component';
import { ConfirmPasswordComponent } from './authentication/registration/confirm-password/confirm-password.component';
import { TermsComponent } from './authentication/registration/terms/terms.component';
import { SuccessConfirmationComponent } from './authentication/registration/success-confirmation/success-confirmation.component';
import { UserActionPromptComponent } from './nav/user-action-prompt/user-action-prompt.component';
import { SleepManagerModule } from './app-pages/daybook/sleep-manager/sleep-manager.module';
import { LockScreenComponent } from './authentication/lock-screen/lock-screen.component';
import { AppContainerComponent } from './nav/app-container/app-container.component';
import { UserAccountProfileModule } from './app-pages/user-account-profile/user-account-profile.module';
import { UapFooterComponent } from './nav/user-action-prompt/uap-footer/uap-footer.component';
import { MobileMenuComponent } from './nav/app-container/mobile-container/mobile-menu/mobile-menu.component';
import { MobileContainerComponent } from './nav/app-container/mobile-container/mobile-container.component';
import { FullSizeContainerComponent } from './nav/app-container/full-size-container/full-size-container.component';
import { TabletContainerComponent } from './nav/app-container/tablet-container/tablet-container.component';
import { MiniSidebarComponent } from './nav/app-container/full-size-container/mini-sidebar/mini-sidebar.component';
import { PinnedSidebarComponent } from './nav/app-container/full-size-container/pinned-sidebar/pinned-sidebar.component';




@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    HeaderComponent,
    SidebarComponent,
    HeaderMenuComponent,
    ModalComponent,
    DefaultModalComponent,
    ConfirmModalComponent,
    SearchBarComponent,
    RegistrationComponent,
    LoginComponent,
    PinPadUnlockComponent,
    InitialRegComponent,
    ConfirmPasswordComponent,
    TermsComponent,
    SuccessConfirmationComponent,
    UserActionPromptComponent,
    LockScreenComponent,
    AppContainerComponent,
    UapFooterComponent,
    MobileMenuComponent,
    MobileContainerComponent,
    FullSizeContainerComponent,
    TabletContainerComponent,
    MiniSidebarComponent,
    PinnedSidebarComponent,

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppPagesModule,
    SleepManagerModule,
    UserAccountProfileModule,
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
