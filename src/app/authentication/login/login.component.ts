import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faKey, faUnlock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  public faUser: IconDefinition = faUser;
  public faKey = faKey;
  public faUnlock = faUnlock;
  public faSignInAlt = faSignInAlt;

  private _loginForm: FormGroup;
  public get loginForm(): FormGroup { return this._loginForm; }

  ngOnInit() {
    this._loginForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'password': new FormControl(null, Validators.required)
    });
  }

  private _loggingIn: boolean = false;
  public get loggingIn(): boolean { return this._loggingIn; }

  public onClickLogin(){
    this._loggingIn = true;
    this.authService.loginAttempt
  }

}
