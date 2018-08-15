import { HealthProfile } from './health-profile.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GenericDataEntryService } from '../services/generic-data-entry.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericDataEntry } from '../models/generic-data-entry.model';

@Injectable()
export class HealthService {



  private _allHealthProfiles: BehaviorSubject<GenericDataEntry[]> = new BehaviorSubject([]);

  constructor(private router: Router, private dataService: GenericDataEntryService) { 
    this.dataService.allUserDataEntries.subscribe((dataEntries: GenericDataEntry[])=>{
      this._allHealthProfiles.next(this.findHealthProfiles(dataEntries));
    });
  }

  get healthProfiles(): Observable<GenericDataEntry[]>{
    return this._allHealthProfiles.asObservable();
  }

  

  private findHealthProfiles(dataEntries: GenericDataEntry[]): GenericDataEntry[] {
    let healthEntries: GenericDataEntry[] = [];
    for (let healthEntry of healthEntries) {
      if (healthEntry.dataType === 'HealthProfile') {
        healthEntries.push(healthEntry);
      }
    }
    return healthEntries;
  }

}
