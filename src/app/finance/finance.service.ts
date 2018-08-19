import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericDataEntry } from '../generic-data/generic-data-entry.model';
import { GenericDataEntryService } from '../generic-data/generic-data-entry.service';
import { FinanceProfile } from './finance-profile.model';
import * as moment from 'moment';
import { GenericDataType } from '../generic-data/generic-data-type.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  
  
  private _financeProfile: BehaviorSubject<GenericDataEntry> = new BehaviorSubject(null);

  constructor(private dataService: GenericDataEntryService) { 
    this.dataService.allUserDataEntries.subscribe((dataEntries)=>{
      const financeProfile = this.findFinanceProfile(dataEntries);
      if(financeProfile){
        this._financeProfile.next(financeProfile);
      }
    })
  }

  get financeProfile(): Observable<GenericDataEntry>{
    return this._financeProfile.asObservable();
  }


  private findFinanceProfile(dataEntries: GenericDataEntry[]): GenericDataEntry{
    for(let dataEntry of dataEntries){
      if(dataEntry.dataType === "FinanceProfile"){
        return dataEntry;
      }
    }
    return null;
  }

  saveFinanceProfile(financeProfile: FinanceProfile){
    let financeDataEntry = new GenericDataEntry(null, null, moment().toISOString(), GenericDataType.FinanceProfile, financeProfile);
    this.dataService.saveDataObject(financeDataEntry);
  }
  updateFinanceProfile(financeProfile: FinanceProfile){
    let financeDataEntry = this._financeProfile.value;
    financeDataEntry.dateUpdatedISO = moment().toISOString();
    financeDataEntry.dataObject = financeProfile;
    this.dataService.updateDataEntryDataObject(financeDataEntry);
  }
}

