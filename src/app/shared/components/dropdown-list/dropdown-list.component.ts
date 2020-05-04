import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown-list',
  templateUrl: './dropdown-list.component.html',
  styleUrls: ['./dropdown-list.component.css']
})
export class DropdownListComponent implements OnInit {

  constructor() { }

  @Input() listItems: string[];
  @Input() currentValue: string;
  @Output() listItemSelected: EventEmitter<string> = new EventEmitter(); 

  ngOnInit() {

  }

  public onClickListItem(item: string){
    this.listItemSelected.emit(item);
    this._expanded = false;
  }
  public onClickCurrentValue(){
    this._expanded = !this._expanded;
  }

  public onMouseLeave(){
    this._expanded = false;
  }

  private _expanded: boolean = false;
  public get expanded(): boolean{
    return this._expanded;
  }


}
