import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delete-confirm-button',
  templateUrl: './delete-confirm-button.component.html',
  styleUrls: ['./delete-confirm-button.component.css']
})
export class DeleteConfirmButtonComponent implements OnInit {

  constructor() { }

  public faTrash: IconDefinition = faTrash;

  @Input() smallMode: boolean = false;
  @Input() isDiscard: boolean = false;
  @Input() label: string = "Delete";

  private _confirmDelete = false;
  public get confirmDelete(): boolean { return this._confirmDelete; }
  
  @Output() public delete: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
  }

  public onMouseLeave(){
    this._confirmDelete = false;
  }
  public onClickDelete(){
    this._confirmDelete = true;
  }

  public onClickConfirmDelete(){
    this._confirmDelete = false;
    this.delete.emit(true);
  }

}
