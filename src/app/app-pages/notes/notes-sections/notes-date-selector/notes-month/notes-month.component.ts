import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotesDate } from '../notes-date.class';
import { NotesMonth } from './notes-month.class';

@Component({
  selector: 'app-notes-month',
  templateUrl: './notes-month.component.html',
  styleUrls: ['./notes-month.component.css']
})
export class NotesMonthComponent implements OnInit {

  constructor() { }


  private _monthWidth: number;
  private _widthStr: string;
  private _heightStr: string;

  @Input() public notesMonth: NotesMonth;
  @Input() public set monthWidth(width: number) {
    this._monthWidth = width;
    this._widthStr = (this._monthWidth - 10).toFixed(0) + "px";
    this._heightStr = (this._monthWidth - 10 + 20).toFixed(0) + "px";
  }

  @Output() public monthClicked: EventEmitter<string> = new EventEmitter();
  public get monthWidth(): number { return this._monthWidth; }
  public get widthStr(): string { return this._widthStr; }
  public get heightStr(): string { return this._heightStr; }

  private _monthTitle: string;
  private _days: NotesDate[];

  public get monthTitle(): string { return this._monthTitle; }
  public get days(): NotesDate[] { return this._days; }


  ngOnInit(): void {
    if (this.notesMonth) {
      this._monthTitle = this.notesMonth.monthTitle;
      this._days = this.notesMonth.days;
    } else {
      console.log("Error, no notesMonth")
    }


  }

  public onClickMonth() {
    this.monthClicked.emit(this.notesMonth.startOfMonthYYYYMMDD);
    
  }


}
