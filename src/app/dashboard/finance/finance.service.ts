import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { GenericDataEntry } from '../generic-data/generic-data-entry.model';
// import { GenericDataEntryService } from '../generic-data/generic-data-entry.service';
import { FinanceProfile } from './finance-profile.model';
import * as moment from 'moment';
// import { GenericDataType } from '../generic-data/generic-data-type.model';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AuthStatus } from '../../authentication/auth-status.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  
  
  // private _financeProfile: BehaviorSubject<GenericDataEntry> = new BehaviorSubject(null);

  // constructor(private dataService: GenericDataEntryService, private authService: AuthenticationService) { 
    // console.log("Finance service constructor has been called");
    // this.dataService.allUserDataEntries.subscribe((dataEntries)=>{
    //   console.log("finance service subscribing to data entries from data service: ", dataEntries);
    //   const financeProfile = this.findFinanceProfile(dataEntries);
    //   if(financeProfile){
    //     this._financeProfile.next(financeProfile);
    //   }
    // })
//     this.authService.authStatus.subscribe((authStatus: AuthStatus)=>{
//       /*
//         2018-09-26
//         Adding auth service and then subscribing to the status allows us to clear any data in the BehaviorSubject by calling next(null).
//         Perhaps this is sloppy as it requires each service that is holding data to subscribe to the authStatus but maybe this is the best way to do this.
        
//       */
//       if(authStatus.isAuthenticated){
        
//       }else{
//         this.logout();
//       }      
//     })

//   }

//   private logout(){
//     this._financeProfile.next(null);
//   }

//   get financeProfile(): Observable<GenericDataEntry>{
//     return this._financeProfile.asObservable();
//   }


//   private findFinanceProfile(dataEntries: GenericDataEntry[]): GenericDataEntry{
//     for(let dataEntry of dataEntries){
//       if(dataEntry.dataType === "FinanceProfile"){
//         return dataEntry;
//       }
//     }
//     return null;
//   }

//   saveFinanceProfile(financeProfile: FinanceProfile){
//     let financeDataEntry = new GenericDataEntry(null, null, moment().toISOString(), GenericDataType.FinanceProfile, financeProfile);
//     this.dataService.saveDataObject(financeDataEntry);
//   }
//   updateFinanceProfile(financeProfile: FinanceProfile){
//     let financeDataEntry = this._financeProfile.value;
//     financeDataEntry.dateUpdatedISO = moment().toISOString();
//     financeDataEntry.dataObject = financeProfile;
//     this.dataService.updateDataEntryDataObject(financeDataEntry);
//   }
}

