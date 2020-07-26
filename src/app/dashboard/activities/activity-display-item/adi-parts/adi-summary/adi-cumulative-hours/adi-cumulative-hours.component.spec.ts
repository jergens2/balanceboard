import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdiCumulativeHoursComponent } from './adi-cumulative-hours.component';

describe('AdiCumulativeHoursComponent', () => {
  let component: AdiCumulativeHoursComponent;
  let fixture: ComponentFixture<AdiCumulativeHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdiCumulativeHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdiCumulativeHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
