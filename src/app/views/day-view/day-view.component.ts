import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit, ViewChild, ElementRef, Input, Output, AfterViewInit, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { NgbModal, NgbActiveModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import { Moment } from "moment";

import { TimeService } from './../../services/time.service';
import { TimeSegment } from './time-segment.model';
import { EventRect } from './event-rect.model';
import { EventActivity } from './../../models/event-activity.model';

import { EventFormComponent } from './event-form/event-form.component';


@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('svgDayView') svgObject: ElementRef;

  handle: Subscription;
  pt: SVGPoint;

  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number;

  viewStartTime: Moment;
  viewEndTime: Moment;

  timeSegments: TimeSegment[];
  eventRects: EventRect[] = [];
  eventList: EventActivity[];
  
  marginLine : {
    x1: number,
    x2: number,
    y1: number,
    y2: number
  };

  activeEventActivityRect: EventRect;

  today: Moment;

  constructor(private timeService: TimeService, private authService: AuthenticationService, private modalService: NgbModal) { }

  ngOnInit() {
    
    this.today = this.timeService.getActiveDate();
    this.viewStartTime = moment(this.today).hour(7).minute(0).second(0).millisecond(0);
    this.viewEndTime = moment(this.today).hour(22).minute(0).second(0).millisecond(0);

    this.viewBoxHeight = 600;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;

    this.marginLine = {x1: 1, x2:2, y1:3, y2:4};
    
    this.timeSegments = this.calculateTimeSegments(this.viewBoxWidth, this.viewBoxHeight, this.viewStartTime, this.viewEndTime);
    this.timeService.getEventActivitysByDateRange(this.timeService.getActiveDate().startOf('day'), moment(this.timeService.getActiveDate()).endOf('day'));
    this.timeService.eventListSubject
      .subscribe(
        (eventList: EventActivity[]) => {
          this.eventList = eventList;
          this.eventRects = this.drawEventActivityRects(this.eventList);
        }
      )
  }

  ngAfterViewInit() {
    this.buildMouseEvents();
  }

  ngOnDestroy() {
    this.handle.unsubscribe();
  }

  

  calculateYFromEventActivityTime(timeISO: string): number {
    //this method as of 2018-03-13 does not produce an accurate location

    let time = moment(timeISO);
    const beginning = moment(time).hour(7).minute(0).second(0).millisecond(0);
    const end = moment(time).hour(23).minute(0).second(0).millisecond(0);
    const totalHeight = this.viewBoxHeight;
    const totalMinutes = moment.duration(end.diff(beginning)).asMinutes();
    const difference = moment.duration(time.diff(beginning)).asMinutes();
    const result = ((difference * totalHeight) / totalMinutes);
    if(result > totalHeight){ 
      return totalHeight;
    }else if(result < 0){
      return 0;
    }else{
      return result;
    }
  }


  drawEventActivityRects(eventList: EventActivity[]): EventRect[] {
    let eventRects: EventRect[] = [];
    for (let event of eventList) {
      let eventRect = new EventRect();
      eventRect.x = .2 * this.viewBoxWidth + 10;
      eventRect.width = this.viewBoxWidth - (3*10) - (.2*this.viewBoxWidth);
      eventRect.y = this.calculateYFromEventActivityTime(event.startTimeISO);
      eventRect.y = eventRect.y < 0 ? 0 : eventRect.y;
      eventRect.height = this.calculateYFromEventActivityTime(event.endTimeISO) - eventRect.y;
      if((eventRect.y + eventRect.height) > this.viewBoxHeight ){
        eventRect.height = this.viewBoxHeight;
      }
      if(eventRect.height < 0){
        eventRect.height = this.viewBoxHeight;
      }
      eventRect.rx = 1;
      eventRect.ry = 1;
      eventRect.style = {
        "fill": "blue",
        "stroke": "black",
        "stroke-width": "2",
        "fill-opacity": "0.2"
      }
      eventRect.eventActivity = event;
      eventRects.push(eventRect)
    }
    return eventRects;
  }



  buildMouseEvents() {
    this.pt = this.svgObject.nativeElement.createSVGPoint();

    const down = Observable.fromEvent(this.svgObject.nativeElement, 'mousedown')
      .do((md: MouseEvent) => {
        this.initiateEventActivityRect(this.getCursorPt(md));
        md.preventDefault();
      });
    const move = Observable.fromEvent(document, 'mousemove')
      .do((mm: MouseEvent) => mm.preventDefault());
    const up = Observable.fromEvent(document, 'mouseup')
      .do((mu: MouseEvent) => {
        this.createNewEventModal(this.getCursorPt(mu), this.viewStartTime, this.viewEndTime, this.viewBoxHeight);
        mu.preventDefault()
      });

    const drag = down.mergeMap((md: MouseEvent) => {
      return move.startWith(md).takeUntil(up.take(1));
    });

    this.handle = drag
      .subscribe((md: MouseEvent) => {
        this.updateActiveActivtyRect(this.getCursorPt(md))
      });
  }
  getCursorPt(me: MouseEvent): SVGPoint {
    let cursorPt: SVGPoint;
    this.pt.x = me.clientX;
    this.pt.y = me.clientY;
    cursorPt = this.pt.matrixTransform(
      this.svgObject.nativeElement.getScreenCTM().inverse()
      //at this pont the cursorPt provides accurate SVG coordinates within the SVG object
    );
    return cursorPt;
  }
  initiateEventActivityRect(cursorPt: SVGPoint) {
    this.activeEventActivityRect = new EventRect();
    this.activeEventActivityRect.x = .2 * this.viewBoxWidth + 10;
    this.activeEventActivityRect.width = this.viewBoxWidth - (3*10) - (.2*this.viewBoxWidth);
    this.activeEventActivityRect.y = cursorPt.y;
    this.activeEventActivityRect.height = 0;
    this.activeEventActivityRect.rx = 1;
    this.activeEventActivityRect.ry = 1;
    this.activeEventActivityRect.style = {
      "fill": "red",
      "stroke": "black",
      "stroke-width": "2",
      "fill-opacity": "0.2"
    }
  }
  updateActiveActivtyRect(cursorPt: SVGPoint) {
    if (cursorPt.y < this.activeEventActivityRect.y) {
      let height = this.activeEventActivityRect.y - cursorPt.y;
      this.activeEventActivityRect.y = cursorPt.y;
      this.activeEventActivityRect.height = height;
    } else {
      this.activeEventActivityRect.height = cursorPt.y - this.activeEventActivityRect.y;
    }

  }
  finalizeActiveEventActivityRect(result: any) {
    if (result.message === 'cancelled') {
      this.activeEventActivityRect = null;
    } else if (result.message === 'success') {
      this.timeService.saveEventActivity(result.data);
      this.activeEventActivityRect = null;
    } else {

    }
  }
  createNewEventModal(cursorPt: SVGPoint, dayStartTime: Moment, dayEndTimeShort: Moment, height: number) {
    if (cursorPt.y <= this.activeEventActivityRect.y) {
      //in this case, the cursor is above the original start point.  
    } else {

      let dayEndTime = moment(dayEndTimeShort).add(1, 'hour');
      const totalMinutes = moment.duration(dayEndTime.diff(dayStartTime)).asMinutes();

      const startMinutes = ((this.activeEventActivityRect.y) * totalMinutes) / height;
      const endMinutes = ((this.activeEventActivityRect.y + this.activeEventActivityRect.height) * totalMinutes) / height;
      const startTime: Moment = moment(dayStartTime).add(startMinutes, 'minute');
      const endTime: Moment = moment(dayStartTime).add(endMinutes, 'minute');
      let activeEvent = new EventActivity('', this.authService.getAuthenticatedUser().id, startTime.toISOString(), endTime.toISOString(), '', '');

      this.timeService.setActiveEvent(activeEvent, 'create');

      const modalRef = this.modalService.open(EventFormComponent, { centered: true, keyboard: false, backdrop: 'static' });
      modalRef.result.then((result) => {
        this.finalizeActiveEventActivityRect(result);
      }).catch((error) => { });
    }


  }

  calculateTimeSegments(width: number, height: number, startTime: Moment, endTime: Moment): TimeSegment[] {


    const startHour = startTime.hour();
    const endHour = endTime.hour();

    //increments is multiplied by 2 to allow an extra division for every half hour.  In the future it may be preferrable to make this a dynamic variable or a parameter to determine if it is broken down by half hour incrememnts
    const increments = ((endHour - startHour) + 1) * 2;
    const incrementHeight = (height) / increments;

    let timeSegments: TimeSegment[] = [];
    let currentHour = startHour;
    let currentTime: Moment = moment(this.today).hours(currentHour).minutes(0).seconds(0);

    for (let increment = 0; increment < increments; increment++) {
      let x = 0;
      let y = 0 + (increment * incrementHeight);
      let timeSegment: TimeSegment = new TimeSegment();
      timeSegment.dateTime = moment(currentTime);
      timeSegment.path = 'M ' + x + ' ' + y + 
        ' L ' + x + ' ' + (y+incrementHeight) + 
        ' L ' + (width) + ' ' + (y+incrementHeight) + 
        ' L ' + (width) + ' ' + y + 
        ' Z ' ; 
      timeSegment.style = {
          "stroke": "black",
          "stroke-width": "0.5",
          "fill":"black",
          "fill-opacity":"0.1"
      }
      timeSegment.text_x = (incrementHeight/2);
      timeSegment.text_y = y + (incrementHeight * .75);
      timeSegment.text_string = timeSegment.dateTime.minute() == 0 ? timeSegment.dateTime.format('h:mm a') : ''
      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
    this.marginLine.x1 = .2 * width;
    this.marginLine.x2 = this.marginLine.x1;
    this.marginLine.y1 = 0;
    this.marginLine.y2 = height;
    return timeSegments;

  }

  onClick(eventRect: EventRect) {
    this.timeService.setActiveEvent(eventRect.eventActivity, 'modify');
    this.modalService.open(EventFormComponent, { centered: true, keyboard: false, backdrop: 'static' })
      .result.then((result) => {
        if (result.message === 'delete') {
          this.timeService.deleteEvent(result.data);
        }
      }).catch((error) => { });
  }

  onMouseEnter(eventRect: EventRect) {
    eventRect.style = {
      "cursor": "pointer",
      "fill": "yellow",
      "stroke": "red",
      "stroke-width": "4",
      "fill-opacity": "0.2"
    }
  }

  onMouseLeave(eventRect) {
    eventRect.style = {
      "fill": "blue",
      "stroke": "black",
      "stroke-width": "1",
      "fill-opacity": "0.2"
    }
  }

}
