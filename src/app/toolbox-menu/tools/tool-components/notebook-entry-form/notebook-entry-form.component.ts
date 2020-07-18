import { Component, OnInit } from '@angular/core';

import { ToolboxService } from '../../../toolbox.service';
import { ToolType } from '../../../tool-type.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NotebookEntry } from '../../../../dashboard/notes/notebook-entry/notebook-entry.model';
import { NotebookEntryTypes } from '../../../../dashboard/notes/notebook-entry/notebook-entry-types.enum';
import { NotebooksService } from '../../../../dashboard/notes/notebooks.service';
import { ModalService } from '../../../../modal/modal.service';



@Component({
  selector: 'app-notebook-entry-form',
  templateUrl: './notebook-entry-form.component.html',
  styleUrls: ['./notebook-entry-form.component.css']
})
export class NotebookEntryFormComponent implements OnInit {



  constructor(
    private toolsService: ToolboxService,
    private notebooksService: NotebooksService,
    private modalService: ModalService
  ) { }


  private _currentDate: moment.Moment = moment();


  public get date(): string{
    return this._currentDate.format('YYYY-MM-DD');
  }

  notepadForm: FormGroup = null;

  ngOnInit() {
    this.notepadForm = new FormGroup({
      "journalDate": new FormControl(this._currentDate.format('YYYY-MM-DD'), Validators.required),
      "title": new FormControl("", Validators.required),
      "tags": new FormControl(""),
      "noteBody": new FormControl(null, Validators.required),
    })

  }

  onClickCloseNotepad() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
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

    let textContent = this.notepadForm.get('noteBody').value;
    let title = this.notepadForm.get('title').value; 
    let tags: string[] = this.getTags((this.notepadForm.get('tags').value as string));
    let journalDate: moment.Moment = moment(this.notepadForm.controls['journalDate'].value);


    let notebookEntry: NotebookEntry = new NotebookEntry('','', journalDate, NotebookEntryTypes.Note, textContent, title, tags);

    // console.log("Saving note:", notebookEntry);
    this.notebooksService.saveNotebookEntry(notebookEntry);
    this.toolsService.closeTool();
  }


  private getTags(input: string): string[]{
    let tags: string[] = input.toLowerCase().split(" ");
    tags = tags.filter((tag)=>{
      if(tag != "" && tag != " "){
        return tag;
      }
    })
    return tags;
  }


  setDate: boolean = false;
  onClickSetDate(){
    this.setDate = true;
  }

}
