import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import * as moment from 'moment';

import { faKey, faUser, faUnlock, faSpinner, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject, Observable, BehaviorSubject } from 'rxjs';


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
  public get actionIsPin() { return this._action === 'PIN'; }

  // private _pinKeyPressed$: BehaviorSubject<number> = new BehaviorSubject(null);
  // public get pinKeyPressed$(): Observable<number> { return this._pinKeyPressed$.asObservable(); }
  // @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
  //   if (event.key === '0') { this.authService.pinKeyPressed(0); }
  //   else if (event.key === '1') { this.authService.pinKeyPressed(1); }
  //   else if (event.key === '2') { this.authService.pinKeyPressed(2); }
  //   else if (event.key === '3') { this.authService.pinKeyPressed(3); }
  //   else if (event.key === '4') { this.authService.pinKeyPressed(4); }
  //   else if (event.key === '5') { this.authService.pinKeyPressed(5); }
  //   else if (event.key === '6') { this.authService.pinKeyPressed(6); }
  //   else if (event.key === '7') { this.authService.pinKeyPressed(7); }
  //   else if (event.key === '8') { this.authService.pinKeyPressed(8); }
  //   else if (event.key === '9') { this.authService.pinKeyPressed(9); }
  // }

  ngOnInit() {
    console.log("Auth component init.")
    this._reload();
  }

  public onClickLogin() {
    this._action = 'LOGIN';
  }
  public onClickRegister() {
    this._action = 'REGISTER';
  }

  public onCancel() {
    this._action = 'INITIAL';
  }

  /**
   * see auth_process.jpg
   * 
   * Process starts here in _reload()
   * 
   * 
   */
  private _reload() {
    console.log("auth component .reload()")
    const currentAuthData: 'NOT_PRESENT' | 'EXPIRED' | 'VALID' = this._checkLocalStorage();
    if (currentAuthData === 'NOT_PRESENT') {
      this._action = 'INITIAL';
      this._isLoading = false;
    } else if (currentAuthData === 'EXPIRED') {
      this._action = 'PIN';
      this._isLoading = false;
    } else if (currentAuthData === 'VALID') {
      this._refreshToken()
    }
  }

  /**
   * Give existing valid token to server to obtain a new one
   */
  private _refreshToken() {
    console.log("WARNING: method incomplete")
    const token: string = localStorage.getItem('token');
    this.authService.refreshToken$(token).subscribe((response) => {

    });
  }

  private _checkLocalStorage(): 'NOT_PRESENT' | 'EXPIRED' | 'VALID' {
    console.log("Checking local storage");
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const expirationString = localStorage.getItem('expiration');
    const isPresent: boolean = (token !== null) && (user !== null) && (expirationString !== null);
    if (isPresent) {
      const milliseconds = Number(expirationString);
      const expiration: moment.Moment = moment(milliseconds);
      const cutoff = moment().subtract(10, 'minutes');
      const isExpired: boolean = expiration.isBefore(cutoff);
      if (!isExpired) {
        return 'VALID';
      } else if (isExpired) {
        return 'EXPIRED';
      }
    } else {
      return 'NOT_PRESENT';
    }
  }


  ngOnDestroy() {
  }

}
