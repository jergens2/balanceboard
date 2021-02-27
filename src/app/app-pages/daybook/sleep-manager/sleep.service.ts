import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../../../serverurl';
import { SleepManager } from './sleep-manager.class';
import { map } from 'rxjs/operators';
import { SleepCycleHTTPData } from './sleep-cycle/sleep-cycle-http-data.interface';
import { DaybookHttpService } from '../daybook-day-item/daybook-http.service';
import { DaybookDayItem } from '../daybook-day-item/daybook-day-item.class';
import { UserAccountProfileService } from '../../user-account-profile/user-account-profile.service';
import { UAPAppConfiguration } from '../../user-account-profile/api/uap-app-configuraiton.interface';
import { SleepCycleData } from './sleep-cycle/sleep-cycle-data.class';
import { ClockService } from '../../../shared/clock/clock.service';

@Injectable({
  providedIn: 'root'
})

/**
 *
 * In the database is the 'sleepManagerProfile' collection, which will store a single document for each user, 
 * this document is a singular object that is used as a temporary storage location for this information, which is updated on a daily basis.
 *
 * All of the actual sleep data is ultimately stored in the DaybookDayItem collection.
 *
 *
 */
export class SleepService {

  /**
   * This class is responsible for performing HTTP requests on the sleepManagerProfile collection, 
   * as well as having a property of SleepManager  
   */
  constructor(private httpClient: HttpClient, private daybookHTTPService: DaybookHttpService,
    private accountService: UserAccountProfileService, private clockService: ClockService) { }

  private _userId: string;
  private _sleepManager: SleepManager;
  private _sleepCycleData: SleepCycleData;

  public get sleepManager(): SleepManager { return this._sleepManager; }
  public get currentTime(): moment.Moment { return this.sleepManager.currentTime; }
  public get currentTime$(): Observable<moment.Moment> { return this.sleepManager.currentTime$; }
  public get sleepData(): SleepCycleData { return this._sleepCycleData; }
  public get hasPrompt(): boolean { return this.sleepData.hasPrompt; }

  public login$(userId: string): Observable<boolean> {
    this._userId = userId;
    return this._step2loadSleepCycleAsyncData$();
  }
  public logout() {
    this._userId = null;
    // this._appConfig = null;
    this._sleepManager = null;
    this._sleepCycleData = null;
  }



  /**
   * After user prompts are complete, proceed with the creation of the sleep manager.
   *  This step happens after async data is loaded, and before the user prompt.
   *  refer to app-load-sequence.md
   *
   * if it is the first time config, user sets initial values and this method is reloaded.
  */
  public step3And5InitiateSleepManager() {
    this._rebuildManager();
  }

  private _rebuildManager() {
    const sleepData: SleepCycleData = this.sleepData;
    const dayItems: DaybookDayItem[] = this.daybookHTTPService.dayItems;
    const appConfig: UAPAppConfiguration = this.accountService.appConfig;
    this._sleepManager = new SleepManager(sleepData, dayItems, appConfig, this.clockService.clock);
  }

  private _step2loadSleepCycleAsyncData$(): Observable<boolean> {
    const isComplete$: Subject<boolean> = new Subject();
    const url = serverUrl + '/api/sleep-manager/read';
    const data = {
      userId: this._userId,
    };
    this.httpClient.post<any>(url, data)
      .pipe<SleepCycleHTTPData>(map((response: {
        message: string,
        success: boolean,
        data: SleepCycleHTTPData,
      }) => {
        if (response.success === true) {
          return response.data;
        } else {
          return null;
        }
      })).subscribe({
        next: (data: SleepCycleHTTPData) => {
          this._sleepCycleData = new SleepCycleData(data, this.clockService.clock);
          isComplete$.next(true);
        },
        error: e => console.log('Error', e),
        complete: () => isComplete$.complete()
      });
    return isComplete$.asObservable();
  }

  public get defaultWakeupTimeToday(): moment.Moment {
    const startOfDay = moment().startOf('day');
    const appConfig = this.accountService.appConfig;
    return moment(startOfDay).add(appConfig.defaultWakeupHour, 'hours').add(appConfig.defaultWakeupMinute, 'minutes');
  }


