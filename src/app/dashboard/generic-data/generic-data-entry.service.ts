import { serverUrl } from '../../serverurl';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { GenericDataEntry } from './generic-data-entry.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AuthStatus } from '../../authentication/auth-status.model';
import { GenericDataType } from './generic-data-type.model';


@Injectable()
export class GenericDataEntryService {


  constructor(private httpClient: HttpClient, private authService: AuthenticationService) {
    console.log("Data entry service constructor has been called");
    this.authService.authStatus.subscribe((authStatus: AuthStatus)=>{
      if(authStatus.isAuthenticated){
        this.fetchAllUserDataObjects(authStatus.user);
      }else{
        console.log("dataService constructor: not authenticated");
        this.logout();
      }      
    })
  }


  private serverUrl: string = serverUrl;

  private _userGenericDataEntriesSubject: BehaviorSubject <GenericDataEntry[]> = new BehaviorSubject<GenericDataEntry[]>([]); 

  private logout(){
    console.log("data service: logging out, nexting with empty array []")
    this._userGenericDataEntriesSubject.next([]);
    console.log(this._userGenericDataEntriesSubject.value);
    console.log(this._userGenericDataEntriesSubject.getValue());
  }

  get allUserDataEntries(): Observable<GenericDataEntry[]>{
    return this._userGenericDataEntriesSubject.asObservable();
  }

  saveDataObject(dataObject: GenericDataEntry){
    dataObject.userId = this.authService.authenticatedUser.id;
    const postUrl = this.serverUrl + "/api/genericData/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, dataObject, httpOptions)
    .pipe(map((response) => {
      return new GenericDataEntry(response.data._id, response.data.userId, response.data.dateUpdatedISO, this.getDataType(response.data.dataType), response.data.dataObject);
    }))
    .subscribe((receivedDataEntry: GenericDataEntry)=>{
      let dataEntries = this._userGenericDataEntriesSubject.getValue();
      dataEntries.splice(dataEntries.indexOf(dataObject),1,receivedDataEntry)
      this._userGenericDataEntriesSubject.next(dataEntries);
    });
  }

  private fetchAllUserDataObjects(authenticatedUser: User){
    const getUrl = this.serverUrl + "/api/genericData/byUser/" + authenticatedUser.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      .pipe(map((response) => {
        return response.data.map((dataObject) => {
          return new GenericDataEntry(dataObject._id, dataObject.userId, dataObject.dateUpdatedISO, this.getDataType(dataObject.dataType), dataObject.dataObject);
        })
      }))
      .subscribe((dataEntries: GenericDataEntry[])=>{
        console.log(dataEntries);
        this._userGenericDataEntriesSubject.next(dataEntries);
      });

  }

  updateDataEntryDataObject(dataEntry: GenericDataEntry){
    const postUrl = this.serverUrl + "/api/genericData/update/" + dataEntry.id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, dataEntry, httpOptions)
      .pipe(map((response) => {
        return new GenericDataEntry(response.data._id, response.data.userId, response.data.dateUpdatedISO, this.getDataType(response.data.dataType), response.data.dataObject);
      }))
    .subscribe((receivedDataEntry: GenericDataEntry)=>{
      let dataEntries = this._userGenericDataEntriesSubject.getValue();
      dataEntries.splice(dataEntries.indexOf(dataEntry),1,receivedDataEntry)
      this._userGenericDataEntriesSubject.next(dataEntries);
    });
  }

  getDataType(dataType: string): GenericDataType{
    if(dataType === 'IvyLeeTaskList'){
      return GenericDataType.IvyLeeTaskList;
    }
    if(dataType === 'HealthProfile'){
      return GenericDataType.HealthProfile;
    }
    if(dataType === 'FinanceProfile'){
      return GenericDataType.FinanceProfile;
    }
    return GenericDataType.Unspecified;
  }

}
