import { Component, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToolsService } from '../../tools.service';
import { ToolComponents } from '../../tool-components.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NotebookEntry } from '../../../dashboard/notebooks/notebook-entry/notebook-entry.model';
import { NotebookEntryTypes } from '../../../dashboard/notebooks/notebook-entry/notebook-entry-types.enum';
import { NotebooksService } from '../../../dashboard/notebooks/notebooks.service';



@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit {

  faTimes = faTimes;


  constructor(
    private toolsService: ToolsService,
    private notebooksService: NotebooksService
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

    let notebookEntry: NotebookEntry = new NotebookEntry();
    notebookEntry.type = NotebookEntryTypes.Note;
    notebookEntry.forDate = moment();
    notebookEntry.dateCreated = moment();
    notebookEntry.dateModified = moment();
    notebookEntry.textContent = this.notepadForm.get('noteBody').value;
    notebookEntry.title = this.notepadForm.get('title').value;
    let tags: string[] = (this.notepadForm.get('tags').value as string).split(" ");
    notebookEntry.tags = tags

    this.notebooksService.saveNotebookEntry(notebookEntry);
    this.toolsService.closeTool(ToolComponents.Notepad);
  }

}
