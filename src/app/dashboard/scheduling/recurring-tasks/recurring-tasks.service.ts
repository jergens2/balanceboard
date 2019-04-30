import { Injectable } from '@angular/core';
import { AuthStatus } from '../../../authentication/auth-status.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { RecurringTask } from './recurring-task.model';
import { defaultRecurringTasks } from './default-tasks';

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

  private _recurringTasks$: BehaviorSubject<RecurringTask[]> = new BehaviorSubject([]);
  public get recurringTasks():RecurringTask[] {
    return this._recurringTasks$.getValue();
  }
  public get recurringTasks$():Observable<RecurringTask[]> {
    return this._recurringTasks$.asObservable();
  }


  private getRecurringTasksHTTP(){
    this._loginComplete$.next(true);

    this._recurringTasks$.next(defaultRecurringTasks);
  }


 


  
}
