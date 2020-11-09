import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import * as moment from 'moment';

import { faKey, faUser, faUnlock, faSpinner, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject, Observable, BehaviorSubject, Subscription } from 'rxjs';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {


  public readonly faKey = faKey;
  public readonly faUser = faUser;
  public readonly faUnlock = faUnlock;
  public readonly faSpinner = faSpinner;
  public readonly faSignInAlt = faSignInAlt;
  public readonly faUserPlus = faUserPlus;

  constructor(private authService: AuthenticationService) { }




  private _action: 'INITIAL' | 'LOGIN' | 'REGISTER' | 'PIN' | 'LOCK_SCREEN' | 'LOADING'= 'LOADING';
  public get action(): 'INITIAL' | 'LOGIN' | 'REGISTER' | 'PIN' | 'LOCK_SCREEN' | 'LOADING' { return this._action; }
  public get actionIsInitial(): boolean { return this._action === 'INITIAL'; }
  public get actionIsLogin(): boolean { return this._action === 'LOGIN'; }
  public get actionIsRegister(): boolean { return this._action === 'REGISTER'; }
  public get actionIsPin(): boolean { return this._action === 'PIN'; }
  public get actionIsLockScreen(): boolean { return this._action === 'LOCK_SCREEN'; }
  public get isLoading(): boolean { return this._action === 'LOADING'; }


  ngOnInit() {
    this._reload();
    // console.log('Action: ', this._action)
  }

  public onClickLogin() {
    this._action = 'LOGIN';
  }
  public onClickRegister() {
    this._action = 'REGISTER';
  }

  public onCancel() {
    this._action = 'INITIAL';
    localStorage.clear();
  }

  public onLoginFromReg() {
    this._action = 'LOADING';
    this.authService.loginFromRegistration();
  }

  public onUnlock() {
    this._action = 'PIN';
  }


  private _lockSub: Subscription = new Subscription();
  private _reload() {
    this._lockSub.unsubscribe();
    this._lockSub = this.authService.lockApp$.subscribe((lock) => {
      if (lock === true) {
        // console.log('received lock signal')
        this._action = 'LOCK_SCREEN'
      }
    });
    const currentAuthData: 'NOT_PRESENT' | 'EXPIRED' | 'VALID' | 'LOCKED' = this._checkLocalStorage();
    // console.log("Current auth data = ", currentAuthData)
    if (currentAuthData === 'NOT_PRESENT') {
      this._action = 'INITIAL';
    } else if (currentAuthData === 'EXPIRED') {
      this._action = 'LOCK_SCREEN';
    } else if (currentAuthData === 'VALID') {
      this._refreshToken();
    } else if (currentAuthData === 'LOCKED') {
      this._action = 'LOCK_SCREEN';
    }
  }

  private _refreshToken() {
    const token: string = localStorage.getItem('token');
    const userId: string = localStorage.getItem('userId');
    if (token && userId) {
      this.authService.refreshToken$(token, userId).subscribe((result: boolean) => {
        if (result === true) {
          const thisIsGood = true;
        } else {
          // console.log("Unsuccessful token refresh.  opening PIN pad")
          this._action = 'PIN';
        }
      });
    } else {
      this._action = 'INITIAL';
    }
  }

  private _checkLocalStorage(): 'NOT_PRESENT' | 'EXPIRED' | 'VALID' | 'LOCKED' {
    // console.log("Checking local storage");
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationString = localStorage.getItem('expiration');
    // console.log("Expiration string is : ", expirationString)
    const isPresent: boolean = (token !== null) && (userId !== null) && (expirationString !== null);
    if (isPresent) {
      if (token === 'LOCKED_TOKEN') {
        return 'LOCKED';
      } else {
        const now = moment();
        const milliseconds = Number(expirationString);
        const expiration: moment.Moment = moment(milliseconds);
        // console.log("Expiration is : " + expiration.format('YYYY-MM-DD hh:mm:ss a'))
        const cutoff = moment(expiration).subtract(1, 'minutes');
        // console.log("cutoff is : " + cutoff.format('YYYY-MM-DD hh:mm:ss a'))
        const isExpired: boolean = now.isAfter(cutoff);
        if (!isExpired) {
          // console.log("IT's not expired, so it's VALID")
          return 'VALID';
        } else if (isExpired) {
          // console.log("ITS EXPIRED, SO... PIN")
          return 'EXPIRED';
        }
      }
    } else {
      return 'NOT_PRESENT';
    }
  }


  ngOnDestroy() {
  }

}
