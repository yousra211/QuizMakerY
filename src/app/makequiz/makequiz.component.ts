import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamComponent } from '../exam/exam.component';
import { NgIf } from '@angular/common';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { QuestionComponent } from '../question/question.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-makequiz',
  standalone: true,
  imports: [NgIf , NgbModalModule],
  templateUrl: './makequiz.component.html',
  styleUrl: './makequiz.component.css',
  providers: [NgbActiveModal] 
})
export class MakequizComponent {
  backEndURL="http://localhost:8080/exams"
  makequizForm: FormGroup;
  constructor(private fb: FormBuilder ,private router: Router,public activeModal: NgbActiveModal) {
    this.makequizForm = this.fb.group({
      title: ['', [Validators.required]],
      duration: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  onSubmit() {
    if (this.makequizForm.valid) {
      console.log(this.makequizForm.value);
      // Future: Add method to save exam details
    }
  }

  

  openQuestion() {
    this.router.navigate(['/question']);
  }
}
