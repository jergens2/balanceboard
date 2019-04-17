import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Objective } from './objective.model';
import { Observable } from 'rxjs';
import { serverUrl } from '../../../serverurl';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ObjectivesService {

  constructor(private httpClient: HttpClient) { }

  private _serverUrl = serverUrl;
  private _authStatus: AuthStatus;
  login(authStatus: AuthStatus) {
    this._authStatus = authStatus;
  }

  logout() {
    this._authStatus = null;
  }
  /*
    Initially, this service will do a generic HTTP fetch of existing objectives for this userId, and store them in an array.

    If getObjectiveById is called, and it exists already in current _objectives, then return it,
    else, do a specific HTTP request for this objective, by ID.

  */

  private _objectives: Objective[] = [];



  public getObjectiveByIdHTTP$(id: string): Observable<Objective> {
    const getUrl = this._serverUrl + "/api/objective/" + this._authStatus.user.id + "/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<Objective>(map((response: { message: string, data: any }) => {
        let rd = response.data
        let objective: Objective = new Objective(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO));
        if (rd.isComplete as boolean) {
          objective.markComplete(moment(rd.completionDateISO));
        }
        console.log("from http get request, returning:", objective)
        return objective;
      }))

  }

  public createObjectiveHTTP$(objective: Objective): Observable<Objective> {
    console.log("Saving objective:", objective);



    let requestBody: any = {
      userId: this._authStatus.user.id,
      description: objective.description,
      startDateISO: objective.startDate.toISOString(),
      dueDateISO: objective.dueDate.toISOString()
    }

    const postUrl = this._serverUrl + "/api/objective/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    return this.httpClient.post<{ message: string, data: any }>(postUrl, requestBody, httpOptions)
      .pipe<Objective>(map((response: any) => {
        let rd = response.data
        let objective: Objective = new Objective(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO));
        if (rd.isComplete as boolean) {
          objective.markComplete(moment(rd.completionDateISO));
        }
        return objective;
      }));
  }

  public updateObjectiveHTTP$(objective: Objective): Observable<Objective> {
    console.log("Updating objective:", objective);



    let requestBody: any = {
      id: objective.id,
      userId: objective.userId,
      description: objective.description,
      startDateISO: objective.startDate.toISOString(),
      dueDateISO: objective.dueDate.toISOString(),
      completionDateISO: objective.completionDateISO,
      isComplete: objective.isComplete,

    }

    const postUrl = this._serverUrl + "/api/objective/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    return this.httpClient.post<{ message: string, data: any }>(postUrl, requestBody, httpOptions)
      .pipe<Objective>(map((response: any) => {
        let rd = response.data
        console.log("Response Data is : ", rd);
        let objective = new Objective(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO))
        if (rd.isComplete as boolean) {
          objective.markComplete(moment(rd.completionDateISO));
        }
        return objective;
      }));
  }



  deleteObjectiveHTTP(objective: Objective){
    const postUrl = this._serverUrl + "/api/objective/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, objective, httpOptions)
      .subscribe((response) => {
        console.log("Response from HTTP delete request:", response)
      })
  };

}
