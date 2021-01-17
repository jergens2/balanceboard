import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-new-item-circle-button',
  templateUrl: './new-item-circle-button.component.html',
  styleUrls: ['./new-item-circle-button.component.css']
})
export class NewItemCircleButtonComponent implements OnInit {

  constructor() { }

  private _icon = this.faPlus; 
  public get faPlus() { return faPlus; }
  public get icon() { return this._icon; }

  @Input() diameter: number;
  @Input() public set icon(iconValue){ this._icon = iconValue; }

  private _fontSizePx: number = 12; 

  public get ngStyle(): any { 
    return {
      'width':this.diameter+'px',
      'height':this.diameter+'px',
      'border-radius':this.diameter+'px',
      'font-size':this._fontSizePx+'px',
    };
  }

  ngOnInit(): void {
    if(!this.diameter){
      this.diameter = 27;
    }
    if(this.diameter %2 === 0){
      this.diameter = this.diameter + 1;
    }
    this._fontSizePx = Math.floor(this.diameter/2);
  }
}
