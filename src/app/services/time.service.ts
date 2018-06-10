import { Moment } from 'moment';
import { Response } from '@angular/http';
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

  private eventList: EventActivity[] = [];
  private activeEvent: EventActivity;
  private eventMode: string;

  getActiveEvent(): {event: EventActivity, mode: string}{
    return { event: this.activeEvent, mode: this.eventMode};
  }
  setActiveEvent(event: EventActivity, mode: string){
    this.activeEvent = event;
    this.eventMode = mode;
  }

  getDate(): Moment{
    return this.now;
  }
  setActiveDate(date: Moment){
    this.activeDate = moment(date);
  }

  getActiveDate(): Moment{
    return this.activeDate;
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

  deleteEvent(event: EventActivity){
    console.log(event);
    const postUrl = this.serverUrl + "/event/" + event.id + '/delete';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    return this.httpClient.post(postUrl, {}, httpOptions)
  }

    getEventActivitysByDateRange(startDate: Moment, endDate: Moment): Observable<EventActivity[]> {
    const getUrl = this.serverUrl + "/event/byDate";
    const body = {
      'startDate':startDate.format('YYYY-MM-DD'),
      'endDate':endDate.format('YYYY-MM-DD')
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        observe: 'response'
        // 'Authorization': 'my-auth-token'
      })
    };
    return this.httpClient.post(getUrl, body, httpOptions)
      .map((response: Response) => {
        let events = response as any; 
        let newEventActivityList = [];
        for(let event of events){
          newEventActivityList.push(new EventActivity(
            event._id,
            moment(event.startTime),
            moment(event.endTime),
            event.description,
            event.category
            )
          )
        }
        this.eventList = newEventActivityList;
        return this.eventList;
      })
      //.subscribe(data => console.log("subscription data:" ,data));    
  }
}
