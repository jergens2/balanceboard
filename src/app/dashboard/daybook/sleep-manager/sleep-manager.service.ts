import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject, Observable, Subscription, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../../../serverurl';
import { SleepManager } from './sleep-manager.class';
import { map } from 'rxjs/operators';
import { SleepManagerForm } from './sleep-manager-form/sleep-manager-form.class';
import { SleepProfileHTTPData } from './sleep-profile-http-data.interface';

@Injectable({
  providedIn: 'root'
})

/**
 * 
 * In the database is the 'sleepManagerProfile' collection, which will store a single document for each user, 
 * this document is a singular object that is used as a temporary storage location for this information, which is updated on a daily basis.
 * 
 * All of the actual sleep data is stored in the DaybookDayItem collection.
 * 
 * 
 */
export class SleepManagerService {

  constructor(private httpClient: HttpClient) { }

  private _userId: string;

  private _sleepManager: SleepManager; 
  private _sleepManagerForm: SleepManagerForm;

  public get sleepManager(){ return this._sleepManager; }
  public get sleepManagerForm() { return this._sleepManagerForm; }
  // public get userActionRequired(): boolean { return this.sleepManager.userActionRequired; }
  public get previousFallAsleepTime(): moment.Moment { return this.sleepManager.previousFallAsleepTime; }
  public get previousWakeupTime(): moment.Moment { return this.sleepManager.previousWakeupTime; }

  public get nextFallAsleepTime(): moment.Moment { return this.sleepManager.nextFallAsleepTime; }
  public get nextWakeupTime(): moment.Moment { return this.sleepManager.nextWakeupTime; }
  public get energyAtWakeup(): number { return this.sleepManager.energyAtWakeup; }
  public get id(): string { return this.sleepManager.id; }
  // public get previousWakeTimeIsSet(): boolean { return this.sleepManager.previousWakeTimeIsSet; }
  // public get nextFallAsleepTimeIsSet(): boolean { return this.sleepManager.nextFallAsleepTimeIsSet; }


  public getEnergyLevel(): number { return this.sleepManager.getEnergyLevel(); }

  public initiate$(userId: string): Observable<boolean> {
    this._userId = userId;
    this._loadSleepProfile$();
    return this._userActionRequired$.asObservable();
  }
  public logout(){
    this._userId = null;
  }

  private _formComplete$: Subject<boolean> = new Subject();
  public get formComplete$(): Observable<boolean> { return this._formComplete$.asObservable(); }


  private _userActionRequired$: Subject<boolean> = new Subject();
  private _loadSleepProfile$(): Observable<boolean> {
    this._getSleepProfileHttp$().subscribe((manager: SleepManager)=>{
      this._sleepManager = manager;
      this._sleepManagerForm = new SleepManagerForm(manager);
      const userActionRequired = this._sleepManager.userActionRequired;
      this._userActionRequired$.next(userActionRequired);
    }, (error)=>{
      console.log("Error getting sleep profile: ", error);
      this._userActionRequired$.next(false);
    });
    return this._userActionRequired$.asObservable();
  }

  public updateSleepProfile$(sleepProfile: SleepProfileHTTPData): Observable<any> {
    sleepProfile.userId = this._userId;
    // console.log("Update sleep profile: " , sleepProfile);
    const url = serverUrl + '/api/sleep-manager/update';

    this.httpClient.post<{
      message: string,
      success: boolean,
      data: any,
    }>(url, sleepProfile).subscribe((response)=>{
      // console.log("Response updating: " , response);

      const newManager = new SleepManager(response.data)
      this._sleepManager = newManager;
      this._sleepManagerForm = new SleepManagerForm(newManager);
      const userActionRequired = this._sleepManager.userActionRequired;
      
      this._formComplete$.next(true);


    }, (error)=>{
      console.log("There has been an error.", error)
      this._formComplete$.next(false);
    });
    return this._formComplete$.asObservable();
  }
  
  private _getSleepProfileHttp$(): Observable<SleepManager>{
    const url = serverUrl + '/api/sleep-manager/read';
    const data = {
      userId: this._userId,
    };
    return this.httpClient.post<any>(url, data)
    .pipe<SleepManager>(map((response: {
      message: string,
      success: boolean,
      data: SleepProfileHTTPData,
    })=>{
      return new SleepManager(response.data);
    }));
  }

}
