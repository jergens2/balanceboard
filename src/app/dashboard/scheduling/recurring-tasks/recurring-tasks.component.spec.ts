import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringTasksComponent } from './recurring-tasks.component';

describe('RecurringTasksComponent', () => {
  let component: RecurringTasksComponent;
  let fixture: ComponentFixture<RecurringTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
