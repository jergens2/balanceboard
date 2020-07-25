import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvMonthViewComponent } from './tv-month-view.component';

describe('TvMonthViewComponent', () => {
  let component: TvMonthViewComponent;
  let fixture: ComponentFixture<TvMonthViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvMonthViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvMonthViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
