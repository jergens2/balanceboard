import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../timelog-body/timelog-entry/timelog-entry-item.class';
import { TimelogBodyGridItem } from '../../timelog-body/timelog-body-grid-item.interface';
import { TimeSchedule } from '../../../../../../../shared/utilities/time-utilities/time-schedule.class';
import { TimeScheduleItem } from '../../../../../../../shared/utilities/time-utilities/time-schedule-item.class';

@Component({
  selector: 'app-available-timelog-item',
  templateUrl: './available-timelog-item.component.html',
  styleUrls: ['./available-timelog-item.component.css']
})
export class AvailableTimelogItemComponent implements OnInit {

  constructor() { }

  private _drawTLE: TimelogEntryItem;
  private _drawTLENgStyle: any = {};
  private _rootNgStyle: any = {};


  @Input() public set drawTLE(timelogEntry: TimelogEntryItem) { this._update(timelogEntry); }
  @Input() gridItem: TimelogBodyGridItem;

  public get drawTLE(): TimelogEntryItem { return this._drawTLE; }
  public get drawTLENgStyle(): any { return this._drawTLENgStyle; }
  public get rootNgStyle(): any { return this._rootNgStyle; }

  ngOnInit() {
  }

  private _update(timelogEntry: TimelogEntryItem) {
    if (timelogEntry) {
      if (this.gridItem) {
        if (timelogEntry.startTime.isAfter(timelogEntry.endTime)) {
          this._drawTLE = new TimelogEntryItem(timelogEntry.endTime, timelogEntry.startTime);
        } else {
          this._drawTLE = timelogEntry;
        }
        const durationMS: number = this.gridItem.endTime.diff(this.gridItem.startTime, 'milliseconds');
        // console.log("Drawing TLE " + this._drawTLE.startTime.format('hh:mm a') + " to " + this._drawTLE.endTime.format('hh:mm a'));
        const timeSchedule: TimeSchedule = new TimeSchedule(this.gridItem.startTime, this.gridItem.endTime);
        timeSchedule.setScheduleFromSingleValues([new TimeScheduleItem(timelogEntry.startTime, timelogEntry.endTime, true)], true);
        let percentages: number[] = timeSchedule.fullSchedule.map((item)=>{
          return (item.endTime.diff(item.startTime, 'milliseconds') / durationMS) * 100;
        });
        // console.log("Percenates is : " , percentages);
        let gridTemplateRows: string = "";
        let drawTLEgridRow: string = "";
        percentages.forEach(percentage => gridTemplateRows += "" + percentage.toFixed(3) + "% ");
        if(percentages.length === 1){
          drawTLEgridRow = "1 / span 1";
        }else if(percentages.length === 2){
          if(this.drawTLE.startTime.isSame(this.gridItem.startTime)){
            drawTLEgridRow = "1 / span 1";
          }else{
            drawTLEgridRow = "2 / span 1";
          }
        }else if(percentages.length === 3){
          drawTLEgridRow = "2 / span 1"; 
        }else{
          console.log("Error with percentages count: " , percentages);
        }
        let ngStyle: any = {
          'grid-template-rows': gridTemplateRows,
        }
        let drawTLENgStyle: any = { 
          'grid-row': drawTLEgridRow,
        }
        this._rootNgStyle = ngStyle;
        this._drawTLENgStyle = drawTLENgStyle;
      } else {
        console.log('Error: no grid item to use as reference.');
        this._stopDrawing();
      }
    } else {
      this._stopDrawing();
    }
  }

  private _stopDrawing(){
    this._rootNgStyle = null;
    this._drawTLE = null;
    this._drawTLENgStyle = null;
  }
}
