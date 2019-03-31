import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTemplatesComponent } from './day-templates.component';

describe('DayTemplatesComponent', () => {
  let component: DayTemplatesComponent;
  let fixture: ComponentFixture<DayTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
