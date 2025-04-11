import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoupeComponent } from './loupe.component';

describe('LoupeComponent', () => {
  let component: LoupeComponent;
  let fixture: ComponentFixture<LoupeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoupeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoupeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
