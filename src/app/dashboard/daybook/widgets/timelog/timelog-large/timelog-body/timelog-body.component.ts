import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ItemState } from '../../../../../../shared/utilities/item-state.class';
import { RelativeMousePosition } from '../../../../../../shared/utilities/relative-mouse-position.class';
import * as moment from 'moment';
import { RoundToNearestMinute } from '../../../../../../shared/utilities/time-utilities/round-to-nearest-minute.class';
import { DaybookService } from '../../../../daybook.service';
import { TimelogZoomControl } from '../timelog-zoom-controller/timelog-zoom-control.interface';
import { Subscription, Observable } from 'rxjs';
import { TimelogEntryItem } from './timelog-entry/timelog-entry-item.class';
import { DaybookDayItem } from '../../../../api/daybook-day-item.class';
import { TimelogDisplayController } from '../../timelog-display-controller.class';
import { TimelogDelineator } from '../../timelog-delineator.class';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { ScreenSizeService } from '../../../../../../shared/app-screen-size/screen-size.service';
import { DaybookController } from '../../../../controller/daybook-controller.class';
import { TimeScheduleItem } from '../../../../../../shared/utilities/time-utilities/time-schedule-item.class';
import { TimelogDisplayGridItemType } from '../../timelog-display-grid-item.enum';

@Component({
  selector: 'app-timelog-body',
  templateUrl: './timelog-body.component.html',
  styleUrls: ['./timelog-body.component.css']
})
export class TimelogBodyComponent implements OnInit {

  constructor(private daybookService: DaybookService, private screenSizeService: ScreenSizeService) { }

