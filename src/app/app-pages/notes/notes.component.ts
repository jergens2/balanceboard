import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.class';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeViewsManager } from '../../shared/time-views/time-views-manager.class';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { NoteHttpService } from './api/note-http.service';
import { NoteGroup } from './note-group/note-group.interface';
import { UserAccountProfileService } from '../user-account-profile/user-account-profile.service';
import { AppScreenSizeService } from 'src/app/shared/app-screen-size/app-screen-size.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {

  faCog: IconDefinition = faCog;
  faHashtag = faHashtag;
  faCalendarAlt = faCalendarAlt;


  /**
   * BEHAVIOR
   * 
   * -view notes in a list, like a journal
   * -search notes
   * -- when searching, get results for tags and notes.
   *    searching necessarily requires a start date.  set to beginning of previous year.  e.g. if today is 2021-03-04, 
   *    then start by going back to 2020-01-01
   * -- can change the range start, which will initiate a load of older years with an HTTP request
   * -- search provides search results in a list
   * 
   * --need to browse tags
   * --browse by date selector. 
   */

  constructor(private noteHttpService: NoteHttpService, private sizeService: AppScreenSizeService) { }

  private _isLoading: boolean = true;
  private _showMoreButton: boolean = false;


  private _allNotes: NotebookEntry[] = [];

  private _openHeaderItem: 'TAGS'|'SEARCH'|'CALENDAR' | 'READ' = 'READ';



  private _allNoteGroups: NoteGroup[] = [];
  private _showNoteGroups: NoteGroup[] = [];

  private get _maxDefaultResults(): number { return 11; }
  private _maxHeightStr: string;


  public get isLoading(): boolean { return this._isLoading; }
  public get maxHeight(): string { return this._maxHeightStr; }
  public get showMoreButton(): boolean { return this._showMoreButton; }
  
  public get noteGroups(): NoteGroup[] { return this._allNoteGroups; }
  public get showNoteGroups(): NoteGroup[] { return this._showNoteGroups; }

  public get openItem(): 'TAGS'|'SEARCH'|'CALENDAR' | 'READ' { return this._openHeaderItem; }
  public get headerItemIsOpen(): boolean { return this.openItem !== null; }
  public get tagsIsOpen(): boolean { return this.openItem === 'TAGS'; }
  public get searchIsOpen(): boolean { return this.openItem === 'SEARCH'; }
  public get calendarIsOpen(): boolean { return this.openItem === 'CALENDAR';}
  public get readIsOpen(): boolean { return this.openItem === 'READ'; }

  public get showSearch(): boolean { return this.searchIsOpen && !this.isLoading; }
  public get showTags(): boolean { return this.tagsIsOpen && !this.isLoading; }
  public get showCalendar(): boolean { return this.calendarIsOpen && !this.isLoading; }
  public get showRead(): boolean { return this.readIsOpen && !this.isLoading; }



  public onHeaderItemSelected(item: 'TAGS'|'SEARCH'|'CALENDAR' | 'READ'){
    this._openHeaderItem = item;
  }


  private _subscriptions: Subscription[] = [];

  ngOnInit() {
    this._updateSize();
    this._allNotes = this.noteHttpService.allNotes;
    this._subscriptions = [
      this.noteHttpService.allNotes$.subscribe((allNotes) => {
        this._allNotes = allNotes;
        this._reload();
      }),
      this.sizeService.appScreenSize$.subscribe((size)=>{
        this._updateSize();
      })
    ];

  }


  private _updateSize(){
    const headerHeight = 100;
    const windowHeight = this.sizeService.height;
    const contentHeight = windowHeight - headerHeight;
    this._maxHeightStr = contentHeight + 'px';
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
    if (allNotes.length > 0) {
      let currentDateYYYYMMDD: string = allNotes[0].journalDateYYYYMMDD;
      let currentNoteGroup: NoteGroup = this._newNoteGroup(currentDateYYYYMMDD, []);
      for (let i = 0; i < allNotes.length; i++) {
        if (currentDateYYYYMMDD === allNotes[i].journalDateYYYYMMDD) {
          currentNoteGroup.notes.push(allNotes[i].clone());
        } else {
          noteGroups.push(currentNoteGroup);
          const nextDate = moment(currentDateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD');
          const newDateYYYYMMDD: string = allNotes[i].journalDateYYYYMMDD;
          if (nextDate === newDateYYYYMMDD) {
            currentNoteGroup = this._newNoteGroup(nextDate, [allNotes[i]]);
            currentDateYYYYMMDD = nextDate;
          } else {
            const dayBeforeNewDateYYYYMMDD: string = moment(newDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
            noteGroups.push(this._newNoteGroup(dayBeforeNewDateYYYYMMDD, [], nextDate));
            currentNoteGroup = this._newNoteGroup(newDateYYYYMMDD, [allNotes[i]]);
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


  private _newNoteGroup(dateYYYYMMDD: string, notes: NotebookEntry[], endDateYYYYMMDD?: string): NoteGroup {
    const noteGroup = {
      dateYYYYMMDD: dateYYYYMMDD,
      dateString: moment(dateYYYYMMDD).format('MMMM Do, YYYY'),
      daysAgo: moment().diff(moment(dateYYYYMMDD), 'days').toFixed(0),
      notes: notes,
      noNotesEndDateYYYYMMDD: dateYYYYMMDD,
      noNotesDateString: moment(dateYYYYMMDD).format('MMM Do, YYYY'),
    };
    if (endDateYYYYMMDD) {
      noteGroup.noNotesEndDateYYYYMMDD = endDateYYYYMMDD;
      noteGroup.noNotesDateString = moment(endDateYYYYMMDD).format('MMM Do, YYYY');
    }
    return noteGroup;
  }

}

