import * as moment from 'moment';
import { HealthProfile } from './health-profile.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GenericDataEntryService } from '../services/generic-data-entry.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericDataEntry } from '../models/generic-data-entry.model';

@Injectable()
export class HealthService {




  private _allHealthProfiles: BehaviorSubject<GenericDataEntry[]> = new BehaviorSubject([]);
  private _todayHealthProfile: BehaviorSubject<GenericDataEntry> = new BehaviorSubject(null);
  constructor(private router: Router, private dataService: GenericDataEntryService) {
    this.dataService.allUserDataEntries.subscribe((dataEntries: GenericDataEntry[]) => {

      const healthProfiles = this.findHealthProfiles(dataEntries);
      this._allHealthProfiles.next(healthProfiles);
      const todayHealthProfile = this.findTodayHealthProfile(healthProfiles);
      if(todayHealthProfile){
        this._todayHealthProfile.next(this.findTodayHealthProfile(healthProfiles));
      }
      
    });
  }
  get healthProfiles(): Observable<GenericDataEntry[]> {
    return this._allHealthProfiles.asObservable();
  }
  get todayHealthProfile(): Observable<GenericDataEntry> {
    return this._todayHealthProfile.asObservable();
  }

  private findHealthProfiles(dataEntries: GenericDataEntry[]): GenericDataEntry[] {
    let healthEntries: GenericDataEntry[] = [];
    for (let healthEntry of dataEntries) {
      if (healthEntry.dataType === 'HealthProfile') {
        healthEntries.push(healthEntry);
      }
    }
    return healthEntries;

  }

  private findTodayHealthProfile(dataEntries: GenericDataEntry[]): GenericDataEntry {
    let currentHealthEntry: GenericDataEntry;
    if (dataEntries.length > 0) {

      // currentHealthEntry = dataEntries[0];
      for (let healthEntry of dataEntries) {
        if (moment((healthEntry.dataObject as HealthProfile).dateSetISO).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ) {
          currentHealthEntry = healthEntry;
        }
      }
    }
    return currentHealthEntry;
  }

  saveHealthProfile(healthProfile: HealthProfile){
    let dataEntry: GenericDataEntry = new GenericDataEntry(null, null, moment().toISOString(), "HealthProfile", healthProfile);
    this.dataService.saveDataObject(dataEntry);
  }
  updateCurrentHealthProfile(healthProfile: HealthProfile){
    let dataEntry: GenericDataEntry = this._todayHealthProfile.value;
    dataEntry.dataObject = healthProfile;
    this.dataService.updateDataEntryDataObject(dataEntry);
  }
}