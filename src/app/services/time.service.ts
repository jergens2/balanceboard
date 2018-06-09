import { Moment } from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventActivity } from './../models/event-activity.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import * as moment from 'moment';

@Injectable()
export class TimeService {

  constructor(private httpClient: HttpClient) {}

  serverUrl = "https://www.mashboard.app";
  now: Moment = moment();
  private activeDate: Moment = moment();

  private dayEventActivityStartTime: Moment;
  private dayEventActivityEndTime: Moment;

  private eventList: EventActivity[] = [];

  getDate(): Moment{
    return this.now;
  }
  setActiveDate(date: Moment){
    this.activeDate = moment(date);
  }

  getActiveDate(): Moment{
    return this.activeDate;
  }

  setDayEventActivityTimes(startTime: Moment, endTime: Moment){
    this.dayEventActivityStartTime = startTime;
    this.dayEventActivityEndTime = endTime;
  }
  getDayEventActivityStartTime(): Moment{
    return this.dayEventActivityStartTime;
  }
  getDayEventActivityEndTime(): Moment{
    return this.dayEventActivityEndTime;
  }
  saveEventActivity(event: EventActivity){
    //receives EventActivity object from EventActivity-form modal, then saves it to database
    // Regarding Date objects / types:  use the toJSON() method to pass via JSON object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON
    
    const postUrl = this.serverUrl + "/event/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    let request = this.httpClient.post<EventActivity>(postUrl,event,httpOptions)
      .subscribe((response) => {
        //an observable must be subscribed to in order to work, apparently.
        console.log(response)
      })

    // console.log(request);
    return request;
  }

  getEventActivitysByDateRange(startDate: Moment, endDate: Moment): Observable<EventActivity[]> {
    const getUrl = this.serverUrl + "/event/byDate";
    const body = {
      'startDate':startDate.format('YYYY-MM-DD'),
      'endDate':endDate.format('YYYY-MM-DD')
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    return this.httpClient.post<EventActivity[]>(getUrl, body, httpOptions)
      .map((events: any) => {
        let newEventActivityList = [];
        for(let event of events){
          // console.log(event);
          // console.log(event.startTime, event.endTime)
          let newEventActivityObject = new EventActivity(
            moment(event.startTime),
            moment(event.endTime),
            event.description,
            event.category
          ) 
          newEventActivityList.push(event);
        }
        this.eventList = newEventActivityList;
        // console.log(this.eventList);
        return this.eventList;
      })
    
  }
}
