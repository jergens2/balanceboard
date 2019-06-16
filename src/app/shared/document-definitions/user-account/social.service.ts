import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserAccount } from './user-account.class';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    return this._loginComplete$.asObservable();
  }
  public get userAccount(): UserAccount{
    return this._authStatus.user;
  }

  constructor() { }

  public generateSocialId(): string{
    let socialId: string = "";
    for(let i=0; i<16; i++){
      socialId += (Math.floor(Math.random()*16).toString(16).toUpperCase());
    }
    return socialId;
  }
}
