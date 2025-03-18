import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakequizComponent } from './makequiz.component';

describe('MakequizComponent', () => {
  let component: MakequizComponent;
  let fixture: ComponentFixture<MakequizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakequizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakequizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
