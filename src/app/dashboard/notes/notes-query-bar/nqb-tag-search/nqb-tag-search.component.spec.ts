import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NqbTagSearchComponent } from './nqb-tag-search.component';

describe('NqbTagSearchComponent', () => {
  let component: NqbTagSearchComponent;
  let fixture: ComponentFixture<NqbTagSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NqbTagSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NqbTagSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
