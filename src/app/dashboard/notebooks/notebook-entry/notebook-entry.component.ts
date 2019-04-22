import { Component, OnInit, Input } from '@angular/core';
import { NotebookEntry } from './notebook-entry.model';

@Component({
  selector: 'app-notebook-entry',
  templateUrl: './notebook-entry.component.html',
  styleUrls: ['./notebook-entry.component.css']
})
export class NotebookEntryComponent implements OnInit {



  @Input() notebookEntry: NotebookEntry;

  constructor() { }

  ngOnInit() {
  }

}
