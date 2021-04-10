import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesTagsBrowseComponent } from './notes-tags-browse.component';

describe('NotesTagsBrowseComponent', () => {
  let component: NotesTagsBrowseComponent;
  let fixture: ComponentFixture<NotesTagsBrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesTagsBrowseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesTagsBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
