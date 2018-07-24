import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GenericDataEntryService } from '../services/generic-data-entry.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericDataEntry } from '../models/generic-data-entry.model';

@Injectable()
export class HealthService {

  private _allBodyWeightEntries: BehaviorSubject<GenericDataEntry[]> = new BehaviorSubject([]);

  constructor(private router: Router, private dataService: GenericDataEntryService) { 
    this.dataService.allUserDataEntries.subscribe((dataEntries: GenericDataEntry[])=>{
      this._allBodyWeightEntries.next(this.findBodyWeightEntries(dataEntries));
      // console.log(this._allIvyLeeTaskLists.getValue());
    });
  }

  get bodyWeightEntries(): Observable<GenericDataEntry[]>{
    return this._allBodyWeightEntries.asObservable();
  }

  private findBodyWeightEntries(dataEntries: GenericDataEntry[]): GenericDataEntry[] {
    let healthEntries: GenericDataEntry[] = [];
    for (let healthEntry of healthEntries) {
      if (healthEntry.dataType === 'BodyWeight') {
        healthEntries.push(healthEntry);
      }
    }
    return healthEntries;
  }

}
