import { Moment } from 'moment';
import { Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventActivity } from './../models/event-activity.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import 'rxjs/Rx';
import * as moment from 'moment';

@Injectable()
export class TimeService {

  constructor(private httpClient: HttpClient) { }

  serverUrl = "https://www.mashboard.app";
  now: Moment = moment();
  private activeDate: Moment = moment();

  eventListSubject: Subject<EventActivity[]> = new Subject<EventActivity[]>();
  private eventList: EventActivity[] = [];
  private activeEvent: EventActivity;
  private eventMode: string;

  

  getActiveEvent(): { event: EventActivity, mode: string } {
    return { event: this.activeEvent, mode: this.eventMode };
  }
  setActiveEvent(event: EventActivity, mode: string) {
    this.activeEvent = event;
    this.eventMode = mode;
  }

  getDate(): Moment {
    return this.now;
  }
  setActiveDate(date: Moment) {
    this.activeDate = moment(date);
  }

  getActiveDate(): Moment {
    return this.activeDate;
  }

  saveEventActivity(event: EventActivity) {

    const postUrl = this.serverUrl + "/api/event/create";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(postUrl, event, httpOptions)
      .subscribe((event: any) => {
        this.eventList.push(this.mapEvent(event));
        this.eventListSubject.next(this.eventList);
      })
  }

  mapEvent(event: any): EventActivity{
    return new EventActivity(
      event._id,
      moment(event.startTime),
      moment(event.endTime),
      event.description,
      event.category
    )
  }

  deleteEvent(event: EventActivity) {
    const postUrl = this.serverUrl + "/api/event/" + event.id + '/delete';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(postUrl, {}, httpOptions)
      .subscribe(
         (response: any) => {
          //This is probably not the appropriate way to receive the response, using the if statement but for now it works. 
          if(response.message === 'Event successfully deleted'){
            this.eventList.splice(this.eventList.indexOf(event),1);
            this.eventListSubject.next(this.eventList);
          }
          
          ///this.eventList = events;
          
          //this.eventListSubject.next(this.eventList);
         } 
      );

  }

  getEventActivitysByDateRange(startDate: Moment, endDate: Moment){
    const getUrl = this.serverUrl + "/api/event/byDate";
    const body = {
      'startDate': startDate.format('YYYY-MM-DD'),
      'endDate': endDate.format('YYYY-MM-DD')
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        observe: 'response'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post(getUrl, body, httpOptions)
      .map((response: Response) => {
        let events = response as any;
        let newEventActivityList = [];
        for (let event of events) {
          newEventActivityList.push(this.mapEvent(event))
        }
        this.eventList = newEventActivityList;
        return this.eventList;
      })
      .subscribe(
        (events: EventActivity[]) => {
          this.eventList = events;
          this.eventListSubject.next(this.eventList);
        }
      )
    //.subscribe(data => console.log("subscription data:" ,data));    
  }
}
