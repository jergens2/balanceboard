import { Component, OnInit } from '@angular/core';
import { NotebookEntry } from '../../../dashboard/notes/notebook-entry/notebook-entry.class';
import { Modal } from '../../modal.class';
import { ModalService } from '../../modal.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotebooksService } from '../../../dashboard/notes/notebooks.service';

@Component({
  selector: 'app-notepad-modal',
  templateUrl: './notepad-modal.component.html',
  styleUrls: ['./notepad-modal.component.css']
})
export class NotepadModalComponent implements OnInit {

  constructor(private modalService: ModalService, private notebooksService: NotebooksService) { }

  modal: Modal;
  notebookEntry: NotebookEntry;

  updateNoteForm: FormGroup = null;

  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this.notebookEntry = this.modal.modalData as NotebookEntry;
    let tags: string = "";
    this.notebookEntry.tags.forEach((tag) => {
      tags += tag + " ";
    })

    this.updateNoteForm = new FormGroup({
      'journalDate': new FormControl(this.notebookEntry.journalDate.format('YYYY-MM-DD'), Validators.required),
      "title": new FormControl(this.notebookEntry.title, Validators.required),
      "tags": new FormControl(tags, Validators.required),
      "textContent": new FormControl(this.notebookEntry.textContent, Validators.required),
    })
    console.log("entry is", this.notebookEntry)
  }



  onClickSave() {
    let tags: string[] = this.getTags(this.updateNoteForm.controls['tags'].value);
    let updatedNote: NotebookEntry = new NotebookEntry(
      this.notebookEntry.id,
      this.notebookEntry.userId,
      this.notebookEntry.dateCreated,
      this.notebookEntry.type,
      this.updateNoteForm.controls['textContent'].value,
      this.updateNoteForm.controls['title'].value,
      tags
    );
    this.notebooksService.updateNotebookEntryHTTP(updatedNote);
    this.modalService.closeModal();
  }

  onClickCancel() {
    this.modalService.closeModal();
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


}
