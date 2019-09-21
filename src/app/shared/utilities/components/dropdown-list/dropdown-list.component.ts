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
  }

  public onMouseLeave(){
    this.listItemSelected.emit("");
  }

}
