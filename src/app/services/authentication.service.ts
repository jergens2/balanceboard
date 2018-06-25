import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/auth-data.model';

@Injectable()
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  private serverUrl = "https://www.mashboard.app";
  registerUser(email: string, password: string){
    const authData: AuthData = { email: email, password: password }
    this.http.post(this.serverUrl + "/api/authentication/register",authData)
      .subscribe(response => {
        console.log(response);
      })
  }

}