  private _zoomControl: TimelogZoomControl;
  private _zoomControlSubscription: Subscription = new Subscription();
  // private _drawNewTLE: TimelogEntryItem;
  private _activeDayController: DaybookController;
  private _relativeMousePosition: RelativeMousePosition = new RelativeMousePosition();
  private _timelogDisplayController: TimelogDisplayController = null;
  private _guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];

  @Input() public set zoomControl(zoomControl: TimelogZoomControl) {
    this._zoomControl = zoomControl;
    // console.log("Zoom:  " + this._zoomControl.startTime.format("YYYY-MM-DD hh:mm a") + " - " + this._zoomControl.endTime.format("YYYY-MM-DD hh:mm a"))
    this._estimateInitialMinutesPerPixel(this.screenSizeService.dimensions.height);
  }

  @Input() public set zoomHover(zoom: TimelogZoomControl) { }

  public columnAvailability: TimeScheduleItem[] = [];
  public faTimes = faTimes;
  public faClock = faClock;
  public faPlus = faPlus;
  public get startTime(): moment.Moment { return this._zoomControl.startTime; }
  public get endTime(): moment.Moment { return this._zoomControl.endTime; }
  // public get relativeMousePosition(): RelativeMousePosition { return this._relativeMousePosition; }
  public get timelogDisplayController(): TimelogDisplayController { return this._timelogDisplayController; }
  public get zoomControl(): TimelogZoomControl { return this._zoomControl; }
  public get guideLineHours(): { label: string, ngStyle: any, lineNgClass: any }[] { return this._guideLineHours; }
  public get gridItems(): TimelogDisplayGridItemType[] { return this._timelogDisplayController.gridItems; }
  public get gridItemsNgStyle(): any { return this._timelogDisplayController.displayGridNgStyle; }
  public get timeDelineators(): TimelogDelineator[] { return this._timelogDisplayController.timeDelineators; }
  // public get timeDelineatorsNgStyle(): any { return this._timelogDisplayController.timeDelineatorsNgStyle; };
  // public get drawNewTLE(): TimelogEntryItem { return this._drawNewTLE; }
  public onDrawNewTLE(timelogEntry: TimelogEntryItem) {
    console.log("  * Drawing TLE from: " + timelogEntry.startTime.format('YYYY-MM-DD hh:mm a') + " to: " + timelogEntry.endTime.format('YYYY-MM-DD hh:mm a'))

  }

  public onMouseMove(event: MouseEvent) { }
  public onMouseLeave() { }
  public onClickGridItem(gridItem: TimelogDisplayGridItemType){
    console.log("Grid item clicked: " + gridItem)
  }


  ngOnInit() {
    this._estimateInitialMinutesPerPixel(this.screenSizeService.dimensions.height);
    this.screenSizeService.dimensions$.subscribe((dimensions: { width: number, height: number }) => {
      this._estimateInitialMinutesPerPixel(dimensions.height);
    });
    this._buildTimelog();
    this.daybookService.activeDayController$.subscribe((dayChanged) => {
      this._buildTimelog();
    });

  }

  private _buildTimelog() {
    this._activeDayController = this.daybookService.activeDayController;
    this._buildGuideLineHours();

    this._updateTimelog();
    // this.updateNowLine();
    // this._updateTickMarginLine();

    const availabilitySchedule = this.daybookService.activeDayController.getColumnAvailability(this.zoomControl);
    this.columnAvailability = availabilitySchedule.fullSchedule;
    console.log("Column availability is: ", this.columnAvailability)
  }

  private _buildGuideLineHours() {
    let guideLineHours: { label: string, ngStyle: any, lineNgClass: any }[] = [];
    let startTime: moment.Moment = moment(this.startTime);
    if (!(startTime.minute() == 0 || startTime.minute() == 30)) {
      if (startTime.minute() >= 0 && startTime.minute() < 30) {
        startTime = moment(startTime).startOf("hour")
      } else if (startTime.minute() > 30) {
        startTime = moment(startTime).startOf("hour").add(30, "minutes");
      }
    }
    let endTime: moment.Moment = moment(this.endTime);

    if (!(endTime.minute() == 0 || endTime.minute() == 30)) {
      if (endTime.minute() >= 0 && endTime.minute() < 30) {
        endTime = moment(endTime).minute(30);
      } else if (endTime.minute() > 30) {
        endTime = moment(endTime).startOf("hour").add(1, "hour");
      }
    }

    let currentTime: moment.Moment = moment(startTime);
    while (currentTime.isSameOrBefore(endTime)) {
      let amPm: "a" | "p" = currentTime.hour() >= 12 ? "p" : "a";
      let ngStyle: any = {};
      let lineNgClass: any = "";
      if (currentTime.isSame(endTime)) {
        ngStyle = {
          "height": "1px",
          "flex-grow": "0",
        }
      }
      let label: string = "";
      if (currentTime.minute() == 0) {
        label = currentTime.format("h") + amPm;
        lineNgClass = ['label-line-hour'];
      } else if (currentTime.minute() == 30) {
        lineNgClass = ['label-line-half-hour'];
      }


      guideLineHours.push({ label: label, ngStyle: ngStyle, lineNgClass: lineNgClass });
      currentTime = moment(currentTime).add(30, "minutes");
    }
    this._guideLineHours = guideLineHours;
  }

  private _updateTimelog() {
    let timelog: TimelogDisplayController = new TimelogDisplayController(this._zoomControl, this._activeDayController, this._minutesPerTwentyPixels);
    this._timelogDisplayController = timelog;
  }

  private _estimateInitialMinutesPerPixel(screenHeight: number) {
    /**
     * This is not a highly reliable mechanism for determining how many minutes per pixel because it depends on making assumptions
     * based on the current configuration of css and elements which may change.
     
     * In the case of a full sized screen, the screen is 966 pixels and the timelog-body is 841 pixels, therefore the difference = 125. 
     * In the case of the smallest screen (anything less than 622 px), the timelog body is 500px at minimum, 
     * 
     * We can therefore estimate that the height of the timelog-body is:  screenHeight - 125px.
     */
    let elementHeight: number = screenHeight - 125;
    if (elementHeight < 500) {
      elementHeight = 500;
    }
    this._updateMinutesPerPixel(elementHeight);
  }
  private _minutesPerTwentyPixels: number = 30;
  public get minutesPerTwentyPixels(): number { return this._minutesPerTwentyPixels; };
  private _updateMinutesPerPixel(elementHeight: number) {
    const totalMinutes = moment(this._zoomControl.endTime).diff(moment(this._zoomControl.startTime), "minutes");
    const minutesPerTwentyPixels = (totalMinutes / elementHeight) * 20;
    this._minutesPerTwentyPixels = minutesPerTwentyPixels;
    if (this._timelogDisplayController) {
      this._timelogDisplayController.updateEntrySizes(minutesPerTwentyPixels);
    }
  }

  // private _tickMarginLineNgStyle: any = {};
  // private _tickMarginLines: any[] = [];
  // public get tickMarginLineNgStyle(): any { return this._tickMarginLineNgStyle; };
  // public get tickMarginLines(): any[] { return this._tickMarginLines; };

  // private _updateTickMarginLine() {
  //   console.log("as of:  2020-01-05:  I don't know if I need this method")
  //   if (this.timelogDisplayController.entryItems.length > 0) {
  //     const totalDurationSeconds: number = moment(this._zoomControl.endTime).diff(moment(this._zoomControl.startTime), "seconds");


  //     let sleepStates: { durationSeconds: number, sleepState: "AWAKE" | "SLEEP", percentage: number }[] = this.timelogDisplayController.entryItems.map((entryItem) => {
  //       return { durationSeconds: entryItem.durationSeconds, sleepState: entryItem.sleepState, percentage: 0 };
  //     });

  //     let reducedSleepStates: { durationSeconds: number, sleepState: "AWAKE" | "SLEEP", percentage: number }[] = [sleepStates[0]];
  //     reducedSleepStates[0].percentage = (reducedSleepStates[0].durationSeconds / totalDurationSeconds) * 100;
  //     for (let i = 1; i < sleepStates.length; i++) {
  //       if (sleepStates[i].sleepState === sleepStates[i - 1].sleepState) {
  //         // if it is the same as the previous one, add to the existing sum or seconds
  //         reducedSleepStates[reducedSleepStates.length - 1].durationSeconds += sleepStates[i].durationSeconds;
  //         reducedSleepStates[reducedSleepStates.length - 1].percentage = ((reducedSleepStates[reducedSleepStates.length - 1].durationSeconds) / totalDurationSeconds) * 100;
  //       } else {
  //         // if it is not the same, create a new item in the array.
  //         sleepStates[i].percentage = (sleepStates[i].durationSeconds / totalDurationSeconds) * 100;
  //         reducedSleepStates.push(sleepStates[i]);
  //       }
  //     }

  //     let gridTemplateRows: string = "";
  //     reducedSleepStates.forEach((state) => {
  //       gridTemplateRows += "" + state.percentage.toFixed(2) + "%";
  //     });

  //     this._tickMarginLines = reducedSleepStates;
  //     this._tickMarginLineNgStyle = { "grid-template-rows": gridTemplateRows };

  //     // console.log("Tick margin line: ", this._tickMarginLines, this._tickMarginLineNgStyle)

  //   }

  // }

}
