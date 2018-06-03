import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';

import { TimeService } from './../../services/time.service';
import { TimeSegment } from './time-segment.model';
import { ActivityRect } from './activity-rect.model'

import { ActivityFormComponent } from './activity-form/activity-form.component';


@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('svgDayView') svgObject: ElementRef;
  
  activeModal: NgbActiveModal;
  activeModalSubscription: Subscription;
  newActivityForm: FormGroup;

  handle: Subscription;
  pt: SVGPoint;

  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number;

  timeSegments: TimeSegment[];
  activityRects: ActivityRect[] = [];

  activeActivityRect: ActivityRect;

  today: moment.Moment;

  constructor(private timeService:TimeService, private modalService: NgbModal) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.today = this.timeService.getActiveDate();
    this.timeSegments = this.calculateTimeSegments();
    this.newActivityForm = new FormGroup({
      'startTime': new FormControl(null),
      'endTime': new FormControl(null),
      'description' : new FormControl(null),
      'category' : new FormControl(null)
    });
  }

  ngAfterViewInit(){
    this.pt = this.svgObject.nativeElement.createSVGPoint();

    const down = Observable.fromEvent(this.svgObject.nativeElement, 'mousedown')
      .do((md: MouseEvent) => {
        this.initiateActivityRect(this.getCursorPt(md));
        md.preventDefault();
      });
    const move = Observable.fromEvent(document, 'mousemove')
      .do((mm: MouseEvent) => mm.preventDefault());
    const up = Observable.fromEvent(document, 'mouseup')
      .do((mu: MouseEvent) => {
        this.finalizeActivityRect(this.getCursorPt(mu));
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

  initiateActivityRect(cursorPt: SVGPoint){
    this.activeActivityRect = new ActivityRect();
    this.activeActivityRect.x = 0 + 100;
    this.activeActivityRect.width = this.viewBoxWidth - 150;
    this.activeActivityRect.y = cursorPt.y;
    this.activeActivityRect.height = 0;
    this.activeActivityRect.rx = 1;
    this.activeActivityRect.ry = 1;
    this.activeActivityRect.style = {
      "fill":"red",
      "stroke":"black",
      "stroke-width":"2",
      "fill-opacity":"0.2"
    }
  }
  updateActiveActivtyRect(cursorPt: SVGPoint){
    if(cursorPt.y < this.activeActivityRect.y){
      let height = this.activeActivityRect.y - cursorPt.y;
      this.activeActivityRect.y = cursorPt.y;
      this.activeActivityRect.height = height;
    }else{
      this.activeActivityRect.height = cursorPt.y - this.activeActivityRect.y;
    }
    
  }
  finalizeActivityRect(cursorPt: SVGPoint){
    //this.activityRects.push(this.activeActivityRect);
    //this.activeActivityRect = null;


    this.openFormModal();
  }

  openFormModal() {
    const modalRef = this.modalService.open(ActivityFormComponent, { centered: true });
    console.log(modalRef);
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
    let currentTime: moment.Moment = this.today.hours(currentHour);
    currentTime.minutes(0).seconds(0);
  
    for (let increment = 0; increment < increments; increment++){
      let timeSegment: TimeSegment = new TimeSegment();
      
      timeSegment.dateTime = currentTime.toDate();

      timeSegment.line_x1 = 0 + padding;
      timeSegment.line_x2 = this.viewBoxWidth - padding;
      timeSegment.line_y1 = (padding*2) + (increment*segmentHeight);
      timeSegment.line_y2 = timeSegment.line_y1;
      timeSegment.text_x = timeSegment.line_x1;
      timeSegment.text_y = timeSegment.line_y1 - 3;
      if(currentTime.minutes() === 0){
        timeSegment.text_string = currentTime.clone().format('h:mm a');
      }else{
        timeSegment.text_string = "";
      }
      
      timeSegment.style = {
        "stroke":"black",
        "stroke-width":"0.5px",
      }

      timeSegments.push(timeSegment);
      currentTime.add(0.5, 'hours');
    }
    return timeSegments;

  }

}