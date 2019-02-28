import { Injectable } from '@angular/core';
import { Modal } from './modal.model';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private _activeModal: Modal;

  private _activeModal$: Subject<Modal> = new Subject();
  public get activeModal$(): Observable<Modal> {
    return this._activeModal$.asObservable();
  }

  private _modalResponse$: Subject<string> = new Subject();
  public get modalResponse$(): Observable<string>{ 
    return this._modalResponse$.asObservable();
  }


  set activeModal(modal: Modal){
    this._activeModal = modal;
    this._activeModal$.next(this._activeModal);
  };

  get activeModal(): Modal{
    return this._activeModal;
  }

  optionClicked(option: string){
    this._activeModal = null;
    this._modalResponse$.next(option);
    this._activeModal$.next(null);
  }


  closeModal(){
    this._activeModal = null;
    this._activeModal$.next(this._activeModal);
  }

  constructor() { }
}
