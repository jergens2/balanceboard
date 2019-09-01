import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MorningRoutineSectionComponent } from './morning-routine-section.component';

describe('MorningRoutineSectionComponent', () => {
  let component: MorningRoutineSectionComponent;
  let fixture: ComponentFixture<MorningRoutineSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MorningRoutineSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MorningRoutineSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
