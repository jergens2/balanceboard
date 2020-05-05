import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faUnlock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';
import { UserAccount } from '../../shared/document-definitions/user-account/user-account.class';
import { Subscription, timer, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as moment from 'moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthenticationService) { }

  public faUser: IconDefinition = faUser;
  public faKey = faKey;
  public faUnlock = faUnlock;
  public faSignInAlt = faSignInAlt;

  private _loginForm: FormGroup;
  public get loginForm(): FormGroup { return this._loginForm; }

  private _loginAttemptFailed: string = "";
  public get loginAttemptFailed(): string { return this._loginAttemptFailed; }

  ngOnInit() {
    this._loginForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'password': new FormControl(null, Validators.required)
    });
  }
  ngOnDestroy() {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  private _loggingIn: boolean = false;
  public get loggingIn(): boolean { return this._loggingIn; }

  private _subs: Subscription[] = [];


  public onClickLogin() {
    const startTime: moment.Moment = moment();
    const waitDurationMS: number = 1500;
    this._loggingIn = true;
    this._loginAttemptFailed = "";

    this._subs.forEach(sub => sub.unsubscribe());
    this._subs = [
      this.authService.loginAttempt$.subscribe((attempt) => {
        if (attempt === false) {
          let millisecondsElapsed = moment().diff(startTime, 'milliseconds');
          if(millisecondsElapsed < waitDurationMS){
            const remainder = waitDurationMS - millisecondsElapsed;
            timer(remainder).subscribe((tick)=>{
              this._stopLoginAttempt();
            });
          }else{
            this._stopLoginAttempt();
          }          
        }
      }),
    ]

    let loginUser = new UserAccount('', this.loginForm.controls['username'].value, '');
    let authData = { userAccount: loginUser, password: this.loginForm.controls['password'].value }
    this.authService.attemptLogin(authData);
  }

  public onClickSpinner() {

  }

  private _stopLoginAttempt(){
    this._loggingIn = false;
    this._loginAttemptFailed = "Login attempt failed";
    this._subs.forEach(sub => sub.unsubscribe());
  }

}
