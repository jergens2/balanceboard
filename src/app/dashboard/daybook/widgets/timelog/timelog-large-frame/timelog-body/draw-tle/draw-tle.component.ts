import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogEntryItem } from '../timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/time-utilities/time-schedule-item.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-draw-tle',
  templateUrl: './draw-tle.component.html',
  styleUrls: ['./draw-tle.component.css']
})
export class DrawTleComponent implements OnInit, OnDestroy {

  constructor(private daybookService: DaybookDisplayService) { }

  private _startTime: moment.Moment;
  private _endTime: moment.Moment;
  public get startTime(): moment.Moment { return this._startTime; }
  public get endTime(): moment.Moment { return this._endTime; }


  private _ngStyle: any = {};
  public get ngStyle(): any { return this._ngStyle; }

  private _drawTLE: TimelogEntryItem;
  public get drawTLE(): TimelogEntryItem { return this._drawTLE; }

  private _subs: Subscription[] = [];
  ngOnInit(): void {
    this._rebuild();
    this._subs = [
      this.daybookService.currentlyDrawingTLE$.subscribe((drawTLE) => {
        if (drawTLE) {
          this._rebuild();
        }else{
          this._stopDrawing();
        }
      }),
      // this.daybookService.onStopDrawingTLE$.subscribe((stopDrawing) => {
      //   this._stopDrawing();
      // })
    ];
  }
  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe());
  }
  private _stopDrawing(){
    console.log( " STOPPING DRAWING")
    this._drawTLE = null;
  }

  private _rebuild() {
    this._startTime = moment(this.daybookService.displayStartTime);
    this._endTime = moment(this.daybookService.displayEndTime);
    this._drawTLE = this.daybookService.currentlyDrawingTLE;
    if (!this._drawTLE) {
      console.log("Error:  no drawing TLE");
    }
    this._buildStyle();
  }

  private _buildStyle() {
    const timeRanges: TimeScheduleItem[] = [
      new TimeScheduleItem(this.startTime.toISOString(), this._drawTLE.startTime.toISOString()),
      new TimeScheduleItem(this._drawTLE.startTime.toISOString(), this._drawTLE.endTime.toISOString()),
      new TimeScheduleItem(this._drawTLE.endTime.toISOString(), this.endTime.toISOString()),
    ];
    const totalDuration = moment(this.endTime).diff(this.startTime, 'milliseconds');
    const percentages = timeRanges.map(item => (item.durationMs / totalDuration) * 100);
    let gridTemplateRows: string = "";
    percentages.forEach(p => {
      gridTemplateRows += p.toFixed(2) + "% ";
    });
    this._ngStyle = {
      'grid-template-rows': gridTemplateRows
    };
  }

}
