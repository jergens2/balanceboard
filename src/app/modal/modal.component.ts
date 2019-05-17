import { Component, OnInit } from '@angular/core';
import { ModalService } from './modal.service';
import { Modal } from './modal.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ModalComponentType } from './modal-component-type.enum';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  faTimes = faTimes;

  constructor(private modalService: ModalService) { }

  modal: Modal = null;



  ngOnInit() {
    this.modal = this.modalService.activeModal;
    this.modal.modalComponentType
  }

  onClickCloseModal(){
    this.modalService.closeModal();
  }

  onClickOption(option: any){
    this.modalService.optionClicked(option);
  }

  get modalHeader(): string{ 
    return this.modal.header;
  }


}
