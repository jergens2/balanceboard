import { Component, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { NoteQuery } from './note-query.class';
import { NotesService } from '../notes.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notes-query-bar',
  templateUrl: './notes-query-bar.component.html',
  styleUrls: ['./notes-query-bar.component.css']
})
export class NotesQueryBarComponent implements OnInit {

  constructor(private notesService: NotesService) { }

  private _queryExpanded: 'DATE' | 'TAGS' | null  = null;

  public get faCalendarAlt(): IconDefinition { return faCalendarAlt; }
  public get faHashtag(): IconDefinition { return faHashtag; }
  public get query(): NoteQuery { return this.notesService.query }
  public get startDateYYYYMMDD(): string { return moment(this.query.rangeStartYYYYMMDD).format('YYYY-MM-DD'); }
  public get endDateYYYYMMDD(): string { return moment(this.query.rangeEndYYYYMMDD).format('YYYY-MM-DD'); }
  public get resultCount(): string { return this.notesService.currentNotes.length.toFixed(0); }
  public get tagsDisplay(): string { return this.notesService.tagsDisplay; }
  public get queryIsMinimized(): boolean { return this._queryExpanded === null; }
  public get queryIsDate(): boolean { return this._queryExpanded === 'DATE'; }
  public get queryIsTags(): boolean { return this._queryExpanded === 'TAGS'; }

  ngOnInit(): void {
  
  }

  public onClickDates(){
    this._queryExpanded = 'DATE';
  }
  public onClickTags(){
    this._queryExpanded = 'TAGS';
  }
  public onMouseLeave(){
    this._queryExpanded = null;
  }

}
