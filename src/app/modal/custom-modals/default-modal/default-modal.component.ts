import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { Modal } from '../../modal.model';
import { IModalOption } from '../../modal-option.interface';

@Component({
  selector: 'app-default-modal',
  templateUrl: './default-modal.component.html',
  styleUrls: ['./default-modal.component.css']
})
export class DefaultModalComponent implements OnInit {

  constructor(private modalService: ModalService) { }

  modal: Modal = null;
  ngOnInit() {
    this.modal = this.modalService.activeModal;
  }

  onClickCloseModal(){
    this.modalService.closeModal();
  }

  onClickOption(option: IModalOption){
    this.modalService.optionClicked(option);
  }
}
