import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faUnlock, faSignInAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';
import { UserAccount } from '../../shared/document-definitions/user-account/user-account.class';
import { Subscription, timer, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as moment from 'moment';
import { AuthData } from '../auth-data.interface';

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
  public faArrowLeft = faArrowLeft;

  private _loginForm: FormGroup;
  public get loginForm(): FormGroup { return this._loginForm; }

  private _loginAttemptFailed: string = "";
  public get loginAttemptFailed(): string { return this._loginAttemptFailed; }

  @Output() public cancel: EventEmitter<boolean> = new EventEmitter();
  ngOnInit() {
    let regUsername: string = "";
    let regPassword: string = "";
    if(this.authService.registrationController){
      regUsername = this.authService.registrationController.email;
      regPassword = this.authService.registrationController.password;  
      this.authService.destoryRegController();
    };
    this._loginForm = new FormGroup({
      'username': new FormControl(regUsername, Validators.required),
      'password': new FormControl(regPassword, Validators.required)
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

    const username: string = (this.loginForm.controls['username'].value).toLowerCase();
    const email: string = (this.loginForm.controls['username'].value).toLowerCase();
    const authData: AuthData = {
      username: username,
      usernameStylized: username,
      email: email, 
      password: this.loginForm.controls['password'].value,
      pin: '',
    };
    console.log("Attempting login")
    this.authService.attemptLogin(authData);
  }

  public onClickSpinner() {

  }

  public onClickCancel(){
    this.cancel.emit(true);
  }

  private _stopLoginAttempt(){
    this._loggingIn = false;
    this._loginAttemptFailed = "Login attempt failed";
    this._subs.forEach(sub => sub.unsubscribe());
  }

}
