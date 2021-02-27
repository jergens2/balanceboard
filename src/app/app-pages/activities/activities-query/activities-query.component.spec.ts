import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesQueryComponent } from './activities-query.component';

describe('ActivitiesQueryComponent', () => {
  let component: ActivitiesQueryComponent;
  let fixture: ComponentFixture<ActivitiesQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
