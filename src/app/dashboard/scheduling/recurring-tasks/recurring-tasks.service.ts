import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { RecurringTaskDefinition } from '../../../shared/document-definitions/recurring-task/recurring-task-definition.class';
import { defaultRecurringTasks } from './default-recurring-tasks';

@Injectable({
  providedIn: 'root'
})
export class RecurringTasksService {

  constructor() { }

  private _authStatus: AuthStatus;
  private _loginComplete$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  login$(authStatus: AuthStatus): Observable<boolean> {
    this._authStatus = authStatus;

    this.getRecurringTasksHTTP();
    return this._loginComplete$;
  }
  logout() {
    this._authStatus = null;
  }

  private _recurringTasks$: BehaviorSubject<RecurringTaskDefinition[]> = new BehaviorSubject([]);
  public get recurringTasks():RecurringTaskDefinition[] {
    return this._recurringTasks$.getValue();
  }
  public get recurringTasks$():Observable<RecurringTaskDefinition[]> {
    return this._recurringTasks$.asObservable();
  }


  private getRecurringTasksHTTP(){
    this._loginComplete$.next(true);

    this._recurringTasks$.next(defaultRecurringTasks);
  }

  public saveRecurringTaskDefinition(saveTask: RecurringTaskDefinition){


    console.log("Do http request");

  }


 


  
}
