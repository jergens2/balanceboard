import { serverUrl } from '../serverurl';
import { Moment } from 'moment';
import { Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventActivity } from '../models/event-activity.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class TimeService {

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  private serverUrl = serverUrl;
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
    this.httpClient.post<{ message: string, data: any }>(postUrl, event, httpOptions)
      .pipe(map((response) => {
        let responseEvent = response.data;
        return new EventActivity(responseEvent._id, responseEvent.userId, responseEvent.startTime, responseEvent.endTime, responseEvent.description, responseEvent.category);
      }))
      .subscribe((event: EventActivity) => {
        this.eventList.push(event);
        this.eventListSubject.next([...this.eventList]);
      })
  }


  deleteEvent(event: EventActivity) {

    //To do:  change this method from a POST request to a DELETE request

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
          if (response.message === 'Event successfully deleted') {
            this.eventList.splice(this.eventList.indexOf(event), 1);
            this.eventListSubject.next([... this.eventList]);
          }
        }
      );

  }

  getEventActivitysByDateRange(startDate: Moment, endDate: Moment) {
    const getUrl = this.serverUrl + "/api/event/byDate";
    const body = {
      'userId': this.authService.authenticatedUser.id,
      'startDate': startDate.toISOString(),
      'endDate': endDate.toISOString()
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // 'Authorization': 'my-auth-token'
      })
    };
    this.httpClient.post<{ message: string, data: any }>(getUrl, body, httpOptions)
      .pipe(map((response) => {
        // the following map function is specifically to map an Array of objects.  If the data is just a single object then the map() operator is not usable.
        return response.data.map(event => {
            return new EventActivity(event._id, event.userId, event.startTime, event.endTime, event.description, event.category);
        })
      }))
      .subscribe(
        (events: EventActivity[]) => {
          this.eventList = events;
          this.eventListSubject.next([...this.eventList]);
        }
      )
  }
}
