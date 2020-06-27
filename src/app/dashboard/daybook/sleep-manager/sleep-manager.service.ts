import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject, Observable, Subscription, timer, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../../../serverurl';
import { SleepManager } from './sleep-manager.class';
import { map } from 'rxjs/operators';
import { SleepManagerForm } from './sleep-manager-form/sleep-manager-form.class';
import { SleepProfileHTTPData } from './sleep-profile-http-data.interface';
import { DaybookHttpRequestService } from '../api/daybook-http-request.service';
import { DaybookTimeSchedule } from '../api/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';
import { UserPromptType } from '../../../user-action-prompt/user-prompt-type.enum';
import { UserAccountProfileService } from '../../user-account-profile/user-account-profile.service';
import { UAPAppConfiguration } from '../../user-account-profile/api/uap-app-configuraiton.interface';

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

  constructor(private httpClient: HttpClient, private daybookHTTPService: DaybookHttpRequestService,
    private accountService: UserAccountProfileService) { }

  private _userId: string;
  // private _appConfig: UAPAppConfiguration;

  private _sleepManager: SleepManager;
  private _sleepManagerForm: SleepManagerForm;

  public get sleepManager() { return this._sleepManager; }
  public get sleepManagerForm() { return this._sleepManagerForm; }

  public updateConfig(config: UAPAppConfiguration){
    this.sleepManager.updateConfig(config);
  }

  public initiate$(userId: string): Observable<UserPromptType> {
    // console.log("initiating sleep service.")
    this._userId = userId;
    // this._appConfig = this.accountService.appConfig;
    const _prompt$: Subject<UserPromptType> = new Subject();
    this._loadDaybookItems$().subscribe((items: DaybookDayItem[]) => {
      this._loadSleepProfile$(items).subscribe((userActionRequired: boolean) => {
        if (userActionRequired === true) {
          _prompt$.next(UserPromptType.SLEEP_MANAGER);
        } else {
          _prompt$.next();
        }
      });
    });
    return _prompt$.asObservable();
  }
  public logout() {
    this._userId = null;
    // this._appConfig = null;
    this._sleepManager = null;
    this._sleepManagerForm = null;
  }

  private _formComplete$: Subject<boolean> = new Subject();
  public get formComplete$(): Observable<boolean> { return this._formComplete$.asObservable(); }


  private _loadDaybookItems$(): Observable<DaybookDayItem[]> {
    const today = moment().format('YYYY-MM-DD');
    const scheduleStart = moment(today).startOf('day').subtract(14, 'days');
    const scheduleEnd = moment(today).startOf('day').add(2, 'days');
    return this.daybookHTTPService.getDaybookDayItemByDate$(today, scheduleStart.format('YYYY-MM-DD'), scheduleEnd.format('YYYY-MM-DD'));
  }

  private _loadSleepProfile$(items: DaybookDayItem[]): Observable<boolean> {
    // console.log("Loading sleep profile")
    const _userActionRequired$: Subject<boolean> = new Subject();
    this._getSleepProfileHttp$(items).subscribe((manager: SleepManager) => {
      this._sleepManager = manager;
      this._sleepManagerForm = new SleepManagerForm(manager);
      const userActionRequired = this._sleepManager.userActionRequired;
      // console.log("Action required? ", userActionRequired)
      _userActionRequired$.next(userActionRequired);
    }, (error) => {
      console.log("Error getting sleep profile: ", error);
      _userActionRequired$.next(false);
    });
    return _userActionRequired$.asObservable();
  }

  public updateSleepProfile$(sleepProfile: SleepProfileHTTPData): Observable<any> {
    sleepProfile.userId = this._userId;
    // console.log("Update sleep profile: " , sleepProfile);


    const today = moment().format('YYYY-MM-DD');
    let updateSubs: Subscription[] = [];

    const daybookItemsSub = this.daybookHTTPService.getDaybookDayItemByDate$(today).subscribe((items: DaybookDayItem[]) => {
      const saveSub = this._saveDaybookSleepData$(items).subscribe((isComplete: boolean) => {
        const url = serverUrl + '/api/sleep-manager/update';
        this.httpClient.post<{
          message: string,
          success: boolean,
          data: any,
        }>(url, sleepProfile).subscribe((response) => {
          const loadSub = this._loadDaybookItems$().subscribe((items: DaybookDayItem[]) => {
            const appConfig = this.accountService.appConfig;
            const newManager = new SleepManager(response.data, items, appConfig);
            this._sleepManager = newManager;
            this._sleepManagerForm = new SleepManagerForm(newManager);
            updateSubs = [daybookItemsSub, saveSub, loadSub];
            updateSubs.forEach(s => s.unsubscribe());
            this._formComplete$.next(true);
          });
        }, (error) => {
          updateSubs = [daybookItemsSub, saveSub];
          updateSubs.forEach(s => s.unsubscribe());
          console.log("There has been an error.", error)
          this._formComplete$.next(false);
        });
      });
    });
    return this._formComplete$.asObservable();
  }

  private _saveDaybookSleepData$(items: DaybookDayItem[]): Observable<boolean> {
    const thisDateYYYYMMDD: string = moment().format('YYYY-MM-DD')
    const prevDateYYYYMMDD: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const prevDayItem = items.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
    const thisDayItem = items.find(item => item.dateYYYYMMDD === thisDateYYYYMMDD);

    const isComplete$: Subject<boolean> = new Subject();
    const prevFallAsleepTime: string = this.sleepManagerForm.formInputPrevFallAsleep.toISOString();
    const prevFallAsleepUTCOffset: number = this.sleepManagerForm.formInputPrevFallAsleep.utcOffset();
    const previousWakeupTime: string = this.sleepManagerForm.formInputWakeupTime.toISOString();
    const previousWakeupUTCOffset: number = this.sleepManagerForm.formInputWakeupTime.utcOffset();
    const energyAtWakeup: number = this.sleepManagerForm.formInputStartEnergyPercent;
    const nextFallAsleepTime: string = this.sleepManagerForm.formInputFallAsleepTime.toISOString();
    const nextFallAsleepTimeUTCOffset: number = this.sleepManagerForm.formInputFallAsleepTime.utcOffset();
    const nextWakeupTime: string = this.sleepManagerForm.formInputNextWakeup.toISOString();
    const nextWakeupUTCOffset: number = this.sleepManagerForm.formInputNextWakeup.utcOffset();
    const durationPercent: number = this.sleepManagerForm.formInputDurationPercent;


    
    let prevDaySleepItems: DaybookSleepInputDataItem[] = Object.assign([], prevDayItem.sleepInputItems);
    const startOfThisDay = moment().startOf('day');
    const yesterDateYYYYMMDD: string = moment().startOf('day').subtract(24, 'hours').format('YYYY-MM-DD');

    console.log(" TO DO:  verify that when saving new sleep items, that there is no overlapping / duplication.")
    if(prevDaySleepItems.length === 0){
      const yesterdayDefaultWakeup = this.accountService.userProfile.defaultWakeupTime(yesterDateYYYYMMDD);
      prevDaySleepItems.push(this._newSleepItem(moment(yesterDateYYYYMMDD).startOf('day'), moment(yesterdayDefaultWakeup)));
    }
    let thisDaySleepItems: DaybookSleepInputDataItem[] = [];
    
    if (moment(prevFallAsleepTime).isBefore(startOfThisDay)) {
      let startTime = moment(prevFallAsleepTime);
      let endTime = moment(startOfThisDay);
      if (moment(previousWakeupTime).isBefore(startOfThisDay)) {
        endTime = moment(previousWakeupTime);
      }else if(moment(previousWakeupTime).isAfter(startOfThisDay)){
        thisDaySleepItems.push(this._newSleepItem(startOfThisDay, moment(previousWakeupTime), durationPercent, energyAtWakeup));
      }
      prevDaySleepItems.push(this._newSleepItem(startTime, endTime));
    }else if(moment(prevFallAsleepTime).isAfter(startOfThisDay)){
      thisDaySleepItems.push(this._newSleepItem(moment(prevFallAsleepTime), moment(previousWakeupTime), durationPercent, energyAtWakeup));
    }
    prevDayItem.sleepInputItems = prevDaySleepItems;
    thisDayItem.sleepInputItems = thisDaySleepItems;
    const daysToUpdate = [prevDayItem, thisDayItem];
    forkJoin(daysToUpdate.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
      this.daybookHTTPService.updateDaybookDayItem$(item)))
      .subscribe((updatedItems: DaybookDayItem[]) => {
        // console.log("Received updated items from forkJoin: ", updatedItems);
        isComplete$.next(true);
      }, (err) => {
        console.log("error updating day items: ", err);
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }



  private _getSleepProfileHttp$(items: DaybookDayItem[]): Observable<SleepManager> {
    const url = serverUrl + '/api/sleep-manager/read';
    const data = {
      userId: this._userId,
    };
    return this.httpClient.post<any>(url, data)
      .pipe<SleepManager>(map((response: {
        message: string,
        success: boolean,
        data: SleepProfileHTTPData,
      }) => {
        const appConfig = this.accountService.appConfig;
        return new SleepManager(response.data, items, appConfig);
      }));
  }

  private _newSleepItem(startTime: moment.Moment, endTime: moment.Moment, duration = 100, energy = 100): DaybookSleepInputDataItem{
    return {
      startSleepTimeISO: moment(startTime).toISOString(),
      startSleepTimeUtcOffsetMinutes: startTime.utcOffset(),
      endSleepTimeISO: moment(endTime).toISOString(),
      endSleepTimeUtcOffsetMinutes: endTime.utcOffset(),
      percentAsleep: duration,
      embeddedNote: '',
      activities: [],
      energyAtEnd: energy,
    }
  }

}
