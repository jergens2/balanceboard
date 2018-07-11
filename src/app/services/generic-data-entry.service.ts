import { GenericDataEntry } from './../models/generic-data-entry.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class GenericDataEntryService {

  serverUrl: string = "http://localhost:3000";
  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  saveDataObject(dataObject: GenericDataEntry){
    console.log("data service object", dataObject);
    const postUrl = this.serverUrl + "/api/genericData/create"; 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(postUrl, dataObject, httpOptions).subscribe((response)=>{
      console.log("response is ", response)
    })


  }

}
