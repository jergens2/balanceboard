import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotesService } from '../../notes.service';
import { Subscription } from 'rxjs';
import { NoteTag } from './note-tag.class';
import { NoteTagBuilder } from './note-tag-builder';
import { ButtonMenu } from '../../../../shared/components/button-menu/button-menu.class';
import { Button } from 'protractor';
import { NoteQuery } from '../note-query.class';

@Component({
  selector: 'app-nqb-tag-search',
  templateUrl: './nqb-tag-search.component.html',
  styleUrls: ['./nqb-tag-search.component.css']
})
export class NqbTagSearchComponent implements OnInit, OnDestroy {

  constructor(private noteService: NotesService) { }


  private _subscription: Subscription = new Subscription();
  private _tags: NoteTag[] = [];
  private _buttonMenu: ButtonMenu;
  
  public get tags(): NoteTag[] { return this._tags; }
  public get buttonMenu(): ButtonMenu { return this._buttonMenu; }

  ngOnInit(): void {
    this._buttonMenu = new ButtonMenu('SEPARATED');
    this._buttonMenu.addItem$('Disable all').subscribe(d => this._disableAll());
    this._buttonMenu.addItem$('Enable all').subscribe(e => this._enableAll());
    this._reinitiate();
    this._subscription = this.noteService.currentNotes$.subscribe(notes => {
      this._reinitiate();
    })
  }

  private _disableAll(){
    this._tags.forEach(t => t.disable());
    this._reQuery();
  }
  private _enableAll(){
    this._tags.forEach(t => t.enable());
    this._reQuery();
  }

  private _reinitiate(){
    const notes = this.noteService.currentNotes;
    const builder: NoteTagBuilder = new NoteTagBuilder(notes);
    this._tags = builder.tags;
    this._reQuery();
  }

  ngOnDestroy(){
    this._subscription.unsubscribe();
  }


  public onClick(tag: NoteTag){
    tag.onClick();
    this._reQuery();
  }



  private _reQuery(){
    console.log("Requery")
    // this.noteService.setQuery(new NoteQuery())
  }
}
