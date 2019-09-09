import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeelingEntryInputComponent } from './feeling-entry-input.component';

describe('FeelingEntryInputComponent', () => {
  let component: FeelingEntryInputComponent;
  let fixture: ComponentFixture<FeelingEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeelingEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeelingEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
