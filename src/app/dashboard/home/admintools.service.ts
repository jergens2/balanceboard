import { Injectable } from '@angular/core';
import { serverUrl } from '../../serverurl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ActivityCategoryDefinition } from '../activities/api/activity-category-definition.class';
import { ActivityCategoryDefinitionHttpShape } from '../activities/api/activity-category-definition-http-shape.interface';
import { ActivityDurationSetting } from '../activities/api/activity-duration.enum';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AdmintoolsService {

  constructor(private httpClient: HttpClient) { }

  public doTheThing$() {
    console.log("Doing the thing")
    const getUrl = serverUrl + "/api/timelogEntry/" + "5b9c362dd71b00180a7cf701" + "/" + moment().startOf("year").subtract(1, "month").toISOString() + "/" + moment().endOf("year").toISOString();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'  
      })
    };
    return this.httpClient.get<{ message: string, data: any }>(getUrl, httpOptions)
      
  }



}
