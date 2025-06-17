import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamParticipantComponent } from './exam-participant.component';

describe('ExamParticipantComponent', () => {
  let component: ExamParticipantComponent;
  let fixture: ComponentFixture<ExamParticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamParticipantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
