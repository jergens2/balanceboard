import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderEntryInputComponent } from './reminder-entry-input.component';

describe('ReminderEntryInputComponent', () => {
  let component: ReminderEntryInputComponent;
  let fixture: ComponentFixture<ReminderEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReminderEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
