import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialEntryInputComponent } from './financial-entry-input.component';

describe('FinancialEntryInputComponent', () => {
  let component: FinancialEntryInputComponent;
  let fixture: ComponentFixture<FinancialEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
