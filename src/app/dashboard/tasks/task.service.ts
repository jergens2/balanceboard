import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Task } from './task.model';
import { Observable } from 'rxjs';
import { serverUrl } from '../../serverurl';
import { AuthStatus } from '../../authentication/auth-status.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

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
    Initially, this service will do a generic HTTP fetch of existing tasks for this userId, and store them in an array.

    If getTaskById is called, and it exists already in current _tasks, then return it,
    else, do a specific HTTP request for this task, by ID.

  */

  private _tasks: Task[] = [];



  public getTaskByIdHTTP$(id: string): Observable<Task> {
    const getUrl = this._serverUrl + "/api/task/" + this._authStatus.user.id + "/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<Task>(map((response: { message: string, data: any }) => {
        let rd = response.data
        let task: Task = new Task(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO));
        if (rd.isComplete as boolean) {
          task.markComplete(moment(rd.completionDateISO));
        }
        console.log("from http get request, returning:", task)
        return task;
      }))

  }

  public createTaskHTTP$(task: Task): Observable<Task> {
    console.log("Saving task:", task);



    let requestBody: any = {
      userId: this._authStatus.user.id,
      description: task.description,
      startDateISO: task.startDate.toISOString(),
      dueDateISO: task.dueDate.toISOString()
    }

    const postUrl = this._serverUrl + "/api/task/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    return this.httpClient.post<{ message: string, data: any }>(postUrl, requestBody, httpOptions)
      .pipe<Task>(map((response: any) => {
        let rd = response.data
        let task: Task = new Task(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO));
        if (rd.isComplete as boolean) {
          task.markComplete(moment(rd.completionDateISO));
        }
        return task;
      }));
  }

  public updateTaskHTTP$(task: Task): Observable<Task> {
    console.log("Updating task:", task);



    let requestBody: any = {
      id: task.id,
      userId: task.userId,
      description: task.description,
      startDateISO: task.startDate.toISOString(),
      dueDateISO: task.dueDate.toISOString(),
      completionDateISO: task.completionDateISO,
      isComplete: task.isComplete,

    }

    const postUrl = this._serverUrl + "/api/task/update";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    return this.httpClient.post<{ message: string, data: any }>(postUrl, requestBody, httpOptions)
      .pipe<Task>(map((response: any) => {
        let rd = response.data
        console.log("Response Data is : ", rd);
        let task = new Task(rd._id, rd.userId, rd.description, moment(rd.startDateISO), moment(rd.dueDateISO))
        if (rd.isComplete as boolean) {
          task.markComplete(moment(rd.completionDateISO));
        }
        return task;
      }));
  }



  deleteTaskHTTP(task: Task){
    const postUrl = this._serverUrl + "/api/task/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, task, httpOptions)
      .subscribe((response) => {
        console.log("Response from HTTP delete request:", response)
      })
  };

}
