import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.class';
import { NoteQueryService } from './note-query.service';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeViewsManager } from '../../shared/time-views/time-views-manager.class';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { NoteHttpService } from './api/note-http.service';
import { NoteGroup } from './note-group/note-group.interface';

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
  private _showMoreButton: boolean = false;


  private _allNotes: NotebookEntry[] = [];

  private _allNoteGroups: NoteGroup[] = [];
  private _showNoteGroups: NoteGroup[] = [];

  private get _maxDefaultResults(): number { return 30; }

  public get isLoading(): boolean { return this._isLoading; }
  public get timeViewsManager(): TimeViewsManager { return this.noteQueryService.timeViewsManager; }
  public get showMoreButton(): boolean { return this._showMoreButton; }

  public get noteGroups(): NoteGroup[] { return this._allNoteGroups; }
  public get showNoteGroups(): NoteGroup[] { return this._showNoteGroups; }

  private _subscriptions: Subscription[] = [];

  ngOnInit() {
    this._allNotes = this.noteHttpService.allNotes;
    this._subscriptions = [
      this.noteHttpService.allNotes$.subscribe((allNotes) => {
        this._allNotes = allNotes;
        this._reload();
      }),
      // fromEvent(document, "scroll").subscribe(e => {
      //   this.onWindowScroll();
      // })
    ];

  }


  private _reload() {
    const noteGroups: NoteGroup[] = [];
    const allNotes = this._allNotes.sort((item1, item2) => {
      if (item1.journalDate.toISOString() > item2.journalDate.toISOString()) {
        return -1;
      } else if (item1.journalDate.toISOString() < item2.journalDate.toISOString()) {
        return 1;
      }
      return 0;
    });
    console.log("All notes is:" , allNotes)
    if (allNotes.length > 0) {
      let currentDateYYYYMMDD: string = allNotes[0].journalDateYYYYMMDD;
      let currentNoteGroup: NoteGroup = {
        dateYYYYMMDD: currentDateYYYYMMDD,
        dateString: moment(currentDateYYYYMMDD).format('MMM Do, YYYY'),
        daysAgo: moment().diff(moment(currentDateYYYYMMDD), 'days').toFixed(0),
        notes: [],
        noNotesEndDateYYYYMMDD: currentDateYYYYMMDD,
        noNotesDateString: moment(currentDateYYYYMMDD).format('MMM Do, YYYY'),
      };
      for (let i = 0; i < allNotes.length; i++) {
        if (currentDateYYYYMMDD === allNotes[i].journalDateYYYYMMDD) {
          currentNoteGroup.notes.push(allNotes[i].clone());
        } else {
          noteGroups.push(currentNoteGroup);
          const nextDate = moment(currentDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
          const newDateYYYYMMDD: string = allNotes[i].journalDateYYYYMMDD;
          if (nextDate === newDateYYYYMMDD) {
            currentNoteGroup = {
              dateYYYYMMDD: nextDate,
              dateString: moment(nextDate).format('MMM Do, YYYY'),
              daysAgo: moment().diff(moment(nextDate), 'days').toFixed(0),
              notes: [allNotes[i]],
              noNotesEndDateYYYYMMDD: nextDate,
              noNotesDateString: moment(nextDate).format('MMM Do, YYYY'),
            };
            currentDateYYYYMMDD = nextDate;
          } else {
            const dayBeforeNewDateYYYYMMDD: string = moment(newDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
            noteGroups.push({
              dateYYYYMMDD: dayBeforeNewDateYYYYMMDD,
              dateString: moment(dayBeforeNewDateYYYYMMDD).format('MMM Do, YYYY'),
              daysAgo: moment().diff(moment(dayBeforeNewDateYYYYMMDD), 'days').toFixed(0),
              notes: [],
              noNotesEndDateYYYYMMDD: nextDate,
              noNotesDateString: moment(nextDate).format('MMM Do, YYYY'),
            });
            currentNoteGroup = {
              dateYYYYMMDD: newDateYYYYMMDD,
              dateString: moment(newDateYYYYMMDD).format('MMM Do, YYYY'),
              daysAgo: moment().diff(moment(newDateYYYYMMDD), 'days').toFixed(0),
              notes: [allNotes[i]],
              noNotesEndDateYYYYMMDD: newDateYYYYMMDD,
              noNotesDateString: moment(newDateYYYYMMDD).format('MMM Do, YYYY'),
            };
            currentDateYYYYMMDD = newDateYYYYMMDD;
          }

        }
      }



      this._allNoteGroups = noteGroups.sort((item1, item2) => {
        if (item1.dateYYYYMMDD < item2.dateYYYYMMDD) {
          return 1;
        } else if (item1.dateYYYYMMDD > item2.dateYYYYMMDD) {
          return -1;
        } else {
          return 0;
        }
      });

      let currentGroupCount = 0;
      let currentIndex: number = 0;
      const showGroups: NoteGroup[] = [];
      while (currentGroupCount < this._maxDefaultResults && currentIndex < noteGroups.length) {
        showGroups.push(this._allNoteGroups[currentIndex]);
        if (this._allNoteGroups[currentIndex].notes.length > 0) {
          currentGroupCount++;
        }
        currentIndex++;
      }
      if (currentIndex < noteGroups.length) {
        this._showMoreButton = true;
      }

      this._showNoteGroups = showGroups;
      this._isLoading = false;
    }

  }


  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  public onClickShowAll() {
    this._showNoteGroups = this._allNoteGroups;
    //   const additional = 10;
    //   const maxResults = this._showNoteGroups.length + additional;
    //   if (this._allNoteGroups.length > maxResults) {
    //     this._showNoteGroups = this._allNoteGroups.slice(0, maxResults - 1);
    //     this._showMoreButton = true;

    //   } else {
    //     this._showNoteGroups = this._allNoteGroups;
    //     this._showMoreButton = false;
    //   }
    // }
  }

}

