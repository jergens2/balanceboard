import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { AuthStatus } from './auth-status.model';

@Injectable()
export class AuthenticationService {

  // private authStatus: AuthStatus;
  private _authStatusSubject: BehaviorSubject<AuthStatus> = new BehaviorSubject<AuthStatus>(new AuthStatus(null,null,false));

  get authStatus(): Observable<AuthStatus>{
    return this._authStatusSubject.asObservable();
  }

  constructor(private http: HttpClient) { }

  //private serverUrl = "https://www.mashboard.app";
  private serverUrl = "http://localhost:3000";

  get token(): string {
    return this._authStatusSubject.getValue().token;
  }

  get authenticatedUser(): User {
    return this._authStatusSubject.getValue().user;
  }



  registerUser(authdata: AuthData): Observable<Object>{
    const authData: AuthData = { email: authdata.email, password: authdata.password }
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  authenticateUser(authData: AuthData) {
    
    let authenticatedUser: User;
    return this.http.post<{message: string, data: any}>(this.serverUrl + "/api/authentication/authenticate", authData)
      .subscribe((response: {message: string, data: any}) =>{

        this._authStatusSubject.next(new AuthStatus(response.data.token, new User(response.data.user._id, response.data.user.email), true))

        localStorage.setItem("token",this.token);
        localStorage.setItem("user", JSON.stringify(this.authenticatedUser));


      }, (error) => {
        this._authStatusSubject.next(new AuthStatus(null,null, false));
        console.log("Error authenticating: ", error);
      })

  }

  getUserById(userId: string): Observable<User>{
    return this.http.get<{message: string, data: any}>(this.serverUrl + "/api/authentication/getUserById/" + userId)
      .pipe(map((response)=>{
        return new User(response.data._id, response.data.email);
      }))    
  }

  checkForExistingAccount(email: string): Observable<Object>{
    return this.http.get(this.serverUrl + "/api/authentication/validateNewEmail/" + email)
  }

  logout(){
    localStorage.clear();
    this._authStatusSubject.next(new AuthStatus(null,null, false));
  }

  checkLocalStorage(): boolean{
    if(!localStorage.getItem("token") || !localStorage.getItem("user")){
      this._authStatusSubject.next(new AuthStatus(null,null, false));
      return false;
    }else{
      let user = JSON.parse(localStorage.getItem("user"));
      this._authStatusSubject.next(new AuthStatus(localStorage.getItem("token"),user, true));
      return true;
    }
  }


  
}
