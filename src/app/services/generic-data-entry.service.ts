import { serverUrl } from '../serverurl';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthStatus } from '../authentication/auth-status.model';


@Injectable()
export class GenericDataEntryService {


  constructor(private httpClient: HttpClient, private authService: AuthenticationService) {
    this.authService.authStatus.subscribe((authStatus: AuthStatus)=>{
      if(authStatus.isAuthenticated){
        this.fetchAllUserDataObjects(authStatus.user);
      }else{
        console.log("dataService constructor: not authenticated");
      }      
    })
  }


  private serverUrl: string = serverUrl;

  private _userGenericDataEntriesSubject: BehaviorSubject <GenericDataEntry[]> = new BehaviorSubject<GenericDataEntry[]>([]); 

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
      return new GenericDataEntry(response.data._id, response.data.userId, response.data.createdTimeISO, response.data.dataType, response.data.dataObject);
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
          return new GenericDataEntry(dataObject._id, dataObject.userId, dataObject.createdTimeISO, dataObject.dataType, dataObject.dataObject);
        })
      }))
      .subscribe((dataEntries: GenericDataEntry[])=>{
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
        return new GenericDataEntry(response.data._id, response.data.userId, response.data.createdTimeISO, response.data.dataType, response.data.dataObject);
      }))
    .subscribe((receivedDataEntry: GenericDataEntry)=>{
      let dataEntries = this._userGenericDataEntriesSubject.getValue();
      dataEntries.splice(dataEntries.indexOf(dataEntry),1,receivedDataEntry)
      this._userGenericDataEntriesSubject.next(dataEntries);
    });
  }

}
