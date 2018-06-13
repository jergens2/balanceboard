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

  timeSegments: TimeSegment[];
  eventRects: EventRect[] = [];
  eventList: EventActivity[];

  activeEventActivityRect: EventRect;

  today: Moment;

  constructor(private timeService: TimeService, private modalService: NgbModal) { }

  ngOnInit() {
    this.viewBoxHeight = 400;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 " + this.viewBoxWidth + " " + this.viewBoxHeight;
    this.today = this.timeService.getActiveDate();
    this.timeSegments = this.calculateTimeSegments();
    this.timeService.eventListSubject
      .subscribe(
        (eventList: EventActivity[]) => {
          this.eventList = eventList;
          this.eventRects = this.drawEventActivityRects(this.eventList);
        }
      )
    this.timeService.getEventActivitysByDateRange(this.timeService.getActiveDate(), moment(this.timeService.getActiveDate()).add(1, 'day').hour(0).minute(0).second(0).millisecond(0));
  }

  calculateYFromEventActivityTime(time: Moment): number {
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
      eventRect.x = 0 + 100;
      eventRect.width = this.viewBoxWidth - 150;
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

  ngAfterViewInit() {
    this.buildMouseEvents();

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
    this.activeEventActivityRect.x = 0 + 100;
    this.activeEventActivityRect.width = this.viewBoxWidth - 150;
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

  ngOnDestroy() {
    this.handle.unsubscribe();
  }

  calculateTimeSegments(): TimeSegment[] {

    const padding: number = 10;

    const startHour = 7;
    const endHour = 21;

    const increments = (((endHour + 1) - startHour) * 2) - 1;
    const incrementMinutes = 30;
    const segmentHeight = (this.viewBoxHeight - (padding * 2)) / increments;

    let timeSegments: TimeSegment[] = [];
    let currentHour = startHour;
    let currentTime: moment.Moment = this.today.hours(currentHour).minutes(0).seconds(0);;

    for (let increment = 0; increment < increments; increment++) {
      let timeSegment: TimeSegment = new TimeSegment();

      timeSegment.dateTime = currentTime.toDate();

      timeSegment.line_x1 = 0 + padding + 80;
      timeSegment.line_x2 = this.viewBoxWidth - padding;
      timeSegment.line_y1 = (padding * 2) + (increment * segmentHeight);
      timeSegment.line_y2 = timeSegment.line_y1;
      timeSegment.text_x = timeSegment.line_x1 - 80;
      timeSegment.text_y = timeSegment.line_y1 - 15;
      if (currentTime.minutes() === 0) {
        //  I added 1 hour because something about this arithmetic produces the line segments that do not line up with the hours, so I simply added 1 hour here.  
        //  This should probably be revisited to be more robust going forward, especially if the display should have dynamically settable start and end hours
        if (currentTime.hour() === 7) {
          //quick hack to get rid of the hour 7 label.
          timeSegment.text_string = "";
        } else {
          timeSegment.text_string = currentTime.clone().format('h:mm a');
        }
      } else {
        timeSegment.text_string = "";
      }

      timeSegment.style = {
        "stroke": "black",
        "stroke-width": "0.5px"
      }

      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
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
