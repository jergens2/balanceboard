import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleConditionEntryInputComponent } from './rule-condition-entry-input.component';

describe('RuleConditionEntryInputComponent', () => {
  let component: RuleConditionEntryInputComponent;
  let fixture: ComponentFixture<RuleConditionEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleConditionEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleConditionEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
