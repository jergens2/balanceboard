import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesComponent } from './notes.component';
import { NotebookEntryComponent } from './notebook-entry/notebook-entry.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { NotesHeaderComponent } from './notes-sections/notes-header/notes-header.component';
import { NoteGroupComponent } from './note-group/note-group.component';
import { NotesDateSelectorComponent } from './notes-sections/notes-date-selector/notes-date-selector.component';
import { NotesSearchComponent } from './notes-sections/notes-search/notes-search.component';
import { NotesTagsBrowseComponent } from './notes-sections/notes-tags-browse/notes-tags-browse.component';
import { NotesMonthComponent } from './notes-sections/notes-date-selector/notes-month/notes-month.component';
import { NotesSearchListComponent } from './notes-sections/notes-search-list/notes-search-list.component';
import { NdsMonthViewComponent } from './notes-sections/notes-date-selector/nds-month-view/nds-month-view.component';
import { NdsYearsViewComponent } from './notes-sections/notes-date-selector/nds-years-view/nds-years-view.component';

@NgModule({
  declarations: [
    NotesComponent,
    NotebookEntryComponent,
    NotesHeaderComponent,
    NoteGroupComponent,
    NotesDateSelectorComponent,
    NotesTagsBrowseComponent,
    NotesSearchComponent,
    NotesMonthComponent,
    NotesSearchListComponent,
    NdsMonthViewComponent,
    NdsYearsViewComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedModule,
  ]
})
export class NotesModule { }
