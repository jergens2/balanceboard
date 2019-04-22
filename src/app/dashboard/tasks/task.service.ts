import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Task } from './task.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { serverUrl } from '../../serverurl';
import { AuthStatus } from '../../authentication/auth-status.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { TaskPriority } from './task-priority.enum';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private httpClient: HttpClient) { }

  private _serverUrl = serverUrl;
  private _authStatus: AuthStatus;
  login(authStatus: AuthStatus) {
    this._authStatus = authStatus;
    this.getTasksHTTP();
  }

  logout() {
    this._authStatus = null;
  }
  /*
    Initially, this service will do a generic HTTP fetch of existing tasks for this userId, and store them in an array.

    If getTaskById is called, and it exists already in current _tasks, then return it,
    else, do a specific HTTP request for this task, by ID.

  */

  private _tasks$: BehaviorSubject<Task[]> = new BehaviorSubject([]);
  public get tasks$(): Observable<Task[]> {
    return this._tasks$.asObservable();
  }

  
  private getTasksHTTP(){
    const getUrl = this._serverUrl + "/api/task/" + this._authStatus.user.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<Task[]>(map((response: { message: string, data: any }) => {

        let tasks: Task[] = [];
        for(let taskData of (response.data as any[]) ){        
          tasks.push(this.buildTaskFromHttp(taskData));
        }
        return tasks;
      }))
      .subscribe((tasks: Task[])=>{
        this._tasks$.next(tasks);
      })
  }

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
        return this.buildTaskFromHttp(response.data)
      }))

  }

  public createTaskHTTP$(task: Task): Observable<Task> {
    console.log("Saving task:", task);



    let requestBody: any = {
      userId: this._authStatus.user.id,
      title: task.title,
      priority: task.priority,
      isComplete: false,
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
        let task = this.buildTaskFromHttp(response.data);
        let currentTasks = this._tasks$.getValue();
        currentTasks.push(task);
        this._tasks$.next(currentTasks);
        return task;
      }));
  }

  public updateTaskHTTP$(task: Task): Observable<Task> {
    console.log("Updating task:", task);



    let requestBody: any = {
      id: task.id,
      userId: task.userId,
      title: task.title,
      priority: task.priority,
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
        let task = this.buildTaskFromHttp(response.data);
        let currentTasks = this._tasks$.getValue();
        currentTasks.push(task);
        this._tasks$.next(currentTasks);
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


  private buildTaskFromHttp(data: any): Task{


    let task = new Task(data._id, data.userId, data.title, data.description, moment(data.startDateISO), moment(data.dueDateISO))
    if (data.isComplete as boolean) {
      task.markComplete(moment(data.completionDateISO));
    }
    let taskPriority: TaskPriority;
    if(data.priority == 0){
      taskPriority = TaskPriority.High;
    }
    if(data.priority == 1){
      taskPriority = TaskPriority.Normal;
    }
    if(data.priority == 2){
      taskPriority = TaskPriority.Low;
    }
    task.priority = taskPriority;
    return task;
  }


}
