import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityGoalsWidgetComponent } from './activity-goals-widget.component';

describe('ActivityGoalsWidgetComponent', () => {
  let component: ActivityGoalsWidgetComponent;
  let fixture: ComponentFixture<ActivityGoalsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityGoalsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityGoalsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
