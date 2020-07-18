import { Component, OnInit } from '@angular/core';
import { ModalService } from './modal.service';
import { Modal } from './modal.class';
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

  private _modal: Modal = null;
  public get modal(): Modal { return this._modal};
  public get message(): string { return this._modal.message; }

  public get modalTypeIsLoading(): boolean { return this.modal.modalComponentType === ModalComponentType.LOADING; }



  ngOnInit() {
    this._modal = this.modalService.activeModal;
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
