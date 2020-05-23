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
    // this._startClock();
    return this._loadSleepProfile$();
  }
  public logout(){
    this._userId = null;
    // this._clockSubs.forEach((sub)=>sub.unsubscribe());
    // this._clockSubs = [];
  }

  /**
   *  router.post( '/create', controller.create);
      router.post( '/read', controller.read);
      router.post( '/update', controller.update);
      router.post( '/delete', controller.delete);
   */
  private _loadSleepProfile$(): Observable<boolean> {
    const _userActionRequred$: Subject<boolean> = new Subject();
    this._getSleepProfileHttp$().subscribe((manager: SleepManager)=>{
      this._sleepManager = manager;
      this._sleepManagerForm = new SleepManagerForm(manager);
      const userActionRequired = this._sleepManager.userActionRequired;
      _userActionRequred$.next(userActionRequired);
    }, (error)=>{
      console.log("Error getting sleep profile: ", error);
      _userActionRequred$.next(false);
    });
    return _userActionRequred$.asObservable();
  }

  public updateSleepProfile$(sleepProfile: any): Observable<any> {
    console.log("Method incomplete");
    return null;
  }


  // private _clockSubs: Subscription[] = [];
  // private _startClock(){
  //   const oneHour = 60*60*1000;
  //   this._clockSubs = [
  //     timer(oneHour).subscribe((tick)=>{
  //       // this._updateSleepStatus();
  //     }),
  //   ];
  // }

  // private _updateClockSubs(msUntilNextRequest: number){
  //   this._clockSubs.forEach(s => s.unsubscribe());
  //   this._clockSubs = [
  //     timer(msUntilNextRequest).subscribe((tick)=>{
  //       this._updateSleepStatus();
  //     }),
  //   ];
  // }

  // private _updateSleepStatus(){
  //    this._getSleepProfileHttp$().subscribe((sleepManager: SleepManager)=>{

  //    }, (error)=>{
  //      console.log("Error of some kind: ", error);
  //    })
  // }

  private _getSleepProfileHttp$(): Observable<SleepManager>{
    const url = serverUrl + '/api/sleep-manager/read';
    const data = {
      userId: this._userId,
    };
    return this.httpClient.post<any>(url, this._userId)
    .pipe<SleepManager>(map((response: {
      message: string,
      success: boolean,
      data: SleepProfileHTTPData,
    })=>{
      return new SleepManager(response.data);
    }));
  }

}
