import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/auth-data.model';

@Injectable()
export class AuthenticationService {

  public authentication: { isAuthenticated: boolean } = { isAuthenticated: false};

  constructor(private http: HttpClient) { }

  private serverUrl = "https://www.mashboard.app";

  registerUser(authdata: AuthData): Observable<Object>{
    const authData: AuthData = { email: authdata.email, password: authdata.password }
    return this.http.post(this.serverUrl + "/api/authentication/register", authData)
  }

  authenticateUser(authData: AuthData): Observable<Object>{
    return this.http.post(this.serverUrl + "/api/authentication/authenticate", authData);
  }

  checkForExistingAccount(email: string): Observable<Object>{
    return this.http.get(this.serverUrl + "/api/authentication/validateNewEmail/" + email)
  }
  
}
