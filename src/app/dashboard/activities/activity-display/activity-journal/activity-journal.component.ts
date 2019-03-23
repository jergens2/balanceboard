import { Component, OnInit, Input } from '@angular/core';

import { UserDefinedActivity } from '../../user-defined-activity.model';
import { IActivityJournalItem } from './activity-journal-item.interface';
import { TimeSegment } from '../../../daybook/time-log/time-segment.model';
import * as moment from 'moment';

@Component({
  selector: 'app-activity-journal',
  templateUrl: './activity-journal.component.html',
  styleUrls: ['./activity-journal.component.css']
})
export class ActivityJournalComponent implements OnInit {


  private _timeSegments: TimeSegment[];
  private _activity: UserDefinedActivity;

  journalEntries: IActivityJournalItem[] = [];

  @Input() set activityTimeSegments(timeSegments: TimeSegment[]) {
    let sortedTimeSegments: TimeSegment[] = timeSegments.sort((timeSegmentA, timeSegmentB) => {
      if (moment(timeSegmentA.startTime).isBefore(moment(timeSegmentB.startTime))) {
        return 1;
      }

      if (moment(timeSegmentA.startTime).isAfter(moment(timeSegmentB.startTime))) {
        return -1;
      }

      return 0;
    });
    this._timeSegments = sortedTimeSegments;
  }
  @Input() set activity(activity: UserDefinedActivity) {
    this._activity = activity;
  }

  constructor() { }

  ngOnInit() {
    if (this._timeSegments) {
      this.buildJournalEntries();
    }
  }

  private buildJournalEntries() {
    let journalEntries: IActivityJournalItem[] = [];

    for (let timeSegment of this._timeSegments) {
      let journalEntry: IActivityJournalItem;
      if(timeSegment.description){
        journalEntry = {
          startTime: moment(timeSegment.startTime),
          endTime: moment(timeSegment.endTime),
          description: timeSegment.description,
          timeSegmentActivitesCount: timeSegment.activities.length
        }
        journalEntries.push(journalEntry);
      }

      
    }

    this.journalEntries = journalEntries;

  }

  public endTime(journalEntry: IActivityJournalItem): string {
    if (moment(journalEntry.startTime).format('YYYY-MM-DD') == moment(journalEntry.endTime).format('YYYY-MM-DD')) {
      return moment(journalEntry.endTime).format("h:mm a");
    } else {
      return moment(journalEntry.endTime).format("YYYY-MM-DD h:mm a");
    }
  }
  public durationString(journalEntry: IActivityJournalItem): string {
    let minutes:number = moment(journalEntry.endTime).diff(moment(journalEntry.startTime),'minutes');
    let hours: number = 0;
    if(minutes > 60){
      hours = Math.floor(minutes/60);
      minutes = Math.floor(minutes%60);
    }
    let format: string = "";
    if(hours > 0){
      format = "" + hours.toFixed(0) + "h " + minutes.toFixed(0) + "m";
    }else{
      format = minutes.toFixed(0) + "m";
    }
    return format;
  }

}
