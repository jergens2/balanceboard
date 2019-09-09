import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightlogEntryInputComponent } from './weightlog-entry-input.component';

describe('WeightlogEntryInputComponent', () => {
  let component: WeightlogEntryInputComponent;
  let fixture: ComponentFixture<WeightlogEntryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeightlogEntryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightlogEntryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
