import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/auth-data.model';

@Injectable()
export class AuthenticationService {

  private token: string;
  //public authentication: { isAuthenticated: boolean } = { isAuthenticated: false};

  constructor(private http: HttpClient) { }

  private serverUrl = "https://www.mashboard.app";

  getToken(){
    return this.token;
  }

  registerUser(authdata: AuthData): Observable<Object>{
    const authData: AuthData = { email: authdata.email, password: authdata.password }
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  authenticateUser(authData: AuthData){
    this.http.post(this.serverUrl + "/api/authentication/authenticate", authData)
      .subscribe((response: {message: string, data: string}) =>{
        console.log(response);
        const token = response.data;
        this.token = token;
        //this.setAction("authenticate");
      });

  }

  checkForExistingAccount(email: string): Observable<Object>{
    return this.http.get(this.serverUrl + "/api/authentication/validateNewEmail/" + email)
  }
  
}
