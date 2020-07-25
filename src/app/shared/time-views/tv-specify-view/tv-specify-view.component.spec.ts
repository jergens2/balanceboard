import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvSpecifyViewComponent } from './tv-specify-view.component';

describe('TvSpecifyViewComponent', () => {
  let component: TvSpecifyViewComponent;
  let fixture: ComponentFixture<TvSpecifyViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvSpecifyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvSpecifyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
