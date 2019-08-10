import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleRotationsService {

  constructor() { }
  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  login$(authStatus: AuthStatus): Observable<boolean>{
    this._authStatus = authStatus;
    this._loginComplete$.next(true);
    return this._loginComplete$.asObservable();
  }

  logout(){
    this._authStatus = null;

  }
}
