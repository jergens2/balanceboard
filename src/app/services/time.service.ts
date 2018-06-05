import { Moment } from 'moment';
import { HttpClient } from '@angular/common/http';
import { Event } from './../models/event.model';
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

  private dayEventStartTime: Moment;
  private dayEventEndTime: Moment;

  private eventList: Event[] = [];

  getDate(): Moment{
    return this.now;
  }
  setActiveDate(date: Moment){
    this.activeDate = moment(date);
  }

  getActiveDate(): Moment{
    return this.activeDate;
  }

  setDayEventTimes(startTime: Moment, endTime: Moment){
    this.dayEventStartTime = startTime;
    this.dayEventEndTime = endTime;
  }
  getDayEventStartTime(): Moment{
    return this.dayEventStartTime;
  }
  getDayEventEndTime(): Moment{
    return this.dayEventEndTime;
  }
  saveEvent(Event: Event){
    //receives Event object from Event-form modal, then saves it to database
    // Regarding Date objects / types:  use the toJSON() method to pass via JSON object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON
    
    
    
  }


  getEventsByDate(date: Moment): Observable<Event[]> {

    // as of 2018-06-05: 
    // NOT IMPLEMENTED:  this method receives a date parameter but does nothing with it at this time.
    // the server API does not implement a method that takes a date yet, so now this.method just gives ALL events


    const getUrl = this.serverUrl + "/event";
    return this.httpClient.get<Event[]>(getUrl);
      // .map((value: Event[], index: number) => {
      //   const events = value;
      //   this.eventList = value;
      //   console.log(this.eventList);
      //   return this.eventList;
      // })
      // .map((response: Response) => {
        
      //   const events = response.body;
      //   for(let event of events){

      //   }
      //   console.log(products);
      //   // let transformedProducts: Product[] = [];
      //   // for (let product of products) {
      //   //   transformedProducts.push(new Product(
      //   //     product.uniqueName,
      //   //     product.displayName,
      //   //     product.shortDescription,
      //   //     product.longDescription,
      //   //     product.imagePath,
      //   //     product.priceCanadian,
      //   //     product.category,
      //   //     10
      //   //   ));
      //   // }
      //   // this.productsList = transformedProducts;
      //   // return this.productsList;
      // })
      // .catch((error: Response) => {
      //   // this.errorService.handleError(error.json());
      //   console.log("there was an error getting events");
      //   return Observable.throw(error.json())
      // });
      

  }



}
