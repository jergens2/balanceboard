import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { FormControl } from '@angular/forms';
import { TLEFControllerItem } from '../../TLEF-controller-item.class';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tlef-embedded-note',
  templateUrl: './tlef-embedded-note.component.html',
  styleUrls: ['./tlef-embedded-note.component.css']
})
export class TlefEmbeddedNoteComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  ngOnInit() {
    this._reload();
    this.daybookService.tlefController.currentlyOpenTLEFItem$.subscribe((item)=>{
      if(item){
        this._reload();
      }
    })
  }

  private _isEditing: boolean = false;
  private _isSavedNote: boolean = false;
  private _noteFormControl: FormControl;

  
  private _mouseOverView: boolean = false;
  private _valueChangeSub: Subscription = new Subscription();

  public get isEditing(): boolean { return this._isEditing; }
  public get isSavedNote(): boolean { return this._isSavedNote; }

  public get noteFormControl(): FormControl { return this._noteFormControl; }

  private _reload(){
    const openItem: TLEFControllerItem = this.daybookService.tlefController.currentlyOpenTLEFItem;
    const timelogEntry = openItem.getInitialTLEValue();
    let noteValue: string;
    if(timelogEntry.embeddedNote){
      this._isSavedNote = true;
      noteValue = timelogEntry.embeddedNote;
    }else{
      this._isSavedNote = false;
      noteValue = "Add a note";
    }
    this._noteFormControl = new FormControl(noteValue);

    this._valueChangeSub.unsubscribe();
    this._valueChangeSub = this._noteFormControl.valueChanges.subscribe((value: any)=>{
      console.log("value changed: ", value)
    });

  }


  public onMouseEnterView(){
    this._mouseOverView = true;
  }
  public onMouseLeaveView(){
    this._mouseOverView = false;
  }


}
