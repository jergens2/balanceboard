import { Component, OnInit } from '@angular/core';
import { NoteHttpService } from '../../api/note-http.service';
import { NotesTag } from './notes-tag.class';
import { NotesTagsBuilder } from './notes-tags-builder.class';

@Component({
  selector: 'app-notes-tags-browse',
  templateUrl: './notes-tags-browse.component.html',
  styleUrls: ['./notes-tags-browse.component.css']
})
export class NotesTagsBrowseComponent implements OnInit {

  constructor(private noteService: NoteHttpService) { }

  private _notesTags: NotesTag[] = [];
  public get notesTags(): NotesTag[] { return this._notesTags; }

  ngOnInit(): void {

    const allNotes = this.noteService.allNotes;
    const builder: NotesTagsBuilder = new NotesTagsBuilder(allNotes); 
    this._notesTags = builder.notesTags;
  }

  public onClickTagRow(clickedTag: NotesTag){
    this.notesTags.forEach(tag => {

      if(clickedTag.name === tag.name){
        if(clickedTag.isExpanded){
          clickedTag.closeTagRow();
        }else{
          clickedTag.openTagRow();
        }
      }else{
        tag.closeTagRow();
      }
    });
  }

}
