import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.class';
import { NoteQueryService } from './note-query.service';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeViewsManager } from '../../shared/time-views/time-views-manager.class';
import { Subscription } from 'rxjs';
import { NoteHttpService } from './api/note-http.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {

  faCog: IconDefinition = faCog;
  faHashtag = faHashtag;
  faCalendarAlt = faCalendarAlt;


  constructor(private noteQueryService: NoteQueryService, private noteHttpService: NoteHttpService) { }

  private _isLoading: boolean = true;
  private _allNotebookEntries: NotebookEntry[] = [];

  private _filteredNotebookEntries: { dateYYYYMMDD: string, daysAgo: string, notes: NotebookEntry[] }[] = [];
  private _showMoreButton: boolean = false;

  public get isLoading(): boolean { return this._isLoading; }
  public get timeViewsManager(): TimeViewsManager { return this.noteQueryService.timeViewsManager; }
  public get showMoreButton(): boolean { return this._showMoreButton; }

  public get filteredNotebookEntries(): { dateYYYYMMDD: string, daysAgo: string, notes: NotebookEntry[] }[] { return this._filteredNotebookEntries; };

  private get _maxResults(): number { return 25; };

  private _subscriptions: Subscription[] = [];

  ngOnInit() {
    this._subscriptions = [this.noteHttpService.allNotes$.subscribe((allNotes)=>{
      this.noteQueryService.reInitiate(allNotes);
    })];
  }

  private _setFilteredEntries(notes: NotebookEntry[]) {
    let filteredEntries: { dateYYYYMMDD: string, daysAgo: string, notes: NotebookEntry[] }[] = [];
    if (notes.length > 0) {
      let currentDateYYYYMMDD: string = notes[0].journalDateYYYYMMDD;
      let i = 0;
      let currentEntry: { dateYYYYMMDD: string, daysAgo: string, notes: NotebookEntry[] } = {
        dateYYYYMMDD: moment(currentDateYYYYMMDD).format('MMM Do, YYYY'),
        daysAgo: moment().diff(moment(currentDateYYYYMMDD), 'days').toFixed(0),
        notes: [],
      };
      while (i < notes.length) {
        if (notes[i].journalDateYYYYMMDD === currentDateYYYYMMDD) {
          currentEntry.notes.push(notes[i]);
        } else {
          filteredEntries.push(currentEntry);
          currentDateYYYYMMDD = notes[i].journalDateYYYYMMDD;
          currentEntry = {
            dateYYYYMMDD: moment(currentDateYYYYMMDD).format('MMM Do, YYYY'),
            daysAgo: moment().diff(moment(currentDateYYYYMMDD), 'days').toFixed(0),
            notes: [notes[i]],
          };
        }
        i++;
      }
      filteredEntries.push(currentEntry);
    }
    this._filteredNotebookEntries = filteredEntries;
  }



  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  public onClickShowMore() {
    const additional = 10;
    const maxResults = this._filteredNotebookEntries.length + additional;
    if (this._allNotebookEntries.length > maxResults) {
      // this._filteredNotebookEntries = this._allNotebookEntries.slice(0, maxResults - 1);
      this._showMoreButton = true;

    } else {
      // this._filteredNotebookEntries = this._allNotebookEntries;
      this._showMoreButton = false;
    }
  }
}
