import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-title-displayer-modifier',
  templateUrl: './title-displayer-modifier.component.html',
  styleUrls: ['./title-displayer-modifier.component.css']
})
export class TitleDisplayerModifierComponent implements OnInit {

  public get faCheck() { return faCheck; }
  public get faTimes() { return faTimes; }

  constructor() { }
  
  private _value: string = "";
  private _isReadOnly: boolean = true;
  private _changeValueForm: FormGroup;

  @Input() public set value(val: string){ 
    this._value = val; 
    this._changeValueForm = new FormGroup({
      'textValue': new FormControl(this._value),
    });
  }
  @Output() public valueChanged: EventEmitter<string> = new EventEmitter();

  public get isReadOnly(): boolean { return this._isReadOnly; }
  public get changeValueForm(): FormGroup { return this._changeValueForm; }
  public get textValue(): string { return this._value; }
  

  ngOnInit(): void {
    this._changeValueForm = new FormGroup({
      'textValue': new FormControl(this._value),
    });

  }

  private _mouseIsIn: boolean = true;
  private _timerSub: Subscription = new Subscription();
  public onMouseLeave(){ 
    this._mouseIsIn = false;
    this._timerSub.unsubscribe();
    this._timerSub = timer(3000).subscribe((tick)=>{
      if(!this._mouseIsIn){
        this._isReadOnly = true; 
      }
    });  
  }
  public onMouseEnter(){
    this._mouseIsIn = true;
  }
  public onClickTitle(){ this._isReadOnly = false; }

  public onClickSaveChanges(){
    const newValue = this._changeValueForm.controls['textValue'].value;
    this._value = newValue;
    this.valueChanged.emit(this._value);
    this._isReadOnly = true;
  }
  public onClickCancel(){ 
    this._isReadOnly = true; 
    this._changeValueForm = new FormGroup({
      'textValue': new FormControl(this._value),
    });
  }

}
