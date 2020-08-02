import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NotebookEntry } from './notebook-entry.class';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { Modal } from '../../../modal/modal.class';
import { ModalService } from '../../../modal/modal.service';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { NotebooksService } from '../notebooks.service';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-notebook-entry',
  templateUrl: './notebook-entry.component.html',
  styleUrls: ['./notebook-entry.component.css']
})
export class NotebookEntryComponent implements OnInit, OnDestroy {

  faTrash = faTrash;
  faEdit = faEdit;

  @Input() notebookEntry: NotebookEntry;

  constructor(private modalService: ModalService, private notebooksService: NotebooksService) { }

  mouseOver: boolean = false;
  private _modalSubscription: Subscription = new Subscription();

  ngOnInit() {
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

  onClickDelete(){
    this._modalSubscription.unsubscribe();
    let modalOptions: IModalOption[] = [
      {
        value: "Yes",
        dataObject: null
      },
      {
        value: "No",
        dataObject: null
      }
    ];
    let modal: Modal = new Modal("Note", "Confirm: Delete Note?", null, modalOptions, {}, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        this.notebooksService.deleteNotebookEntryHTTP(this.notebookEntry);
      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.openModal(modal);
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

  tags(): string{
    let tags = "";
    
    this.notebookEntry.tags.forEach((tag)=>{
      tags += tag + " ";
    })
    return tags;
  }

}
