import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { FormControl } from '@angular/forms';
import { TLEFControllerItem } from '../../TLEF-controller-item.class';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFController } from '../../TLEF-controller.class';

@Component({
  selector: 'app-tlef-embedded-note',
  templateUrl: './tlef-embedded-note.component.html',
  styleUrls: ['./tlef-embedded-note.component.css']
})
export class TlefEmbeddedNoteComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  ngOnInit() {
    console.log("Note NG ON INIT")
    this._reload();
    this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((item)=>{
      if(item){
        this._reload();
      }
    });
    // this.daybookService.tlefController.changesMadeTLE$.subscribe((item: TimelogEntryItem) => {
    //   if(item === null){
    //     this._reload();
    //   }

    // })
  }

  private _isEditing: boolean = false;
  private _isSavedNote: boolean = false;
  private _noteFormControl: FormControl;
  
  private _noteText: string = "";
  
  private _valueChangeSub: Subscription = new Subscription();
  private _originalTLEValue: TimelogEntryItem;
  private _inputNgClass: any = {};
  private _controller: TLEFController;

  public get isEditing(): boolean { return this._isEditing; }
  public get isSavedNote(): boolean { return this._isSavedNote; }

  public get noteFormControl(): FormControl { return this._noteFormControl; }
  public get noteText(): string { return this._noteText; }
  public get inputNgClass(): any { return this._inputNgClass; }


  private _reload(){
    console.log(" reloading note  : " + this.daybookService.tlefController.currentlyOpenTLEFItem.getInitialTLEValue().embeddedNote);
    this._controller = this.daybookService.tlefController;
    const openItem: TLEFControllerItem = this._controller.currentlyOpenTLEFItem;
    this._originalTLEValue = openItem.getInitialTLEValue();

    let noteValue: string = "";

    if(this._originalTLEValue.embeddedNote){
      this._isSavedNote = true;
      this._isEditing = false;
      noteValue = this._originalTLEValue.embeddedNote; 
    }else{
      this._isSavedNote = false;
      this._isEditing = true;
    }


    this._noteText = noteValue;
    this._noteFormControl = new FormControl(noteValue);

    this._valueChangeSub.unsubscribe();
    this._valueChangeSub = this._noteFormControl.valueChanges.subscribe((value: any)=>{
      this._checkForChanges(value);
    });

  }

  private _checkForChanges(formValue: string){
    let changesMade: boolean = false;
    if(this._noteText === formValue){

    }else{
      changesMade = true;
      let entryItem: TimelogEntryItem = this._originalTLEValue;
      entryItem.embeddedNote = formValue;
      this._controller.makeChangesTLE(entryItem);
    }

  }

  public onClickEdit(){
    this._isEditing = true;
  }


}
