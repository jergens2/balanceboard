import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NotebookEntry } from './notebook-entry.class';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { Modal } from '../../../modal/modal.class';
import { ModalService } from '../../../modal/modal.service';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { NotesService } from '../notes.service';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { NotesHttpService } from '../api/notes-http.service';

@Component({
  selector: 'app-notebook-entry',
  templateUrl: './notebook-entry.component.html',
  styleUrls: ['./notebook-entry.component.css']
})
export class NotebookEntryComponent implements OnInit, OnDestroy {

  faTrash = faTrash;
  faEdit = faEdit;

  @Input() notebookEntry: NotebookEntry;

  constructor(private modalService: ModalService, private notebooksService: NotesService, private httpService: NotesHttpService) { }

  mouseOver: boolean = false;
  private _modalSubscription: Subscription = new Subscription();
  private _noteText: string = "";
  private _isMinimized: boolean = false;
  private _isExpanded: boolean = false;
  private _wordCount: number = 0;

  private get _initialCharacters(): number { return 250; }

  public get noteText(): string { return this._noteText; }
  public get isMinimized(): boolean { return this._isMinimized; }
  public get isExpanded():boolean { return this._isExpanded; }
  public get wordCount(): number { return this._wordCount; }

  ngOnInit() {
    if(this.notebookEntry){
      let text = this.notebookEntry.textContent;
      if(text.length > this._initialCharacters ){
        text = text.substr(0, this._initialCharacters) + "...";
        this._isMinimized = true;
      }
      this._noteText = text;
      this._wordCount = this.notebookEntry.textContent.split(' ').length;
    }
  }

  public onClickNoteText(){
    if(this._isMinimized){
      this._isExpanded = true;
      this._noteText = this.notebookEntry.textContent;
    }
  }

  ngOnDestroy(){
    this._modalSubscription.unsubscribe();
  }

  onMouseEnter(){
    this.mouseOver = true;
  }
  onMouseLeave(){
    this.mouseOver = false;
  }


  onDeleteNote(){
    this.httpService.deleteNotebookEntryHTTP$(this.notebookEntry);
    this.notebooksService.deleteNote(this.notebookEntry);
  }

  onClickEdit(){
    this._modalSubscription.unsubscribe();
    let modalOptions: IModalOption[] = [];
    let modalData: NotebookEntry = this.notebookEntry;
    let modal: Modal = new Modal("Note", "Edit", modalData, modalOptions, {}, ModalComponentType.Note);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      console.log("modal Response, selectedOption")
    });
    this.modalService.openModal(modal);
  }

}
