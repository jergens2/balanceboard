import { Component, OnInit, HostListener } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { NoteQuery } from './note-query.class';
import { NoteQueryService } from '../note-query.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notes-query-bar',
  templateUrl: './notes-query-bar.component.html',
  styleUrls: ['./notes-query-bar.component.css']
})
export class NotesQueryBarComponent implements OnInit {

  constructor(private notesService: NoteQueryService) { }

  private _queryExpanded: 'DATE' | 'TAGS' | null  = null;
  private _mouseIsOver: boolean = false;

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

  @HostListener('window:click') onClick(){
    if(!this._mouseIsOver){
      console.log("CLICK.  but mouse is not over.")
      this._queryExpanded = null;
    }
  }

  ngOnInit(): void {
  
  }

  public onClickDates(){
    if(this._queryExpanded === 'DATE'){
      this._queryExpanded = null;
    }else{
      this._queryExpanded = 'DATE';
    }
  }
  public onClickTags(){
    if(this._queryExpanded === 'TAGS'){
      this._queryExpanded = null;
    }else{
      this._queryExpanded = 'TAGS';
    }
    
  }
  public onMouseLeave(){
    this._mouseIsOver = false;
  }
  public onMouseEnter(){
    this._mouseIsOver = true;
  }

}
