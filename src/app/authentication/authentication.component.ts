import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import * as moment from 'moment';

import { faKey, faUser, faUnlock, faSpinner, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';


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
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;

  constructor(private authService: AuthenticationService) { }

  private _isLoading: boolean = true;
  public get isLoading(): boolean { return this._isLoading; }


  private _action: 'INITIAL' | 'LOGIN' | 'REGISTER' | 'PIN' = 'INITIAL';
  public get action(): 'INITIAL' | 'LOGIN' | 'REGISTER' | 'PIN' { return this._action; }
  public get actionIsInitial() { return this._action === 'INITIAL'; }
  public get actionIsLogin() { return this._action === 'LOGIN'; }
  public get actionIsRegister() { return this._action === 'REGISTER'; }
  public get actionIsPin(){ return this._action === 'PIN'; }

  ngOnInit() {
    console.log("Auth component init.")
    this._reload();
  }

  /**
   * see auth_process.jpg
   * 
   * Process starts here in _reload()
   * 
   * 
   */
  private _reload(){
    console.log("auth component .reload()")
    const currentAuthData: 'NOT_PRESENT' | 'EXPIRED' | 'VALID' = this._checkLocalStorage();
    if(currentAuthData === 'NOT_PRESENT'){
      this._action = 'INITIAL';
      this._isLoading = false;
    }else if(currentAuthData === 'EXPIRED'){
      this._action = 'PIN';
      this._isLoading = false;
    }else if(currentAuthData === 'VALID'){
      this._refreshToken()
    }
  }

  private _refreshToken(){
    console.log("Refresh token not complete")
  }

  private _checkLocalStorage(): 'NOT_PRESENT' | 'EXPIRED' | 'VALID' {
    console.log("Checking local storage");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const expirationString = localStorage.getItem('expiration');
    const isPresent: boolean = (token !== null) && (user !== null) && (expirationString !== null);
    if(isPresent){
      const milliseconds = Number(expirationString);
      const expiration: moment.Moment = moment(milliseconds);
      const cutoff = moment().subtract(10, 'minutes');
      const isExpired: boolean = expiration.isBefore(cutoff);
      if(!isExpired){
        return 'VALID';
      }else if(isExpired){
        return 'EXPIRED';
      }
    }else{
      return 'NOT_PRESENT';
    }
  }


  ngOnDestroy() {
  }

}
