import { Component, Input, OnInit } from '@angular/core';

import { ToolboxService } from '../../../../toolbox/toolbox.service';
import { ToolType } from '../../../../toolbox/tool-type.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NotebookEntry } from '../notebook-entry.class';
import { NotebookEntryTypes } from '../notebook-entry-types.enum';
import { ModalService } from '../../../../modal/modal.service';
import { NoteHttpService } from '../../api/note-http.service';



@Component({
  selector: 'app-notebook-entry-form',
  templateUrl: './notebook-entry-form.component.html',
  styleUrls: ['./notebook-entry-form.component.css']
})
export class NotebookEntryFormComponent implements OnInit {

  private _editNoteEntry: NotebookEntry;

  @Input() public set editNoteEntry(note: NotebookEntry) {
    if (note) {
      this._editNoteEntry = note;
    }
  }

  constructor(
    private toolsService: ToolboxService,
    private notesHttpService: NoteHttpService,
    private modalService: ModalService
  ) { }


  private _currentDate: moment.Moment = moment();


  public get date(): string {
    return this._currentDate.format('YYYY-MM-DD');
  }

  notepadForm: FormGroup = null;

  ngOnInit() {
    let journalDate = this._currentDate.toISOString();
    let title = "";
    let tags = "";
    let noteBody = null;
    if (this._editNoteEntry) {
      title = this._editNoteEntry.title;
      this._editNoteEntry.tags.forEach(tag => tags += tag + " ");
      noteBody = this._editNoteEntry.textContent;
    }
    this.notepadForm = new FormGroup({
      "journalDate": new FormControl(journalDate, Validators.required),
      "title": new FormControl(title, Validators.required),
      "tags": new FormControl(tags),
      "noteBody": new FormControl(noteBody, Validators.required),
    });
  }

  onClickCloseNotepad() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  get formIsValid(): boolean {
    return this.notepadForm.valid;
  }
  get saveDisabled(): string {
    if (this.notepadForm.valid) {
      return "";
    } else {
      return "disabled";
    }
  }

  onClickSaveNote() {

    let textContent = this.notepadForm.get('noteBody').value;
    let title = this.notepadForm.get('title').value;
    let tags: string[] = this.getTags((this.notepadForm.get('tags').value as string));
    let journalDate: moment.Moment = moment(this.notepadForm.controls['journalDate'].value);


    let notebookEntry: NotebookEntry = new NotebookEntry('', '', journalDate, NotebookEntryTypes.Note, textContent, title, tags);

    // console.log("Saving note:", notebookEntry);
    if (this._editNoteEntry) {
      const id = this._editNoteEntry.id;
      const userId = this._editNoteEntry.userId;
      const dateCreated = moment(this._editNoteEntry.dateCreated);
      notebookEntry = new NotebookEntry(id, userId, dateCreated, NotebookEntryTypes.Note, textContent, title, tags);
      notebookEntry.setDateModified(moment());
      notebookEntry.journalDate = this._editNoteEntry.journalDate;
      this.notesHttpService.updateNotebookEntryHTTP$(notebookEntry);
    } else {
      this.notesHttpService.saveNotebookEntry$(notebookEntry);
    }

    this.toolsService.closeTool();
  }


  private getTags(input: string): string[] {
    let tags: string[] = input.toLowerCase().split(" ");
    tags = tags.filter((tag) => {
      if (tag != "" && tag != " ") {
        return tag;
      }
    })
    return tags;
  }


  setDate: boolean = false;
  onClickSetDate() {
    this.setDate = true;
  }

}
