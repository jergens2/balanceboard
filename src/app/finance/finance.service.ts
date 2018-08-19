import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { GenericDataEntryService } from '../services/generic-data-entry.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  
  
  private _financeProfile: BehaviorSubject<GenericDataEntry> = new BehaviorSubject(null);

  constructor(private dataService: GenericDataEntryService) { 
    this.dataService.allUserDataEntries.subscribe((dataEntries)=>{
      console.log("finance service dataEntries: ", dataEntries)
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
    console.log(dataEntries)
    for(let dataEntry of dataEntries){
      if(dataEntry.dataType = "FinanceProfile"){
        console.log(dataEntry)
        return dataEntry;
      }
    }
    return null;
  }
}


