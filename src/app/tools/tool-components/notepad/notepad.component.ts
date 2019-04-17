import { Component, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToolsService } from '../../tools.service';
import { ToolComponents } from '../../tool-components.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { JournalService } from '../../../dashboard/journal/journal.service';
import { JournalEntry } from '../../../dashboard/journal/journal-entry.model';
import { JournalEntryTypes } from '../../../dashboard/journal/journal-entry-types.enum';


@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit {

  faTimes = faTimes;


  constructor(
    private toolsService: ToolsService,
    private journalService: JournalService,
  ) { }


  private _currentDate: moment.Moment = moment();
  public get date(): string{
    return this._currentDate.format('YYYY-MM-DD');
  }
  notepadForm: FormGroup = null;

  ngOnInit() {
    this.notepadForm = new FormGroup({
      'dateCreated': new FormControl(this._currentDate.format('YYYY-MM-DD'), Validators.required),
      "title": new FormControl(""),
      "tags": new FormControl(""),
      "noteBody": new FormControl(null, Validators.required),
    })

  }

  onClickCloseNotepad() {
    this.toolsService.closeTool(ToolComponents.Notepad);
  }

  get formIsValid(): boolean{
    return this.notepadForm.valid;
  }
  get saveDisabled(): string{
    if(this.notepadForm.valid){
      return "";
    }else{
      return "disabled";
    }
  }

  onClickSaveNote(){

    let journalEntry: JournalEntry = new JournalEntry();
    journalEntry.type = JournalEntryTypes.Note;
    journalEntry.forDate = moment();
    journalEntry.dateCreated = moment();
    journalEntry.dateModified = moment();
    journalEntry.textContent = this.notepadForm.get('noteBody').value;
    journalEntry.title = this.notepadForm.get('title').value;
    let tags: string[] = (this.notepadForm.get('tags').value as string).split(" ");
    journalEntry.tags = tags

    this.journalService.saveJournalEntry(journalEntry);
    this.toolsService.closeTool(ToolComponents.Notepad);
  }

}
