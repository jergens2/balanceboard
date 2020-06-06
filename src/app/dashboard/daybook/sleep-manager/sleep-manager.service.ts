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
import { DaybookTimeSchedule } from '../api/controllers/daybook-time-schedule.class';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { DaybookTimelogEntryDataItem } from '../api/data-items/daybook-timelog-entry-data-item.interface';
import { DaybookSleepInputDataItem } from '../api/data-items/daybook-sleep-input-data-item.interface';

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

  constructor(private httpClient: HttpClient, private daybookHTTPService: DaybookHttpRequestService) { }

  private _userId: string;

  private _sleepManager: SleepManager;
  private _sleepManagerForm: SleepManagerForm;

  public get sleepManager() { return this._sleepManager; }
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
    const _userActionRequired$: Subject<boolean> = new Subject();
    this._loadDaybookItems$().subscribe((schedule: DaybookTimeSchedule)=>{
      this._loadSleepProfile$(schedule).subscribe((userActionRequired: boolean)=>{
        _userActionRequired$.next(userActionRequired);
      });
    });
    return _userActionRequired$.asObservable();
  }
  public logout() {
    this._userId = null;
    this._sleepManager = null;
    this._sleepManagerForm = null;
  }

  private _formComplete$: Subject<boolean> = new Subject();
  public get formComplete$(): Observable<boolean> { return this._formComplete$.asObservable(); }


  private _loadDaybookItems$() : Observable<DaybookTimeSchedule>{
    const _schedule$: Subject<DaybookTimeSchedule> = new Subject();
    let schedule: DaybookTimeSchedule;
    const today = moment().format('YYYY-MM-DD');
    const scheduleStart = moment(today).startOf('day').subtract(1, 'day');
    const scheduleEnd = moment(today).startOf('day').add(2, 'days');
    this.daybookHTTPService.getDaybookDayItemByDate$(today).subscribe((items: DaybookDayItem[]) => {
      let timelogDataItems: DaybookTimelogEntryDataItem[] = [];
      let sleepItems: DaybookSleepInputDataItem[] = [];
      let delineators: moment.Moment[] = [];
      items.forEach((item) => {
        timelogDataItems = timelogDataItems.concat(item.timelogEntryDataItems);
        sleepItems = sleepItems.concat(item.sleepInputItems);
        delineators = delineators.concat(item.timeDelineators);
      })      
      schedule = new DaybookTimeSchedule(scheduleStart, scheduleEnd, timelogDataItems, sleepItems, delineators);
      _schedule$.next(schedule);
    }, (error)=>{
      console.log("Error loading daybookDayItems from httpService")
      _schedule$.next(null);
    });
    return _schedule$.asObservable();
  }

  private _loadSleepProfile$(schedule: DaybookTimeSchedule): Observable<boolean> {
    const _userActionRequired$: Subject<boolean> = new Subject();
    this._getSleepProfileHttp$(schedule).subscribe((manager: SleepManager) => {
      this._sleepManager = manager;
      this._sleepManagerForm = new SleepManagerForm(manager);
      const userActionRequired = this._sleepManager.userActionRequired;
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
    this.daybookHTTPService.getDaybookDayItemByDate$(today).subscribe((items: DaybookDayItem[]) => {
      this._saveDaybookSleepData$(items).subscribe((isComplete: boolean)=>{
        const url = serverUrl + '/api/sleep-manager/update';
        this.httpClient.post<{
          message: string,
          success: boolean,
          data: any,
        }>(url, sleepProfile).subscribe((response) => {
          // console.log("Response updating: " , response);
          const newManager = new SleepManager(response.data)
          this._sleepManager = newManager;
          this._sleepManagerForm = new SleepManagerForm(newManager);
          const userActionRequired = this._sleepManager.userActionRequired;
          this._formComplete$.next(true);
        }, (error) => {
          console.log("There has been an error.", error)
          this._formComplete$.next(false);
        });
      });
    });
    return this._formComplete$.asObservable();    
  }

  private _saveDaybookSleepData$(items: DaybookDayItem[]): Observable<boolean>{
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
    let prevDaySleepItems: DaybookSleepInputDataItem[] = [];
    let thisDaySleepItems: DaybookSleepInputDataItem[] = [];
    const startOfThisDay = moment().startOf('day');
    if (moment(prevFallAsleepTime).isBefore(startOfThisDay)) {
      prevDaySleepItems = [
        {
          startSleepTimeISO: prevFallAsleepTime,
          startSleepTimeUtcOffsetMinutes: prevFallAsleepUTCOffset,
          endSleepTimeISO: startOfThisDay.toISOString(),
          endSleepTimeUtcOffsetMinutes: startOfThisDay.utcOffset(),
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: -1,
        },
      ];
      thisDaySleepItems = [
        {
          startSleepTimeISO: startOfThisDay.toISOString(),
          startSleepTimeUtcOffsetMinutes: startOfThisDay.utcOffset(),
          endSleepTimeISO: previousWakeupTime,
          endSleepTimeUtcOffsetMinutes: previousWakeupUTCOffset,
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: energyAtWakeup,
        },
      ]
    }else{
      thisDaySleepItems = [
        {
          startSleepTimeISO: prevFallAsleepTime,
          startSleepTimeUtcOffsetMinutes: prevFallAsleepUTCOffset,
          endSleepTimeISO: previousWakeupTime,
          endSleepTimeUtcOffsetMinutes: previousWakeupUTCOffset,
          percentAsleep: durationPercent,
          embeddedNote: '',
          activities: [],
          energyAtEnd: energyAtWakeup,
        },
      ];
    }
    const thisDateYYYYMMDD: string = moment().format('YYYY-MM-DD')
    const prevDateYYYYMMDD: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const prevDayItem = items.find(item => item.dateYYYYMMDD === prevDateYYYYMMDD);
    const thisDayItem = items.find(item => item.dateYYYYMMDD === thisDateYYYYMMDD);
    prevDayItem.sleepInputItems = prevDaySleepItems;
    thisDayItem.sleepInputItems = thisDaySleepItems;
    const daysToUpdate = [prevDayItem, thisDayItem];
    forkJoin(daysToUpdate.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
      this.daybookHTTPService.updateDaybookDayItem$(item)))
      .subscribe((updatedItems: DaybookDayItem[]) => {
        // console.log("Received updated items from forkJoin: ", updatedItems);
      
        isComplete$.next(true);
      }, (err)=>{
        console.log("error updating day items: " , err);
        isComplete$.next(true);
      });
    return isComplete$.asObservable();
  }

  private _getSleepProfileHttp$(schedule: DaybookTimeSchedule): Observable<SleepManager> {
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
        return new SleepManager(response.data, schedule);
      }));
  }

}
