import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from './authentication.service';
import { AuthData } from './auth-data.interface';
import { AuthStatus } from './auth-status.class';
import { faKey, faUser, faUnlock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserAccount } from '../shared/document-definitions/user-account/user-account.class';
import { UserSetting } from '../shared/document-definitions/user-account/user-settings/user-setting.model';
import { UserSettingsService } from '../shared/document-definitions/user-account/user-settings/user-settings.service';
import { ActivityCategoryDefinitionService } from '../shared/document-definitions/activity-category-definition/activity-category-definition.service';
import { TimelogService } from '../shared/document-data/timelog-entry/timelog.service';
import { SocialService } from '../shared/document-definitions/user-account/social.service';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {



  faKey = faKey; 
  faUser = faUser;
  faUnlock = faUnlock;
  faSpinner = faSpinner;

  action: string = "welcome";

  formMessage: string = "";
  errorMessage: string = "";

  authData: AuthData = { userAccount: null, password: '' };


  registrationForm: FormGroup;
  confirmRegistrationForm: FormGroup;
  loginForm: FormGroup;
  continueDisabled: boolean = true;


  constructor(private authService: AuthenticationService, private userSettingsService: UserSettingsService, private socialService: SocialService) { }

  attemptLogin() {
    this.setAction("waiting");
    this.authService.loginAttempt(this.authData);
  }



  ngOnInit() {
    this.registrationForm = new FormGroup({
      'emailAddress': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    });
    this.confirmRegistrationForm = new FormGroup({
      'password': new FormControl(null, Validators.required),
    });
    this.loginForm = new FormGroup({
      'emailAddress': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    })

  }

  setAction(action: string) {
    this.formMessage = "";
    this.errorMessage = "";
    this.action = action;
  }

  onClickLogin() {
    this.setAction("waiting");

    if (this.loginForm.valid) {
      let loginUser = new UserAccount('', this.loginForm.controls['emailAddress'].value, '', []);
      this.authData = { userAccount: loginUser, password: this.loginForm.controls['password'].value }
      this.authService.loginAttempt$.subscribe((successful: boolean) => {
        if(successful){
          this.setAction("waiting");
          this.formMessage = "Logging in...";
        }else{
          this.setAction("login");
          this.formMessage = "Bad username or password";
        }
      });
      this.attemptLogin();
    } else {
      this.formMessage = "Form is invalid";
    }

  }



  onClickContinueRegistration() {
    if (this.registrationForm.valid) {
      this.setAction("waiting");
      this.authService.checkForExistingAccount$(this.registrationForm.controls['emailAddress'].value).subscribe((response: any) => {
        if (response.data == null) {
          this.setAction("confirm_registration");
        } else {
          this.setAction("register");
          this.formMessage = "An account with this email address already exists"
        }
      }, error => {
        this.setAction("error");
        this.errorMessage = error.message;
      })
    } else {
      this.formMessage = "Form is invalid";
    }

  }

  onClickCancelRegistration() {
    this.setAction("welcome");
  }

  onClickFinishRegistration() {

    /*
      2019-01-28

      What is the proper way to do authentication?  checking in the front end, or make another request with the newly typed password to check with the server?
      is it safe to have that information in the front end at all ?

    */

    if (this.registrationForm.controls['password'].value == this.confirmRegistrationForm.controls['password'].value) {
      this.setAction("waiting");
      let defaultSettings: UserSetting[] = this.userSettingsService.createDefaultSettings();
      let newUser = new UserAccount(null, this.registrationForm.controls['emailAddress'].value, this.socialService.generateSocialId(), defaultSettings);
      console.log("Registering new user:", newUser);
      this.authData = { userAccount: newUser.httpBody, password: this.registrationForm.controls['password'].value };
      console.log("Auth data is", this.authData);
      this.authService.registerNewUserAccount$(this.authData).subscribe((response: { data: any, message: string }) => {
        if (response != null) {
          this.setAction("successful_registration");
        } else {
          this.setAction("error");
          this.errorMessage = "No response from server.";2
        }
      }, error => {
        console.log(error);
        this.setAction("error");
        this.errorMessage = error.message;
      });

    } else {
      this.setAction("confirm_registration");
      this.formMessage = "Passwords do not match";
    }


  }


  onClickContinuePostRegistration() {
    this.attemptLogin();
  }

  ngOnDestroy() {
    this.registrationForm.reset();
    this.confirmRegistrationForm.reset();
  }

}
