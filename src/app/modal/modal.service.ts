import { Injectable } from '@angular/core';
import { Modal } from './modal.class';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { IModalOption } from './modal-option.interface';
import { ModalComponentType } from './modal-component-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ModalService {


  private _activeModal$: BehaviorSubject<Modal> = new BehaviorSubject(null);
  private _modalResponse$: Subject<IModalOption> = new Subject();

  public get activeModal$(): Observable<Modal> { return this._activeModal$.asObservable(); }
  public get activeModal(): Modal { return this._activeModal$.getValue(); }
  public get modalIsOpen(): boolean { return this._activeModal$.getValue() !== null; } 
  public get modalResponse$(): Observable<IModalOption> { return this._modalResponse$.asObservable(); }

  public openModal(modal: Modal) { this._activeModal$.next(modal); };
  public openLoadingModal(loadingMessage: string){
    const loadingModal: Modal = new Modal('Loading', loadingMessage, null, [], {}, ModalComponentType.LOADING);
    this._activeModal$.next(loadingModal);
  }

  public optionClicked(option: IModalOption) {
    this._modalResponse$.next(option);
    this._activeModal$.next(null);
  }


  public closeModal() {
    this._activeModal$.next(null);
  }

  constructor() { }
}
