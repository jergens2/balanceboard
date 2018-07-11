import { map } from 'rxjs/operators';
import { User } from './../models/user.model';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/auth-data.model';

@Injectable()
export class AuthenticationService {

  private token: string;
  private authenticatedUser: User;
  public authenticationStatus: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  //private serverUrl = "https://www.mashboard.app";
  private serverUrl = "http://localhost:3000";

  getToken(){
    return this.token;
  }

  getAuthenticatedUser(): User{
    return this.authenticatedUser;
  }

  registerUser(authdata: AuthData): Observable<Object>{
    const authData: AuthData = { email: authdata.email, password: authdata.password }
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  authenticateUser(authData: AuthData) {
    
    let authenticatedUser: User;
    return this.http.post<{message: string, data: any}>(this.serverUrl + "/api/authentication/authenticate", authData)
      .pipe(map((response) => {
        let responseUser = response.data.user;
        authenticatedUser = new User(responseUser._id, responseUser.email);
        return response;
      }))
      .subscribe((response: {message: string, data: any}) =>{
        this.authenticatedUser = authenticatedUser;
        this.token = response.data.token;
        localStorage.setItem("token",this.token);
        localStorage.setItem("userId", this.authenticatedUser.id);
        this.authenticationStatus.next(true);
      }, (error) => {
        console.log(error); 
        this.authenticationStatus.next(false);

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
    this.token = null;
    localStorage.clear();
    this.authenticationStatus.next(false);
  }

  checkLocalStorage(): boolean{
    if(!localStorage.getItem("token") || !localStorage.getItem("userId")){
      return false;
    }else{
      this.getUserById(localStorage.getItem("userId"))
        .subscribe((user: User)=>{
          this.authenticatedUser = user;
          this.authenticationStatus.next(true);
          this.token = localStorage.getItem("token");
          
        });
      return true;
    }
  }


  
}
