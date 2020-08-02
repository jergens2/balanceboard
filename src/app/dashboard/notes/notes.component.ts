import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from './notebook-entry/notebook-entry.class';
import { NotebooksService } from './notebooks.service';
import * as moment from 'moment';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { TimeViewsManager } from '../../shared/time-views/time-views-manager.class';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  faCog: IconDefinition = faCog;
  faHashtag = faHashtag;
  faCalendarAlt = faCalendarAlt;


  constructor(private notebooksService: NotebooksService) { }

  private _isLoading: boolean = true;
  private _allNotebookEntries: NotebookEntry[] = [];
  private _timeViewsManager: TimeViewsManager;
  private _filteredNotebookEntries: NotebookEntry[] = [];

  public get isLoading(): boolean { return this._isLoading; }
  public get timeViewsManager(): TimeViewsManager { return this._timeViewsManager; }

  public get filteredNotebookEntries(): NotebookEntry[] { return this._filteredNotebookEntries; };


  loadingStart: moment.Moment = moment();
  loadingEnd: moment.Moment = moment();

  ngOnInit() {
    this._isLoading = true;
    this._timeViewsManager = new TimeViewsManager();
    this.notebooksService.fetchNotebookEntries$().subscribe(entries => {
      if(entries){
        this._allNotebookEntries = entries.sort((n1, n2) => {
          if (n1.journalDate > n2.journalDate) { return -1; }
          else if (n1.journalDate < n2.journalDate) { return 1; }
          else { return 0; }
        });
        this._timeViewsManager.setNotebooksView(entries);
        if (this._allNotebookEntries.length > 10) {
          this._filteredNotebookEntries = this._allNotebookEntries.slice(0, 9);
        } else {
          this._filteredNotebookEntries = this._allNotebookEntries;
        }
        console.log("IS LOADING?  ", this._isLoading);
        this._isLoading = false;
      }

    });

  }







  onNotesFiltered(notes: NotebookEntry[]) {
    this._filteredNotebookEntries = notes;
  }

  tagsMenu: boolean = false;
  timeViewsMenu: boolean = false;

  onToggleTagsMenu() {
    this.tagsMenu = !this.tagsMenu;
    if (!this.tagsMenu) {
      this._filteredNotebookEntries = this._allNotebookEntries;
    }

  }

  onToggleTimeViewsMenu() {
    this.timeViewsMenu = !this.timeViewsMenu;
  }

}
