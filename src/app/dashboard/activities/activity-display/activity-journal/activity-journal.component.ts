import { Component, OnInit, Input } from '@angular/core';

import { UserDefinedActivity } from '../../user-defined-activity.model';
import { IActivityJournalItem } from './activity-journal-item.interface';
import { TimelogEntry } from '../../../daybook/time-log/timelog-entry-tile/timelog-entry.model';
import * as moment from 'moment';

@Component({
  selector: 'app-activity-journal',
  templateUrl: './activity-journal.component.html',
  styleUrls: ['./activity-journal.component.css']
})
export class ActivityJournalComponent implements OnInit {


  private _timelogEntrys: TimelogEntry[];
  private _activity: UserDefinedActivity;

  journalEntries: IActivityJournalItem[] = [];

  @Input() set activityTimelogEntrys(timelogEntrys: TimelogEntry[]) {
    let sortedTimelogEntrys: TimelogEntry[] = timelogEntrys.sort((timelogEntryA, timelogEntryB) => {
      if (moment(timelogEntryA.startTime).isBefore(moment(timelogEntryB.startTime))) {
        return 1;
      }

      if (moment(timelogEntryA.startTime).isAfter(moment(timelogEntryB.startTime))) {
        return -1;
      }

      return 0;
    });
    this._timelogEntrys = sortedTimelogEntrys;
  }
  @Input() set activity(activity: UserDefinedActivity) {
    this._activity = activity;
  }

  constructor() { }

  ngOnInit() {
    if (this._timelogEntrys) {
      this.buildJournalEntries();
    }
  }

  private buildJournalEntries() {
    let journalEntries: IActivityJournalItem[] = [];

    for (let timelogEntry of this._timelogEntrys) {
      let journalEntry: IActivityJournalItem;
      if(timelogEntry.description){
        journalEntry = {
          startTime: moment(timelogEntry.startTime),
          endTime: moment(timelogEntry.endTime),
          description: timelogEntry.description,
          timelogEntryActivitesCount: timelogEntry.activities.length
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
