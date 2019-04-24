import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NotebookEntry } from './notebook-entry.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IModalOption } from '../../../modal/modal-option.interface';
import { Modal } from '../../../modal/modal.model';
import { ModalService } from '../../../modal/modal.service';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { NotebooksService } from '../notebooks.service';

@Component({
  selector: 'app-notebook-entry',
  templateUrl: './notebook-entry.component.html',
  styleUrls: ['./notebook-entry.component.css']
})
export class NotebookEntryComponent implements OnInit, OnDestroy {

  faTimes = faTimes;

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
    let modal: Modal = new Modal("Confirm: Delete Note?", null, modalOptions, {}, ModalComponentType.Default);
    this._modalSubscription = this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {
      if (selectedOption.value == "Yes") {
        this.notebooksService.deleteNotebookEntryHTTP(this.notebookEntry);
      } else if (selectedOption.value == "No") {

      } else {
        //error 
      }
    });
    this.modalService.activeModal = modal;
  }

}
