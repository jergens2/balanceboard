import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthSymptomEntryInputComponent } from './health-symptom-entry-input.component';

describe('HealthSymptomEntryInputComponent', () => {
  let component: HealthSymptomEntryInputComponent;
  let fixture: ComponentFixture<HealthSymptomEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthSymptomEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthSymptomEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
