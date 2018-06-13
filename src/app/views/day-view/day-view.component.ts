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

  constructor(private timeService: TimeService, private modalService: NgbModal) { }

  ngOnInit() {
    
    this.today = this.timeService.getActiveDate();
    this.viewStartTime = moment(this.today).hour(7).minute(0).second(0).millisecond(0);
    this.viewEndTime = moment(this.today).hour(22).minute(0).second(0).millisecond(0);

    this.viewBoxHeight = 700;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;

    this.marginLine = {x1: 1, x2:2, y1:3, y2:4};
    
    this.timeSegments = this.calculateTimeSegments(this.viewBoxWidth, this.viewBoxHeight, this.viewStartTime, this.viewEndTime);
    this.timeService.eventListSubject
      .subscribe(
        (eventList: EventActivity[]) => {
          this.eventList = eventList;
          this.eventRects = this.drawEventActivityRects(this.eventList);
        }
      )
    this.timeService.getEventActivitysByDateRange(this.timeService.getActiveDate(), moment(this.timeService.getActiveDate()).add(1, 'day').hour(0).minute(0).second(0).millisecond(0));
  }

  ngAfterViewInit() {
    this.buildMouseEvents();
  }

  ngOnDestroy() {
    this.handle.unsubscribe();
  }

  

  calculateYFromEventActivityTime(time: Moment): number {
    //this method as of 2018-03-13 does not produce an accurate location
    const padding: number = 10;
    const beginning = moment(time).hour(7).minute(0).second(0).millisecond(0);
    const end = moment(time).hour(21).minute(0).second(0).millisecond(0);
    const totalHeight = (this.viewBoxHeight - (padding * 2));
    const totalMinutes = moment.duration(end.diff(beginning)).asMinutes();
    const difference = moment.duration(time.diff(beginning)).asMinutes();
    const result = (difference * totalHeight) / totalMinutes;
    return result;
  }


  drawEventActivityRects(eventList: EventActivity[]): EventRect[] {
    let eventRects: EventRect[] = [];
    for (let event of eventList) {
      let eventRect = new EventRect();
      eventRect.x = .2 * this.viewBoxWidth + 10;
      eventRect.width = this.viewBoxWidth - (3*10) - (.2*this.viewBoxWidth);
      eventRect.y = this.calculateYFromEventActivityTime(event.startTime);
      eventRect.y = eventRect.y < 0 ? 0 : eventRect.y;
      eventRect.height = this.calculateYFromEventActivityTime(event.endTime) - eventRect.y;
      eventRect.height = eventRect.height < 0 ? 0 : eventRect.height;
      eventRect.rx = 1;
      eventRect.ry = 1;
      eventRect.style = {
        "fill": "blue",
        "stroke": "black",
        "stroke-width": "1",
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
        this.createNewEventModal(this.getCursorPt(mu));
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
  createNewEventModal(cursorPt: SVGPoint) {
    if (cursorPt.y <= this.activeEventActivityRect.y) {
      //in this case, the cursor is above the original start point.  
    } else {
      //
      // Need up clean up the next section:  change to variables to work dynamically, not on static values
      //

      const padding: number = 10;
      const totalHeight = (this.viewBoxHeight - (padding * 2));
      const totalMinutes = 29 * 30;  //29 increments * 30 minutes of time each
      const startMinutes = totalMinutes * (this.activeEventActivityRect.y / totalHeight);
      const endMinutes = totalMinutes * (this.activeEventActivityRect.y + this.activeEventActivityRect.height) / totalHeight;

      const startTime: moment.Moment = this.timeService.getActiveDate().clone().hour(7).minute(0).second(0).millisecond(0).add(startMinutes, 'minute');
      const endTime: moment.Moment = this.timeService.getActiveDate().clone().hour(7).minute(0).second(0).millisecond(0).add(endMinutes, 'minute');
      let activeEvent = new EventActivity('', startTime, endTime, '', '');

      this.timeService.setActiveEvent(activeEvent, 'create');

      const modalRef = this.modalService.open(EventFormComponent, { centered: true, keyboard: false, backdrop: 'static' });

      //
      // end of section to be cleaned
      //


      modalRef.result.then((result) => {
        this.finalizeActiveEventActivityRect(result);
      }).catch((error) => { });
    }


  }

  calculateTimeSegments(width: number, height: number, startTime: Moment, endTime: Moment): TimeSegment[] {

    const padding: number = 10;

    const startHour = startTime.hour();
    const endHour = endTime.hour();

    //increments is multiplied by 2 to allow an extra division for every half hour.  In the future it may be preferrable to make this a dynamic variable or a parameter to determine if it is broken down by half hour incrememnts
    const increments = ((endHour - startHour) + 1) * 2;
    const incrementHeight = (height - (padding * 2)) / increments;

    let timeSegments: TimeSegment[] = [];
    let currentHour = startHour;
    let currentTime: Moment = moment(this.today).hours(currentHour).minutes(0).seconds(0);

    for (let increment = 0; increment < increments; increment++) {
      let x = 0 + padding;
      let y = 0 + padding + (increment * incrementHeight);
      let timeSegment: TimeSegment = new TimeSegment();
      timeSegment.dateTime = moment(currentTime);
      timeSegment.path = 'M ' + x + ' ' + y + 
        ' L ' + x + ' ' + (y+incrementHeight) + 
        ' L ' + (width-padding) + ' ' + (y+incrementHeight) + 
        ' L ' + (width-padding) + ' ' + y + 
        ' Z ' ; 
      timeSegment.style = {
          "stroke": "black",
          "stroke-width": "0.5",
          "fill":"black",
          "fill-opacity":"0.1"
      }
      timeSegment.text_x = padding + (incrementHeight/2);
      timeSegment.text_y = y + (incrementHeight * .75);
      timeSegment.text_string = timeSegment.dateTime.minute() == 0 ? timeSegment.dateTime.format('H:mm a') : ''
      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
    this.marginLine.x1 = .2 * width;
    this.marginLine.x2 = this.marginLine.x1;
    this.marginLine.y1 = 0+padding;
    this.marginLine.y2 = height-padding;
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
