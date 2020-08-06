import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsManager } from '../time-views-manager.class';
import { TimeViewYear } from '../tv-year.class';
import * as moment from 'moment';
import { TimeViewMonth } from '../tv-month.class';
import { AppScreenSizeService } from '../../app-screen-size/app-screen-size.service';
import { TimeViewDayItem } from '../time-view-day-item.class';

@Component({
  selector: 'app-tv-year-view',
  templateUrl: './tv-year-view.component.html',
  styleUrls: ['./tv-year-view.component.css']
})
export class TvYearViewComponent implements OnInit {

  constructor(private screenSizeService: AppScreenSizeService) { }



  public get screenSizeNgClass(): string[] { return this.screenSizeService.screenSizeNgClass; }
  @Input() public manager: TimeViewsManager;
  public get months(): TimeViewMonth[] { return this.manager.timeViewMonths; }
  public get draggingNgClass(): string { return this.isDragging ? 'is-dragging' : '' }
  public get ngClass(): string[] { return [...this.screenSizeNgClass, this.draggingNgClass]; }
  public get isDragging(): boolean { return this._queryDateStartYYYYMMDD !== ""; }


  ngOnInit(): void {
  }

  public onMouseUpRoot() {
    console.log("on UPROOT")
    // if(this._queryDateStartYYYYMMDD){
    //   this._queryDateEndYYYYMMDD = day.dateYYYYMMDD;
    // }
    if (this._queryDateEndYYYYMMDD < this._queryAnchorYYYYMMDD) {
      this._queryDateStartYYYYMMDD = this._queryDateEndYYYYMMDD
      this._queryDateEndYYYYMMDD = this._queryAnchorYYYYMMDD;
    } else {
      this._queryDateStartYYYYMMDD = this._queryAnchorYYYYMMDD;
    }
    this.months.forEach(m => m.days.forEach(d => d.unselect()));
    const hasOne = (this._queryDateEndYYYYMMDD !== "" && this._queryDateStartYYYYMMDD === "") ||
      (this._queryDateEndYYYYMMDD === "" && this._queryDateStartYYYYMMDD !== "");
    const hasTwo = this._queryDateEndYYYYMMDD !== "" && this._queryDateStartYYYYMMDD !== "";
    if (hasOne) {
      console.log("HAS ONE")
      const val = this._queryDateStartYYYYMMDD !== "" ? this._queryDateStartYYYYMMDD : this._queryDateEndYYYYMMDD;
      this.manager.updateQueryDates(val, val);
    } else if (hasTwo) {
      console.log("HAS TWO")
      this.manager.updateQueryDates(this._queryDateStartYYYYMMDD, this._queryDateEndYYYYMMDD);
    }
    this._queryDateEndYYYYMMDD = "";
    this._queryDateStartYYYYMMDD = "";
    this._queryAnchorYYYYMMDD = "";

  }
  public onMouseLeaveRoot() {
    this.months.forEach(m => m.days.forEach(d => d.unselect()));
    // console.log("QUERY: " + this._queryDateStartYYYYMMDD + "  -  " + this._queryDateEndYYYYMMDD);
    this._queryDateEndYYYYMMDD = "";
    this._queryDateStartYYYYMMDD = "";
    this._queryAnchorYYYYMMDD = "";
  }


  private _queryDateStartYYYYMMDD: string = "";
  private _queryDateEndYYYYMMDD: string = "";
  private _queryAnchorYYYYMMDD: string = "";

  public onMouseUp(day: TimeViewDayItem) { }
  public onMouseDown(day: TimeViewDayItem) {
    if (day.isVisible) {
      this._queryAnchorYYYYMMDD = day.dateYYYYMMDD;
      this._queryDateStartYYYYMMDD = day.dateYYYYMMDD;
    }
  }
  public onMouseLeave(day: TimeViewDayItem) {
    if (!this.isDragging) {
      day.disablePopup();
    }
  }
  public onMouseEnter(day: TimeViewDayItem) {
    if (this._queryAnchorYYYYMMDD && day.isVisible) {
      this._queryDateEndYYYYMMDD = day.dateYYYYMMDD;
      if (this._queryDateEndYYYYMMDD < this._queryAnchorYYYYMMDD) {
        this._queryDateStartYYYYMMDD = this._queryDateEndYYYYMMDD
        this._queryDateEndYYYYMMDD = this._queryAnchorYYYYMMDD;
      } else {
        this._queryDateStartYYYYMMDD = this._queryAnchorYYYYMMDD;
      }
      let noteCount: number = 0;
      this.months.forEach(month => {
        month.days.forEach(d => {
          d.unselect();
          d.disablePopup();
          if (d.dateYYYYMMDD >= this._queryDateStartYYYYMMDD && d.dateYYYYMMDD <= this._queryDateEndYYYYMMDD) {
            d.select();
            noteCount += d.count;
          }

        });
      });
      const queryVals: string[] = [
        moment(this._queryDateStartYYYYMMDD).format('MMM Do') + " to " + moment(this._queryDateEndYYYYMMDD).format('MMM Do'),
        noteCount.toFixed(0) + " notes",
      ];
      day.enableRangePopup(queryVals);
    } else if (day.isVisible) {
      this.months.forEach(m => m.days.forEach(d => d.disablePopup()));
      day.enablePopup();
    }
  }

}