  // public setSleepData(sleepData: SleepCycleData) { this._sleepCycleData = sleepData; }
  public get previousFallAsleepTime(): moment.Moment { return this.sleepData.previousFallAsleepTime; }
  public get previousWakeupTime(): moment.Moment { return this.sleepData.previousWakeupTime; }
  public get nextFallAsleepTime(): moment.Moment { return this.sleepData.nextFallAsleepTime; }
  public get nextWakeupTime(): moment.Moment { return this.sleepData.nextWakeupTime; }

  public saveSleepProfileChangesHTTP$(sleepProfile: SleepCycleHTTPData): Observable<boolean> {
    sleepProfile.userId = this._userId;
    // console.log("SAVING CHANGES TO SLEEP DATA:", sleepProfile)
    const isComplete$: Subject<boolean> = new Subject();
    const url = serverUrl + '/api/sleep-manager/update';
    this.httpClient.post<{
      message: string,
      success: boolean,
      successData: SleepCycleHTTPData,
      failData: any,
    }>(url, sleepProfile).subscribe((response) => {
      if (response.success === true) {
        // console.log("RESPONSE DATA: " , response)
        this._sleepCycleData = new SleepCycleData(response.successData, this.clockService.clock);
        this._rebuildManager();
      }
      isComplete$.next(true);
    }, (error) => {
      isComplete$.error(error);
    }, () => isComplete$.complete());
    return isComplete$.asObservable();
  }

  public changePrevFallAsleepTime$(fallAsleep: moment.Moment): Observable<boolean> {
    const now = moment();
    const isComplete$: Subject<boolean> = new Subject();
    if (fallAsleep.isAfter(moment(now).subtract(36, 'hours'))) {
      this._sleepCycleData.changePrevFallAsleepTime(fallAsleep);
      this.saveSleepProfileChangesHTTP$(this._sleepCycleData.toHttpData()).subscribe(isComplete => {
        this._rebuildManager();
        isComplete$.complete();
      });
    } else {
      isComplete$.complete();
    }
    return isComplete$.asObservable();
  }
  public changePrevWakeupTime$(wakeup: moment.Moment): Observable<boolean> {
    const now = moment();
    const isComplete$: Subject<boolean> = new Subject();
    if (wakeup.isAfter(moment(now).subtract(36, 'hours')) && wakeup.isBefore(now)) {
      this._sleepCycleData.changePrevWakeupTime(wakeup);
      this.saveSleepProfileChangesHTTP$(this._sleepCycleData.toHttpData()).subscribe(isComplete => {
        this._rebuildManager();
        isComplete$.complete();
      });
    } else {
      isComplete$.complete();
    }
    return isComplete$.asObservable();
  }

  public changeNextFallAsleepTime$(bedtime: moment.Moment): Observable<boolean> {
    const now = moment();
    const isComplete$: Subject<boolean> = new Subject();
    if (bedtime.isBefore(moment(now).add(24, 'hours'))) {
      this._sleepCycleData.changeNextFallAsleepTime(bedtime);
      this.saveSleepProfileChangesHTTP$(this._sleepCycleData.toHttpData()).subscribe(isComplete => {
        this._rebuildManager();
        isComplete$.complete();
      });
    } else {
      isComplete$.complete();
    }
    return isComplete$.asObservable();
  }

  public changeNextWakeupTime$(wakeup: moment.Moment): Observable<boolean> {
    const now = moment();
    const isComplete$: Subject<boolean> = new Subject();
    if (wakeup.isBefore(moment(now).add(36, 'hours'))) {
      this._sleepCycleData.changeNextWakeupTime(wakeup);
      this.saveSleepProfileChangesHTTP$(this._sleepCycleData.toHttpData()).subscribe(isComplete => {
        this._rebuildManager();
        isComplete$.complete();
      });
    } else {
      isComplete$.complete();
    }
    return isComplete$.asObservable();
  }

}
