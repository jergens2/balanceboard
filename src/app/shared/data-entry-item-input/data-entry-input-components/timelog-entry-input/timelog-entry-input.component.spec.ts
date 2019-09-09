import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelogEntryInputComponent } from './timelog-entry-input.component';

describe('TimelogEntryInputComponent', () => {
  let component: TimelogEntryInputComponent;
  let fixture: ComponentFixture<TimelogEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelogEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelogEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
