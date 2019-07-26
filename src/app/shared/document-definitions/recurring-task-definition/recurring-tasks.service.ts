import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.class';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { RecurringTaskDefinition } from './recurring-task-definition.class';
import { defaultRecurringTasks } from '../../../dashboard/scheduling/recurring-tasks/default-recurring-tasks';
import { serverUrl } from '../../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { DailyTaskListItem, DailyTaskList } from '../../document-data/daily-task-list/daily-task-list.class';


@Injectable({
  providedIn: 'root'
})
export class RecurringTasksService {

  constructor(private httpClient: HttpClient) { }

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);



  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;

    this.httpGetRecurringTasks();
    return this._loginComplete$;
  }
  logout() {
    this._authStatus = null;
  }
  public get userId(): string {
    return this._authStatus.user.id;
  }

  private _recurringTasks$: BehaviorSubject<RecurringTaskDefinition[]> = new BehaviorSubject([]);
  public get recurringTasks(): RecurringTaskDefinition[] {
    return this._recurringTasks$.getValue();
  }
  public get recurringTasks$(): Observable<RecurringTaskDefinition[]> {
    return this._recurringTasks$.asObservable();
  }
  


  public getRecurringTaskById(recurringTaskId: string): RecurringTaskDefinition{
    return this._recurringTasks$.getValue().find((task: RecurringTaskDefinition)=>{
      return task.id == recurringTaskId;
    })
  }

  public generateDailyTaskList(date: moment.Moment): DailyTaskList{
    console.log("Warning:  this method is disabled.");
    // return new DailyTaskList("", this._authStatus.user.id, this.getDTLItemsForDate(date), date.format("YYYY-MM-DD"), this);
    return null;
  }

  private getDTLItemsForDate(date: moment.Moment): DailyTaskListItem[]{
    let dtlItems: DailyTaskListItem[] = [];
    console.log("all recurring tasks", this._recurringTasks$.getValue());
    this._recurringTasks$.getValue().filter((recurringTask: RecurringTaskDefinition)=>{
      return recurringTask.hasTaskOnDate(date);
    }).forEach((recurringTask: RecurringTaskDefinition)=>{
      dtlItems.push({recurringTaskId: recurringTask.id, completionDate: ""});
    });
    console.log("DTL ITEMS on "+ date.format("YYYY-MM-DD"), dtlItems);
    return dtlItems;
  }


  private httpGetRecurringTasks() {

    let getUrl = serverUrl + "/api/recurringTaskDefinition/" + this.userId;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe<RecurringTaskDefinition[]>(map((response: { message: string, data: any }) => {
        let recurringTaskDefinitions: RecurringTaskDefinition[] = [];
        for (let taskData of (response.data as any[])) {
          recurringTaskDefinitions.push(this.buildRecurringTaskDefinitionFromHttp(taskData));
        }
        return recurringTaskDefinitions;
      }))
      .subscribe((tasks: RecurringTaskDefinition[]) => {
        if (tasks.length == 0) {
          console.log("Warning: no RecurringTaskDefinitions, using Defaults.  These defaults are not saved in the DB");
          this._recurringTasks$.next(defaultRecurringTasks);
        } else {
          this._recurringTasks$.next(tasks);
        }
        this._loginComplete$.next(true);
      });
  }

  public httpSaveRecurringTaskDefinition(saveTask: RecurringTaskDefinition) {
    let saveUrl = serverUrl + "/api/recurringTaskDefinition/create";

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(saveUrl, saveTask.httpSave, httpOptions)
      .pipe<RecurringTaskDefinition>(map((response: any) => {
        return this.buildRecurringTaskDefinitionFromHttp(response.data);
      }))
      .subscribe((task: RecurringTaskDefinition) => {
        let currentTasks = this._recurringTasks$.getValue();
        currentTasks.push(task);
        this._recurringTasks$.next(currentTasks);
      });

  }

  public httpUpdateRecurringTaskDefinition(updateTask: RecurringTaskDefinition) {
    let updateUrl = serverUrl + "/api/recurringTaskDefinition/update";

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(updateUrl, updateTask.httpUpdate, httpOptions)
      .pipe<RecurringTaskDefinition>(map((response: any) => {
        return this.buildRecurringTaskDefinitionFromHttp(response.data);
      }))
      .subscribe((updatedTask: RecurringTaskDefinition) => {


        let currentTasks = this._recurringTasks$.getValue();
        let index: number = 0;
        for(let currentTask of currentTasks){
          if(currentTask.id == updateTask.id){
            index = currentTasks.indexOf(currentTask);
          }
        }
        currentTasks.splice(index, 1, updatedTask);
        this._recurringTasks$.next(currentTasks);
      });

  }

  public httpDeleteRecurringTask(task: RecurringTaskDefinition) {
    const postUrl = serverUrl + "/api/recurringTaskDefinition/delete";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };

    this.httpClient.post<{ message: string, data: any }>(postUrl, task.httpDelete, httpOptions)
      .subscribe((response) => {
        // console.log("Response from HTTP delete request:", response)
        let recurringTasks = this._recurringTasks$.getValue();
        recurringTasks.splice(recurringTasks.indexOf(task), 1);
        this._recurringTasks$.next(recurringTasks);
      })
  }




  private buildRecurringTaskDefinitionFromHttp(dataObject: any): RecurringTaskDefinition {
    let recurringTaskDefinition: RecurringTaskDefinition = new RecurringTaskDefinition(dataObject._id, dataObject.userId, dataObject.name, dataObject.repititions);
    return recurringTaskDefinition;
  };

}
