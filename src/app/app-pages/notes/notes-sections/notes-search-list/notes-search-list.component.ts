import { Component, Input, OnInit } from '@angular/core';
import { NotebookEntry } from '../../notebook-entry/notebook-entry.class';
import { NotesListItem } from './notes-list-item.class';

@Component({
  selector: 'app-notes-search-list',
  templateUrl: './notes-search-list.component.html',
  styleUrls: ['./notes-search-list.component.css']
})
export class NotesSearchListComponent implements OnInit {

  constructor() { }

  @Input() public set notes(notes: NotebookEntry[]){
    this._notesList = notes.map(n => {
      const listItem = new NotesListItem(n);
      listItem.journalDate = n.journalDate;
      listItem.setDateModified(n.dateModified);
      listItem.data = n.data;
      return listItem;
    });
  }


  private _notesList: NotesListItem[] = [];

  public get notesList(): NotesListItem[] { return this._notesList; }


  ngOnInit(): void {
  }

}
