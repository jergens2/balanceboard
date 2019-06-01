import { Component, OnInit, Input } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TimelogService } from '../time-log/timelog.service';

import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { TimelogEntry } from '../time-log/timelog-entry-tile/timelog-entry.model';
import { IHeatmapContentItem } from './heatmap-content-item.interface';

@Component({
  selector: 'app-heatmap-view',
  templateUrl: './heatmap-view.component.html',
  styleUrls: ['./heatmap-view.component.css']
})
export class HeatmapViewComponent implements OnInit {

  faSpinner = faSpinner;
  ifLoading: boolean = true;

  constructor(private timelogService: TimelogService) { }

  private timelogEntrysSubscription: Subscription = new Subscription();
  private _currentDate$: Subject<moment.Moment> = new Subject();

  @Input() set currentDate(date: moment.Moment) {
    this._currentDate$.next(date);
  }


  topItems: string[] = [];
  sideItems: string[] = [];
  contentItems: IHeatmapContentItem[] = [];

  ngOnInit() {

    this._currentDate$.subscribe((changedDate: moment.Moment) => {
      this.ifLoading = true;


      this.timelogService.timelogEntrys$.subscribe((timelogEntrys) => {
        this.buildTemplateItems(changedDate, timelogEntrys);
        this.ifLoading = false;
      });
      this.timelogEntrysSubscription.unsubscribe();
      this.timelogService.fetchTimelogEntrysByRange(moment(changedDate).subtract(1,'day'), moment(changedDate).add(1,'day'));

    });

    this._currentDate$.next(moment());
  }


  private buildTemplateItems(currentDate: moment.Moment, timelogEntrys: TimelogEntry[]) {
    function getActivityColor(startTime: moment.Moment, endTime: moment.Moment): string {
      for (let timelogEntry of timelogEntrys) {
        if (moment(timelogEntry.startTime).isSameOrBefore(startTime) && moment(timelogEntry.endTime).isSameOrAfter(endTime)) {
          if (timelogEntry.activities.length > 0) {
            return timelogEntry.activities[0].activity.color;
          } else {
            return "";
          }
        } else {
          /*
              This block is not necessarily robust, but does the job for now.
          */
          let halfwayPoint = moment(startTime).add(2,'minutes').add(30,'seconds');
          if( moment(timelogEntry.startTime).isSameOrBefore(startTime) && moment(timelogEntry.endTime).isSameOrAfter(halfwayPoint)){
            if (timelogEntry.activities.length > 0) {
              return timelogEntry.activities[0].activity.color;
            } else {
              return "";
            }
          }else if( moment(timelogEntry.startTime).isSameOrAfter(halfwayPoint) && moment(timelogEntry.endTime).isSameOrAfter(endTime)){
            if (timelogEntry.activities.length > 0) {
              return timelogEntry.activities[0].activity.color;
            } else {
              return "";
            }
          }
        }
      }
      return "";
    }

    this.topItems = [':00', ':05', ':10', ':15', ':20', ':25', ':30', ':35', ':40', ':45', ':50', ':55'];
    this.sideItems = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];

    let itemsRemaining: number = 288;
    let currentGridRow: number = 2;
    let currentGridColumn: number = 2;
    let currentStartTime: moment.Moment = moment(currentDate).hour(0).minute(0).second(0).millisecond(0);

    while (itemsRemaining > 0) {


      let startTime: moment.Moment = moment(currentStartTime);
      let endTime: moment.Moment = moment(currentStartTime).add(4, 'minutes').add(59, 'seconds').add(999, 'milliseconds');
      let backgroundColor: string = getActivityColor(startTime, endTime);

      let itemStyle: any = {
        "grid-row": "" + currentGridRow + " / span 1",
        "grid-column": "" + currentGridColumn + " / span 1",
        "background-color": backgroundColor
      };

      let contentItem: IHeatmapContentItem = {
        startTime: startTime,
        endTime: endTime,
        style: itemStyle
      };



      this.contentItems.push(contentItem)

      currentStartTime = moment(currentStartTime).add(5, 'minutes');
      currentGridColumn++;
      if (currentGridColumn == 14) {
        currentGridColumn = 2;
        currentGridRow++;
      }
      itemsRemaining -= 1;
    }
  }



}
