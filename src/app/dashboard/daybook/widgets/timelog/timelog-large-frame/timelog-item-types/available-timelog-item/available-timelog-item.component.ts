import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../timelog-body/timelog-entry/timelog-entry-item.class';
import { TimeScheduleItem } from '../../../../../../../shared/time-utilities/time-schedule-item.class';
import { TimelogDisplayGridItem } from '../../../timelog-display-grid-item.class';
import * as moment from 'moment';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { DaybookDisplayService } from '../../../../../daybook-display.service';


@Component({
  selector: 'app-available-timelog-item',
  templateUrl: './available-timelog-item.component.html',
  styleUrls: ['./available-timelog-item.component.css']
})
export class AvailableTimelogItemComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  private _drawTLE: TimelogEntryItem;
  private _drawTLENgStyle: any = {};
  private _rootNgStyle: any = {};
  private _mouseIsOver: boolean = false;


  @Input() public gridItem: TimelogDisplayGridItem;

  public get drawTLE(): TimelogEntryItem { return this._drawTLE; }
  public get drawTLENgStyle(): any { return this._drawTLENgStyle; }
  public get rootNgStyle(): any { return this._rootNgStyle; }
  public get mouseIsOver(): boolean { return this._mouseIsOver; }

  public faPlusCircle = faPlusCircle;


  /**
   * Under current setup, every time DaybookDisplayService updates, it rebuilds the entire timelog, and each of these components re-initializes here.
   */
  ngOnInit() {
    this.gridItem.drawTLE$.subscribe((drawTimelogEntry: TimelogEntryItem) => {
      this._drawTLE = drawTimelogEntry;
      if (drawTimelogEntry) {
        this._update(drawTimelogEntry);
      } else {
        this._stopDrawing();
      }
    });
    if(this.gridItem)

    // this.daybookService.displayUpdated$.subscribe((update) => {
    //   console.log("DISPLAY UPDATED: ", update.type)
    //   if (update.type !== DaybookDisplayUpdateType.CLOCK) {
    //     console.log("Stopping creating")
    //     this.gridItem.stopCreating();
    //   }
    // });
    this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe(isOpen => {
      if(!isOpen){
        this._stopDrawing();
      }
    })

  }

  public onMouseEnter() {
    this._mouseIsOver = true;
  }
  public onMouseLeave() {
    this._mouseIsOver = false;
  }

  public onClickItem() {
    this.daybookService.openTimelogGridItem(this.gridItem);
    // if(this.daybookService.activeDayController.isNewDay){
    //   this.tlefService.openStartNewDay();
    // }else{
    //   this.tlefService.openTimelogEntry(new TimelogEntryItem(this.gridItem.startTime, this.gridItem.endTime));
    // }

    // // this.toolsService.openTimelogEntry(new TimelogEntryItem(this.gridItem.startTime, this.gridItem.endTime));
    // // this.toolsService.openTool(ToolType.TimelogEntry);
  }


  private _update(timelogEntry: TimelogEntryItem) {
    // console.log("Updating drawing: " + timelogEntry.startTime.format('hh:mm a') + timelogEntry.endTime.format('hh:mm a'));

    const durationMS: number = this.gridItem.endTime.diff(this.gridItem.startTime, 'milliseconds');
    // console.log("Drawing TLE " + this._drawTLE.startTime.format('hh:mm a') + " to " + this._drawTLE.endTime.format('hh:mm a'));

    console.log("ERROR: incomplete.  need to add DaybookTimeSchedule stuff.");
    let percentages: number[] = [];
    // console.log("Percenates is : " , percentages);
    let gridTemplateRows: string = "";
    let drawTLEgridRow: string = "";
    percentages.forEach(percentage => gridTemplateRows += "" + percentage.toFixed(3) + "% ");
    if (percentages.length === 1) {
      drawTLEgridRow = "1 / span 1";
    } else if (percentages.length === 2) {
      if (this.drawTLE.startTime.isSame(this.gridItem.startTime)) {
        drawTLEgridRow = "1 / span 1";
      } else {
        drawTLEgridRow = "2 / span 1";
      }
    } else if (percentages.length === 3) {
      drawTLEgridRow = "2 / span 1";
    } else {
      console.log("Error with percentages count: ", percentages);
    }
    let ngStyle: any = {
      'grid-template-rows': gridTemplateRows,
    }
    let drawTLENgStyle: any = {
      'grid-row': drawTLEgridRow,
    }
    this._rootNgStyle = ngStyle;
    this._drawTLENgStyle = drawTLENgStyle;


  }

  private _stopDrawing() {
    this._drawTLE = null;
    this._rootNgStyle = null;
    this._drawTLENgStyle = null;
  }
}
