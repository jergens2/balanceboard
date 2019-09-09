import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountEntryInputComponent } from './count-entry-input.component';

describe('CountEntryInputComponent', () => {
  let component: CountEntryInputComponent;
  let fixture: ComponentFixture<CountEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
