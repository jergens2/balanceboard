import { Component, OnInit } from '@angular/core';
import { Modal } from '../../modal.model';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit {

  constructor(private modalService: ModalService) { }

  modal: Modal;
  ngOnInit() {
    this.modal = this.modalService.activeModal
  }

  onClickOption(option: any){
    this.modalService.optionClicked(option);
  }

}
