import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Task } from './task.model';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
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
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;
    this.getTasksHTTP();
    return this._loginComplete$.asObservable();
  }

  private _loginComplete$: Subject<boolean> = new Subject();

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

  private _taskQueue: Task[] = [];
  private _taskQueue$: Subject<Task[]> = new Subject();
  public get taskQueue(): Task[] {
    return this._taskQueue;
  }
  public get taskQueue$(): Observable<Task[]> {
    return this._taskQueue$.asObservable();
  }
  // public get taskQueue$(): Subject<Task[]> {}

  private updateTaskQueue(allTasks: Task[]){
    
    //
    //  rebuild the task Queue as per algorithm, based on priority.
    //

    let tasks: Task[] = allTasks.filter((task)=>{ if(!task.isComplete){ return task }})
    tasks.sort((task1, task2)=>{
      if(task1.startDate.isBefore(task2.startDate)){
        return -1;
      }
      if(task1.startDate.isAfter(task2.startDate)){
        return 1;
      }
      return 0;
    })

    let taskQueue: Task[] = [];

    for(let i=0; i<6; i++){
      taskQueue.push(tasks[i]);
    }

    console.log("tasks is ", tasks);
    console.log("taskqueue", taskQueue);
    this._taskQueue = taskQueue;
    this._taskQueue$.next(this._taskQueue);

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
        this.updateTaskQueue(tasks);
        this._tasks$.next(this.sortTasksByDate(tasks));
        this._loginComplete$.next(true);
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
        this._tasks$.next(this.sortTasksByDate(currentTasks));
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
        let updatedTask = this.buildTaskFromHttp(response.data);
        let currentTasks = this._tasks$.getValue();
        currentTasks.splice(currentTasks.indexOf(task),1,updatedTask );
        this._tasks$.next(this.sortTasksByDate(currentTasks));
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
        // console.log("Response from HTTP delete request:", response)
        let tasks = this._tasks$.getValue();
        tasks.splice(tasks.indexOf(task),1);
        this._tasks$.next(this.sortTasksByDate(tasks));
      })
  };



  private sortTasksByDate(tasks: Task[]): Task[] {
    return tasks.sort((task1, task2)=>{
      if(task1.startDate.isAfter(task2.startDate)){
        return -1;
      }
      if(task1.startDate.isBefore(task2.startDate)){
        return 1;
      }
      return 0;
    });
  }

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
