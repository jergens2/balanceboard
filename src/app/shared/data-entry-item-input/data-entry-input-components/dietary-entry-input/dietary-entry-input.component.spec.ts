import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DietaryEntryInputComponent } from './dietary-entry-input.component';

describe('DietaryEntryInputComponent', () => {
  let component: DietaryEntryInputComponent;
  let fixture: ComponentFixture<DietaryEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DietaryEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DietaryEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
