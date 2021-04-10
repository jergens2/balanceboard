import { Component, Input, OnInit } from '@angular/core';
import { NotesDate } from '../notes-date.class';
import { NotesMonth } from '../notes-month/notes-month.class';

@Component({
  selector: 'app-nds-month-view',
  templateUrl: './nds-month-view.component.html',
  styleUrls: ['./nds-month-view.component.css']
})
export class NdsMonthViewComponent implements OnInit {

  constructor() { }

  @Input() month: NotesMonth;

  public get days(): NotesDate[] { return this.month.days; }

  ngOnInit(): void {
  }

}
