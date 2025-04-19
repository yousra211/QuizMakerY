import { TestBed } from '@angular/core/testing';

import { MakequizService } from './makequiz.service';

describe('MakequizService', () => {
  let service: MakequizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MakequizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
