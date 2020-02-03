import { TestBed } from '@angular/core/testing';

import { TimelogEntryFormService } from './timelog-entry-form.service';

describe('TimelogEntryFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimelogEntryFormService = TestBed.get(TimelogEntryFormService);
    expect(service).toBeTruthy();
  });
});
