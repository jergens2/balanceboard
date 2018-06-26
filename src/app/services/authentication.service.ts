import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/auth-data.model';

@Injectable()
export class AuthenticationService {

  public authentication: { isAuthenticated: boolean } = { isAuthenticated: false};

  constructor(private http: HttpClient) { }

  private serverUrl = "https://www.mashboard.app";

  registerUser(authdata: AuthData){
    const authData: AuthData = { email: authdata.email, password: authdata.password }
    this.http.post(this.serverUrl + "/api/authentication/register", authData)
      .subscribe(response => {
        console.log(response);
      })
  }

  authenticateUser(email: string, password: string){

  }

}
