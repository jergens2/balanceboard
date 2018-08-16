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
  private _currentHealthProfile: BehaviorSubject<GenericDataEntry> = new BehaviorSubject(null);
  constructor(private router: Router, private dataService: GenericDataEntryService) {
    this.dataService.allUserDataEntries.subscribe((dataEntries: GenericDataEntry[]) => {

      const healthProfiles = this.findHealthProfiles(dataEntries);
      this._allHealthProfiles.next(healthProfiles);
      this._currentHealthProfile.next(this.findCurrentHealthProfile(healthProfiles));
    });
  }
  get healthProfiles(): Observable<GenericDataEntry[]> {
    return this._allHealthProfiles.asObservable();
  }
  get currentHealthProfile(): Observable<GenericDataEntry> {
    return this._currentHealthProfile.asObservable();
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

  private findCurrentHealthProfile(dataEntries: GenericDataEntry[]): GenericDataEntry {
    let currentHealthEntry: GenericDataEntry;
    if (dataEntries.length > 0) {
      currentHealthEntry = dataEntries[0];
      for (let healthEntry of dataEntries) {
        if ((healthEntry.dataObject as HealthProfile).dateSetISO > (currentHealthEntry.dataObject as HealthProfile).dateSetISO) {
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
}