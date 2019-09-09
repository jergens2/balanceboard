import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledEventInputComponent } from './scheduled-event-input.component';

describe('ScheduledEventInputComponent', () => {
  let component: ScheduledEventInputComponent;
  let fixture: ComponentFixture<ScheduledEventInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledEventInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledEventInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
