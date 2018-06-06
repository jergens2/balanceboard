import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { NgbModal, NgbActiveModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';

import { TimeService } from './../../services/time.service';
import { TimeSegment } from './time-segment.model';
import { EventRect } from './event-rect.model';
import { Event } from './../../models/event.model';

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
  eventList: Event[];

  activeEventRect: EventRect;

  today: moment.Moment;

  constructor(private timeService:TimeService, private modalService: NgbModal) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    

    this.timeService.getEventsByDate(this.timeService.getActiveDate()).subscribe(        
      (eventList) => {
        console.log(eventList);
        this.today = this.timeService.getActiveDate();
        this.eventList = eventList;
        this.timeSegments = this.calculateTimeSegments();
      });
  }

  ngAfterViewInit(){
    this.pt = this.svgObject.nativeElement.createSVGPoint();

    const down = Observable.fromEvent(this.svgObject.nativeElement, 'mousedown')
      .do((md: MouseEvent) => {
        this.initiateEventRect(this.getCursorPt(md));
        md.preventDefault();
      });
    const move = Observable.fromEvent(document, 'mousemove')
      .do((mm: MouseEvent) => mm.preventDefault());
    const up = Observable.fromEvent(document, 'mouseup')
      .do((mu: MouseEvent) => {
        this.createModal(this.getCursorPt(mu));
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

  getCursorPt(me: MouseEvent): SVGPoint{
    let cursorPt: SVGPoint;
    this.pt.x = me.clientX;
    this.pt.y = me.clientY;
    cursorPt = this.pt.matrixTransform(
      this.svgObject.nativeElement.getScreenCTM().inverse()
      //at this pont the cursorPt provides accurate SVG coordinates within the SVG object
    );
    return cursorPt;
  }

  initiateEventRect(cursorPt: SVGPoint){
    this.activeEventRect = new EventRect();
    this.activeEventRect.x = 0 + 100;
    this.activeEventRect.width = this.viewBoxWidth - 150;
    this.activeEventRect.y = cursorPt.y;
    this.activeEventRect.height = 0;
    this.activeEventRect.rx = 1;
    this.activeEventRect.ry = 1;
    this.activeEventRect.style = {
      "fill":"red",
      "stroke":"black",
      "stroke-width":"2",
      "fill-opacity":"0.2"
    }
  }
  updateActiveActivtyRect(cursorPt: SVGPoint){
    if(cursorPt.y < this.activeEventRect.y){
      let height = this.activeEventRect.y - cursorPt.y;
      this.activeEventRect.y = cursorPt.y;
      this.activeEventRect.height = height;
    }else{
      this.activeEventRect.height = cursorPt.y - this.activeEventRect.y;
    }
    
  }
  finalizeActiveEventRect(result: any){
    if(result.message === 'cancelled'){
      this.activeEventRect = null;
    }else if(result.message === 'success'){
      this.timeService.saveEvent(result.data);
      this.activeEventRect = null;
    }else{
      
    }
  }
  createModal(cursorPt: SVGPoint){
    if(cursorPt.y <= this.activeEventRect.y){
      //in this case, the cursor is above the original start point.  
    }else{
      //
      // Need up clean up the next section:  change to variables to work dynamically, not on static values
      //
      
      const padding: number = 10;
      const totalHeight = (this.viewBoxHeight - (padding * 2));
      const totalMinutes = 29*30;  //29 increments * 30 minutes of time each
      const startMinutes = totalMinutes * (this.activeEventRect.y/totalHeight);
      const endMinutes = totalMinutes * (this.activeEventRect.y+this.activeEventRect.height)/totalHeight;
      
      const startTime: moment.Moment = this.timeService.getActiveDate().clone().hour(7).minute(0).second(0).millisecond(0).add(startMinutes, 'minute');
      const endTime: moment.Moment = this.timeService.getActiveDate().clone().hour(7).minute(0).second(0).millisecond(0).add(endMinutes, 'minute');
      
      this.timeService.setDayEventTimes(startTime, endTime);

      const modalRef = this.modalService.open(EventFormComponent, { centered: true, keyboard: false, backdrop:'static' });

      //
      // end of section to be cleaned
      //
      

      modalRef.result.then((result) => {
        this.finalizeActiveEventRect(result);
      }).catch((error) => {});
    }

    
  }

  ngOnDestroy() {
    this.handle.unsubscribe();
  }

  calculateTimeSegments(): TimeSegment[]{

    const padding: number = 10;

    const startHour = 7;
    const endHour = 21;

    const increments = (((endHour + 1) - startHour) * 2) - 1;
    const incrementMinutes = 30;
    const segmentHeight = (this.viewBoxHeight - (padding * 2)) / increments;

    let timeSegments: TimeSegment[] = [];
    let currentHour = startHour;
    let currentTime: moment.Moment = this.today.hours(currentHour).minutes(0).seconds(0);;
  
    for (let increment = 0; increment < increments; increment++){
      let timeSegment: TimeSegment = new TimeSegment();
      
      timeSegment.dateTime = currentTime.toDate();

      timeSegment.line_x1 = 0 + padding + 80;
      timeSegment.line_x2 = this.viewBoxWidth - padding;
      timeSegment.line_y1 = (padding*2) + (increment*segmentHeight);
      timeSegment.line_y2 = timeSegment.line_y1;
      timeSegment.text_x = timeSegment.line_x1 -80;
      timeSegment.text_y = timeSegment.line_y1 -15;
      if(currentTime.minutes() === 0){
        //  I added 1 hour because something about this arithmetic produces the line segments that do not line up with the hours, so I simply added 1 hour here.  
        //  This should probably be revisited to be more robust going forward, especially if the display should have dynamically settable start and end hours
        if(currentTime.hour() === 7){
          //quick hack to get rid of the hour 7 label.
          timeSegment.text_string = "";
        }else{
          timeSegment.text_string = currentTime.clone().format('h:mm a');
        }
      }else{
        timeSegment.text_string = "";
      }
      
      timeSegment.style = {
        "stroke":"black",
        "stroke-width":"0.5px"
      }

      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
    return timeSegments;

  }

}
