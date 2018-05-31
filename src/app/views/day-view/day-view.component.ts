import { TimeService } from './../../services/time.service';
import { TimeSegment } from './time-segment.model';
import { ActivityRect } from './activity-rect.model'
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css']
})
export class DayViewComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() label: string = '';
  @Input() min = 0;
  @Input() max = 1;
  @Input() value = 0;
  //@Output() valueChange = new EventEmitter<number>();

  @ViewChild('svgDayView') svgObject: ElementRef;
  cursorPt: SVGPoint = {x: 0, y: 0} as any;
  handle: Subscription;
  pt: SVGPoint;

  viewBox: string;
  viewBoxHeight: number;
  viewBoxWidth: number;

  mouseLine: any;

  timeSegments: TimeSegment[];
  activityRects: ActivityRect[] = [];

  activityRect: ActivityRect;

  today: moment.Moment;

  constructor(private timeService:TimeService) { }

  ngOnInit() {
    this.viewBoxHeight = 600;
    this.viewBoxWidth = 600;
    this.viewBox = "0 0 "+this.viewBoxWidth+" "+this.viewBoxHeight;
    this.today = this.timeService.getActiveDate();
    this.timeSegments = this.calculateTimeSegments();
    this.cursorPt = {x:0, y:0} as any;
  }

  ngAfterViewInit(){
    this.pt = this.svgObject.nativeElement.createSVGPoint();

    const down = Observable.fromEvent(this.svgObject.nativeElement, 'mousedown')
      .do((md: MouseEvent) => {
        this.pt.x = md.clientX;
        this.pt.y = md.clientY;
        this.cursorPt = this.pt.matrixTransform(
          this.svgObject.nativeElement.getScreenCTM().inverse()
          //at this pont the cursorPt provides accurate SVG coordinates within the SVG object
        );
        this.initiateActivityRect(this.cursorPt);
        md.preventDefault();
      });
    const move = Observable.fromEvent(document, 'mousemove')
      .do((mm: MouseEvent) => {
        mm.preventDefault()
        
      });
    const up = Observable.fromEvent(document, 'mouseup')
      .do((mu: MouseEvent) => {
        this.pt.x = mu.clientX;
        this.pt.y = mu.clientY;
        this.cursorPt = this.pt.matrixTransform(
          this.svgObject.nativeElement.getScreenCTM().inverse()
          //at this pont the cursorPt provides accurate SVG coordinates within the SVG object
        );
        this.finalizeActivityRect(this.cursorPt);
        mu.preventDefault()
      });

    const drag = down.mergeMap((md: MouseEvent) => {
        return move.startWith(md).takeUntil(up.take(1));
    });

    this.handle = drag
    .subscribe((md: MouseEvent) => {
        this.pt.x = md.clientX;
        this.pt.y = md.clientY;
        this.cursorPt = this.pt.matrixTransform(
          this.svgObject.nativeElement.getScreenCTM().inverse()
          //at this pont the cursorPt provides accurate SVG coordinates within the SVG object
        );
        

    });
  }

  initiateActivityRect(cursorPt: SVGPoint){
    this.activityRect = new ActivityRect();
    this.activityRect.x = 0 + 100;
    this.activityRect.width = this.viewBoxWidth - 150;
    this.activityRect.y = cursorPt.y;
    this.activityRect.height = 0;
    this.activityRect.rx = 5;
    this.activityRect.ry = 10;
    this.activityRect.style = {
      "fill":"red",
      "stroke":"black",
    }
  }
  finalizeActivityRect(cursorPt: SVGPoint){
    this.activityRect.height = cursorPt.y - this.activityRect.y;
    this.activityRects.push(this.activityRect);
    console.log(this.activityRects)
  }

  createActivityRect(x: number, width: number, y:number, height:number, style?:{}): ActivityRect{
    let activityRect: ActivityRect = new ActivityRect();
    activityRect.x = 0 + 50;
    activityRect.width = this.viewBoxWidth - 50;
    activityRect.y = this.cursorPt.y;
    activityRect.height = 100;
    activityRect.style = {
      "fill":"red",
      "stroke":"black",
    }

    return activityRect

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
