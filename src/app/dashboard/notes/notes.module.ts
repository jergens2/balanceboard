import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes.component';
import { NotebookEntryComponent } from './notebook-entry/notebook-entry.component';
import { NotesQueryBarComponent } from './notes-query-bar/notes-query-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { NqbDateSearchComponent } from './notes-query-bar/nqb-date-search/nqb-date-search.component';
import { NqbTagSearchComponent } from './notes-query-bar/nqb-tag-search/nqb-tag-search.component';
import { NotesHeaderComponent } from './notes-header/notes-header.component';
import { NoteGroupComponent } from './note-group/note-group.component';

@NgModule({
  declarations: [
    NotesComponent,
    NotebookEntryComponent,
    NotesQueryBarComponent,
    NqbDateSearchComponent,
    NqbTagSearchComponent,
    NotesHeaderComponent,
    NoteGroupComponent,
    
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedModule,
  ]
})
export class NotesModule { }
