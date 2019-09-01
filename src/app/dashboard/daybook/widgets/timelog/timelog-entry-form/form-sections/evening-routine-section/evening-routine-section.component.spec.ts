import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EveningRoutineSectionComponent } from './evening-routine-section.component';

describe('EveningRoutineSectionComponent', () => {
  let component: EveningRoutineSectionComponent;
  let fixture: ComponentFixture<EveningRoutineSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EveningRoutineSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EveningRoutineSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
