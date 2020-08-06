import { Component, OnInit } from '@angular/core';
import { TimeViewsManager } from '../../../../shared/time-views/time-views-manager.class';
import { NotesService } from '../../notes.service';

@Component({
  selector: 'app-nqb-date-search',
  templateUrl: './nqb-date-search.component.html',
  styleUrls: ['./nqb-date-search.component.css']
})
export class NqbDateSearchComponent implements OnInit {

  constructor(private noteService: NotesService) { }

  public get timeViewsManager(): TimeViewsManager{ return this.noteService.timeViewsManager; }

  ngOnInit(): void {
    console.log("Manager: " , this.timeViewsManager)
  }

}
