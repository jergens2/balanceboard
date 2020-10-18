import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faUnlock, faSignInAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';
import { Subscription, timer, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as moment from 'moment';
import { RegistrationData } from '../auth-data.interface';
import { KeydownService } from '../../shared/keydown.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService, private keydownService: KeydownService) { }

  public faUser: IconDefinition = faUser;
  public faKey = faKey;
  public faUnlock = faUnlock;
  public faSignInAlt = faSignInAlt;
  public faArrowLeft = faArrowLeft;

  private _loginForm: FormGroup;
  public get loginForm(): FormGroup { return this._loginForm; }

  private _loginAttemptFailed: string = "";
  private _loginSub: Subscription = new Subscription();
  private _keySub: Subscription = new Subscription();
  public get loginAttemptFailed(): string { return this._loginAttemptFailed; }

  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();
  ngOnInit() {
    let regUsername: string = "";
    let regPassword: string = "";
    if (this.authService.registrationController) {
      regUsername = this.authService.registrationController.email;
      regPassword = this.authService.registrationController.password;
      this.authService.destoryRegController();
    };
    this._loginForm = new FormGroup({
      'username': new FormControl(regUsername, Validators.required),
      'password': new FormControl(regPassword, Validators.required)
    });
    this.keydownService.keyDown$.subscribe(key => {
      if (key === 'Enter') {
        let testUser = this._loginForm.controls['username'].value;
        let testPass = this._loginForm.controls['password'].value;
        if (testUser && testPass) {
          this.onClickLogin();
        }
      }
    });
  }
  ngOnDestroy() {
    this._loginSub.unsubscribe();
    this._keySub.unsubscribe();
  }

  private _loggingIn: boolean = false;
  public get loggingIn(): boolean { return this._loggingIn; }




  public onClickLogin() {
    const startTime: moment.Moment = moment();
    const waitDurationMS: number = 1500;
    this._loggingIn = true;
    this._loginAttemptFailed = "";
    this._loginSub.unsubscribe();
    this._loginSub = this.authService.loginAttempt$.subscribe((attempt) => {
      if (attempt === false) {
        let millisecondsElapsed = moment().diff(startTime, 'milliseconds');
        if (millisecondsElapsed < waitDurationMS) {
          const remainder = waitDurationMS - millisecondsElapsed;
          timer(remainder).subscribe((tick) => {
            this._stopLoginAttempt();
          });
        } else {
          this._stopLoginAttempt();
        }
      } else {
        // console.log("attempt is successful")
        /**
         * No action necessary, successfull auth will destroy this component.
         */
      }
    });
    const username: string = (this.loginForm.controls['username'].value).toLowerCase();
    const email: string = (this.loginForm.controls['username'].value).toLowerCase();
    const authData: RegistrationData = {
      username: username,
      usernameStylized: username,
      email: email,
      password: this.loginForm.controls['password'].value,
      pin: '',
    };
    // console.log("Attempting login")
    this.authService.attemptLogin(authData);
  }

  public onClickSpinner() {

  }

  public onClickCancel() {
    this.cancel.emit(true);
  }

  private _stopLoginAttempt() {
    this._loggingIn = false;
    this._loginAttemptFailed = "Login attempt failed";
    this._loginSub.unsubscribe();
  }

}
