import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { GenericDataEntry } from '../models/generic-data-entry.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class GenericDataEntryService {


  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }


  // serverUrl: string = "https://www.mashboard.app";
  serverUrl: string = "http://localhost:3000";

  userGenericDataEntries: GenericDataEntry[] = [];
  userGenericDataEntriesSubject: Subject <GenericDataEntry[]> = new Subject<GenericDataEntry[]>(); 


  saveDataObject(dataObject: GenericDataEntry){
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
      this.userGenericDataEntries.splice(this.userGenericDataEntries.indexOf(dataObject),1,receivedDataEntry)
      this.userGenericDataEntriesSubject.next([...this.userGenericDataEntries]);
    });
  }

  getDataObjectsByUser(authenticatedUser: User){
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
        this.userGenericDataEntries = dataEntries;
        this.userGenericDataEntriesSubject.next([...this.userGenericDataEntries]);
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
      this.userGenericDataEntries.splice(this.userGenericDataEntries.indexOf(dataEntry),1,receivedDataEntry)
      this.userGenericDataEntriesSubject.next([...this.userGenericDataEntries]);
    });
  }

}
